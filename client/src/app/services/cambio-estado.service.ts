import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { Pedido } from '@app/models';
import { HistorialPedidosService, PedidosService } from '@app/services/api';
import { AuthService } from '@app/services/auth.service';
import { ahoraMysql } from '@app/utils/fecha';

/** Lo mínimo que se necesita saber de un pedido para cambiarle el estado. */
export interface PedidoACambiar {
  id: number;
  estado: string;
  /** ID del cliente (el historial lo guarda). */
  clienteId: number;
}

/**
 * Cambia el estado de un pedido y deja constancia en el historial
 * (estado anterior → nuevo, quién, cuándo y la observación o motivo).
 * Lo usan Confirmación y Fabricación.
 */
@Injectable({ providedIn: 'root' })
export class CambioEstadoService {
  private readonly auth = inject(AuthService);
  private readonly pedidos = inject(PedidosService);
  private readonly historial = inject(HistorialPedidosService);

  cambiar(pedido: PedidoACambiar, nuevoEstado: string, observacion: string): Observable<Pedido> {
    const usuarioId = this.auth.sesion()?.usuarioId;
    if (!usuarioId) throw new Error('No hay una sesión activa.');

    return this.pedidos.actualizar(pedido.id, { estado: nuevoEstado }).pipe(
      switchMap((actualizado) =>
        this.historial
          .crear({
            pedido_id: pedido.id,
            usuario_id: usuarioId,
            cliente_id: pedido.clienteId,
            estado_anterior: pedido.estado,
            estado_nuevo: nuevoEstado,
            observacion,
            fecha: ahoraMysql(),
          })
          .pipe(map(() => actualizado)),
      ),
    );
  }
}
