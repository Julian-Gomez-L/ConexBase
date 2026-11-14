import { normalizarEstado } from '@app/components/estado-badge/estado-badge.component';
import { PedidoVista } from './pedido-vista.model';

export interface LineaFactura {
  /** Diseño (en pedidos viejos, el nombre del producto del catálogo). */
  diseno: string;
  descripcion: string | null;
  tipoTela: string | null;
  colorTela: string | null;
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
  /** Valor de los productos (sin recargo). */
  subtotal: number;
  /** Recargo por pagar con Addi (10 %); 0 si no aplica. */
  recargo: number;
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
    diseno: i.nombre,
    descripcion: i.descripcion,
    tipoTela: i.tipoTela,
    colorTela: i.colorTela,
    cantidad: i.cantidad,
    precioUnitario: i.precioUnitario || (i.cantidad > 0 ? Math.round(i.subtotal / i.cantidad) : i.subtotal),
    subtotal: i.subtotal,
  }));
  return {
    numero: pedido.codigo,
    fecha: pedido.creadoEn,
    pedido,
    lineas,
    unidades: lineas.reduce((s, l) => s + l.cantidad, 0),
    subtotal: pedido.total - (pedido.recargo ?? 0),
    recargo: pedido.recargo ?? 0,
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
        (p.cliente?.documento ?? '').includes(texto.trim()) ||
        normalizarEstado(p.localidad ?? '').includes(q),
    )
    .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime());
}
