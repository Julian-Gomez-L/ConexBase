import { normalizarEstado } from '@app/components/estado-badge/estado-badge.component';
import { PedidoVista } from './pedido-vista.model';

export interface LineaFactura {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Factura {
  numero: string;
  fecha: Date;
  pedido: PedidoVista;
  lineas: LineaFactura[];
  unidades: number;
  total: number;
  abonado: number;
  saldo: number;
  /** El pedido fue rechazado o cancelado: la factura sale marcada como ANULADA. */
  anulada: boolean;
}

const ANULADOS = ['rechazado', 'cancelado'];

/** Función PURA: la factura de un pedido (número = código del pedido). */
export function construirFactura(pedido: PedidoVista): Factura {
  const lineas = pedido.items.map((i) => ({
    descripcion: i.nombre,
    cantidad: i.cantidad,
    precioUnitario: i.cantidad > 0 ? Math.round(i.subtotal / i.cantidad) : i.subtotal,
    subtotal: i.subtotal,
  }));
  return {
    numero: pedido.codigo,
    fecha: pedido.creadoEn,
    pedido,
    lineas,
    unidades: lineas.reduce((s, l) => s + l.cantidad, 0),
    total: pedido.total,
    abonado: pedido.pagado,
    saldo: pedido.saldo,
    anulada: ANULADOS.includes(normalizarEstado(pedido.estado)),
  };
}

/**
 * Función PURA: pedidos para el listado de Facturas, el más reciente primero.
 * Busca por código, cliente o documento. Los rechazados y cancelados solo
 * salen si `incluirAnulados` es true.
 */
export function buscarParaFacturar(pedidos: PedidoVista[], texto: string, incluirAnulados = false): PedidoVista[] {
  const q = normalizarEstado(texto.trim());
  return pedidos
    .filter((p) => incluirAnulados || !ANULADOS.includes(normalizarEstado(p.estado)))
    .filter(
      (p) =>
        !q ||
        normalizarEstado(p.codigo).includes(q) ||
        normalizarEstado(p.cliente?.nombre ?? '').includes(q) ||
        (p.cliente?.documento ?? '').includes(texto.trim()),
    )
    .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime());
}
