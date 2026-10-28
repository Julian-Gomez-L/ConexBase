import { Cliente, DetallePedido, HistorialPedido, Pago, Pedido, Producto, Usuario } from '@app/models';
import { aNumero } from '@app/utils/format';

/** Línea de un pedido lista para mostrar (detalle + nombre del producto). */
export interface ItemVista {
  productoId: number;
  nombre: string;
  cantidad: number;
  subtotal: number;
}

/** Un pago (abono) del pedido, listo para mostrar. */
export interface AbonoVista {
  monto: number;
  metodo: string;
  comprobante: string | null;
  /** YYYY-MM-DD */
  fecha: string;
}

/**
 * Modelo de PANTALLA: un pedido con todo lo que la interfaz necesita.
 * La API devuelve solo IDs (cliente_id, usuario_id…), así que aquí se "une" en el cliente.
 */
export interface PedidoVista {
  id: number;
  codigo: string;
  estado: string;
  /** ID del asesor que creó el pedido (pedidos.usuario_id). */
  usuarioId: number;
  /** pedidos.cliente_id (aunque el cliente ya no exista). */
  clienteId: number;
  total: number;
  pagado: number;
  saldo: number;
  creadoEn: Date;
  cliente: Cliente | null;
  asesor: Usuario | null;
  items: ItemVista[];
  abonos: AbonoVista[];
  /** Motivo y fecha del último rechazo (si el pedido está Rechazado). */
  rechazo: { motivo: string; fecha: Date } | null;
}

export interface DatosPedidos {
  pedidos: Pedido[];
  clientes: Cliente[];
  usuarios: Usuario[];
  detalles: DetallePedido[];
  productos: Producto[];
  pagos: Pago[];
  /** Opcional: si se envía, se completa `rechazo` con el motivo registrado. */
  historial?: HistorialPedido[];
}

/** "2026-10-27 10:00:00" (DATETIME de MySQL) → Date en hora local. */
export const fechaMysql = (valor: string): Date => new Date(valor.replace(' ', 'T'));

/** Agrupa una lista en un Map por clave (equivale a Map.groupBy, que aún no está en el `lib` del proyecto). */
function agruparPor<T, K>(items: T[], clave: (item: T) => K): Map<K, T[]> {
  const grupos = new Map<K, T[]>();
  for (const item of items) {
    const k = clave(item);
    const grupo = grupos.get(k);
    if (grupo) grupo.push(item);
    else grupos.set(k, [item]);
  }
  return grupos;
}

/** RM-00001, igual que en la maqueta. */
export const codigoPedido = (id: number): string => `RM-${String(id).padStart(5, '0')}`;

/** Función PURA (sin HTTP): fácil de probar con una prueba unitaria. */
export function construirVistas(d: DatosPedidos): PedidoVista[] {
  const clientes = new Map(d.clientes.map((c) => [c.id, c]));
  const usuarios = new Map(d.usuarios.map((u) => [u.id, u]));
  const productos = new Map(d.productos.map((p) => [p.id, p]));

  const detallesPorPedido = agruparPor(d.detalles, (x) => x.pedido_id);
  const pagosPorPedido = agruparPor(d.pagos, (x) => x.pedido_id);

  // Último rechazo de cada pedido (el historial guarda el motivo en `observacion`)
  const rechazos = new Map<number, { motivo: string; fecha: Date }>();
  for (const h of d.historial ?? []) {
    if ((h.estado_nuevo ?? '').toLowerCase() !== 'rechazado') continue;
    const fecha = fechaMysql(h.fecha);
    const previo = rechazos.get(h.pedido_id);
    if (!previo || fecha >= previo.fecha) {
      rechazos.set(h.pedido_id, { motivo: h.observacion ?? '', fecha });
    }
  }

  return d.pedidos
    .map((p): PedidoVista => {
      const total = aNumero(p.total);
      const pagado = (pagosPorPedido.get(p.id) ?? []).reduce(
        (suma, pago) => suma + aNumero(pago.monto),
        0,
      );
      return {
        id: p.id,
        codigo: codigoPedido(p.id),
        estado: p.estado,
        usuarioId: p.usuario_id,
        clienteId: p.cliente_id,
        total,
        pagado,
        saldo: Math.max(total - pagado, 0),
        creadoEn: new Date(p.created_at ?? Date.now()),
        cliente: clientes.get(p.cliente_id) ?? null,
        asesor: usuarios.get(p.usuario_id) ?? null,
        items: (detallesPorPedido.get(p.id) ?? []).map((det) => ({
          productoId: det.producto_id,
          nombre: productos.get(det.producto_id)?.nombre ?? `Producto #${det.producto_id}`,
          cantidad: det.cantidad,
          subtotal: aNumero(det.subtotal),
        })),
        abonos: (pagosPorPedido.get(p.id) ?? []).map((pago) => ({
          monto: aNumero(pago.monto),
          metodo: pago.metodo,
          comprobante: pago.comprobante,
          fecha: pago.fecha_pago,
        })),
        rechazo: p.estado.toLowerCase() === 'rechazado' ? (rechazos.get(p.id) ?? null) : null,
      };
    })
    .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime() || b.id - a.id);
}
