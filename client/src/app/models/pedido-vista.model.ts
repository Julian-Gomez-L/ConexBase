import { Cliente, DetallePedido, HistorialPedido, Pago, Pedido, Producto, Usuario } from '@app/models';
import { nombreProducto } from './producto.model';
import { aNumero } from '@app/utils/format';

/** Nombre con medida, o "Producto #id" si el producto ya no existe. */
const nombreDe = (p: Producto | undefined, id: number): string => (p ? nombreProducto(p) : `Producto #${id}`);

/** Línea de un pedido lista para mostrar (detalle + nombre del producto). */
export interface ItemVista {
  /** ID del detalle (detalle_pedidos.id): identifica el producto dentro del pedido. */
  detalleId: number;
  /** Solo en pedidos anteriores al cambio (catálogo). */
  productoId: number | null;
  /** El diseño; en pedidos viejos, el nombre del producto del catálogo. */
  nombre: string;
  descripcion: string | null;
  colorTela: string | null;
  tipoTela: string | null;
  /** "Tela lino · color gris" (vacío en pedidos viejos). */
  tela: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

/** "Tela lino · color gris" (vacío si el producto no tiene esas especificaciones). */
export function detalleTela(item: Pick<ItemVista, 'tipoTela' | 'colorTela'>): string {
  return [item.tipoTela && `Tela ${item.tipoTela}`, item.colorTela && `color ${item.colorTela}`]
    .filter(Boolean)
    .join(' · ');
}

/**
 * El producto del pedido que corresponde a una producción: por el detalle
 * (producciones nuevas) o por el producto del catálogo (las viejas).
 */
export function itemDeProduccion(
  pedido: PedidoVista | undefined,
  produccion: { detalle_pedido_id?: number | null; producto_id: number | null },
): ItemVista | undefined {
  if (!pedido) return undefined;
  return produccion.detalle_pedido_id
    ? pedido.items.find((i) => i.detalleId === produccion.detalle_pedido_id)
    : pedido.items.find((i) => i.productoId !== null && i.productoId === produccion.producto_id);
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
  /** Lugar de entrega. null en pedidos anteriores al cambio. */
  localidad: string | null;
  /** Valor del pedido, con el recargo incluido. */
  total: number;
  /** Recargo por el método de pago (Addi: 10 %). 0 si no hay. */
  recargo: number;
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
        recargo: aNumero(p.recargo),
        pagado,
        saldo: Math.max(total - pagado, 0),
        creadoEn: new Date(p.created_at ?? Date.now()),
        cliente: clientes.get(p.cliente_id) ?? null,
        asesor: usuarios.get(p.usuario_id) ?? null,
        localidad: p.localidad ?? null,
        items: (detallesPorPedido.get(p.id) ?? []).map((det) => ({
          detalleId: det.id,
          productoId: det.producto_id ?? null,
          nombre:
            det.diseno?.trim() ||
            (det.producto_id !== null && det.producto_id !== undefined
              ? nombreDe(productos.get(det.producto_id), det.producto_id)
              : 'Producto'),
          descripcion: det.descripcion ?? null,
          colorTela: det.color_tela ?? null,
          tipoTela: det.tipo_tela ?? null,
          tela: detalleTela({ tipoTela: det.tipo_tela ?? null, colorTela: det.color_tela ?? null }),
          cantidad: det.cantidad,
          precioUnitario: aNumero(det.precio_unitario),
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
