import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Pedido } from '@app/models';
import { AuthService } from '@app/services/auth.service';
import {
  ClientesService,
  DetallePedidosService,
  HistorialPedidosService,
  PagosService,
  PedidosService,
} from '@app/services/api';

/** Datos de un cliente que aún no existe en la base de datos. */
export interface ClienteNuevo {
  documento: string;
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string | null;
}

export interface LineaPedido {
  productoId: number;
  cantidad: number;
  /** Precio del producto al momento de la venta. */
  precioUnitario: number;
}

export interface Abono {
  monto: number;
  metodo: string;
  comprobante: string | null;
}

export interface NuevoPedido {
  /** ID de un cliente existente, o los datos para registrarlo. */
  cliente: number | ClienteNuevo;
  lineas: LineaPedido[];
  abono: Abono | null;
}

/** Estado con el que nace todo pedido (lo revisa luego el Confirmador). */
export const ESTADO_INICIAL = 'Pendiente';

/** "2026-10-28 14:05:00" en hora local (formato DATETIME de MySQL). */
function ahoraMysql(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/**
 * Registra un pedido completo usando el CRUD de la API, en este orden:
 *   1. el cliente, si es nuevo
 *   2. el pedido (estado Pendiente, a nombre del asesor que inició sesión)
 *   3. sus detalles (en paralelo)
 *   4. el abono, si lo hay
 *   5. la primera entrada del historial (∅ → Pendiente)
 *
 * El total se calcula aquí con el precio de cada producto; el pedido queda
 * a nombre del usuario de la sesión, no de un valor que escriba el usuario.
 */
@Injectable({ providedIn: 'root' })
export class CrearPedidoService {
  private readonly auth = inject(AuthService);
  private readonly clientes = inject(ClientesService);
  private readonly pedidos = inject(PedidosService);
  private readonly detalles = inject(DetallePedidosService);
  private readonly pagos = inject(PagosService);
  private readonly historial = inject(HistorialPedidosService);

  static total(lineas: LineaPedido[]): number {
    return lineas.reduce((suma, l) => suma + l.precioUnitario * l.cantidad, 0);
  }

  crear(datos: NuevoPedido): Observable<Pedido> {
    const asesorId = this.auth.sesion()?.usuarioId;
    if (!asesorId) throw new Error('No hay una sesión activa.');

    const total = CrearPedidoService.total(datos.lineas);
    const hoy = ahoraMysql();

    const cliente$: Observable<number> =
      typeof datos.cliente === 'number'
        ? of(datos.cliente)
        : this.clientes.crear({ ...datos.cliente, estado: true }).pipe(map((c) => c.id));

    return cliente$.pipe(
      switchMap((clienteId) =>
        this.pedidos
          .crear({ cliente_id: clienteId, usuario_id: asesorId, estado: ESTADO_INICIAL, total: String(total) })
          .pipe(map((pedido) => ({ pedido, clienteId }))),
      ),
      switchMap(({ pedido, clienteId }) => {
        const detalles$ = forkJoin(
          datos.lineas.map((l) =>
            this.detalles.crear({
              pedido_id: pedido.id,
              producto_id: l.productoId,
              cantidad: l.cantidad,
              precio_unitario: String(l.precioUnitario),
              subtotal: String(l.precioUnitario * l.cantidad),
            }),
          ),
        );
        const abono$ = datos.abono
          ? this.pagos.crear({
              pedido_id: pedido.id,
              usuario_id: asesorId,
              monto: String(datos.abono.monto),
              metodo: datos.abono.metodo,
              fecha_pago: hoy.slice(0, 10),
              comprobante: datos.abono.comprobante,
            })
          : of(null);

        return forkJoin([detalles$, abono$]).pipe(
          switchMap(() =>
            this.historial.crear({
              pedido_id: pedido.id,
              usuario_id: asesorId,
              cliente_id: clienteId,
              estado_anterior: null,
              estado_nuevo: ESTADO_INICIAL,
              observacion: 'Pedido creado',
              fecha: hoy,
            }),
          ),
          map(() => pedido),
        );
      }),
    );
  }
}
