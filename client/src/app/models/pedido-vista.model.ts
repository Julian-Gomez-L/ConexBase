import { Cliente, DetallePedido, Pago, Pedido, Producto, Usuario } from '@app/models';
import { aNumero } from '@app/utils/format';

/** Línea de un pedido lista para mostrar (detalle + nombre del producto). */
export interface ItemVista {
  productoId: number;
  nombre: string;
  cantidad: number;
  subtotal: number;
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
  total: number;
  pagado: number;
  saldo: number;
  creadoEn: Date;
  cliente: Cliente | null;
  asesor: Usuario | null;
  items: ItemVista[];
}

export interface DatosPedidos {
  pedidos: Pedido[];
  clientes: Cliente[];
  usuarios: Usuario[];
  detalles: DetallePedido[];
  productos: Producto[];
  pagos: Pago[];
}

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
      };
    })
    .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime() || b.id - a.id);
}
