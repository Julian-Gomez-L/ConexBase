import { normalizarEstado } from '@app/components/estado-badge/estado-badge.component';
import { codigoPedido, fechaMysql, PedidoVista } from '@app/models/pedido-vista.model';
import { fechaISO } from '@app/utils/fecha';
import { HistorialPedido } from './historial-pedido.model';
import { Usuario } from './usuario.model';

/** Estados que ya no cuentan como venta. */
const ESTADOS_ANULADOS = ['cancelado', 'rechazado'];
export const esActivo = (p: PedidoVista) => !ESTADOS_ANULADOS.includes(normalizarEstado(p.estado));

/** Orden en que se muestran los estados en los reportes. */
export const ORDEN_ESTADOS = [
  'Pendiente',
  'Confirmado',
  'En producción',
  'Finalizado',
  'Entregado',
  'Cancelado',
  'Rechazado',
];

// ── Pedidos del día ──────────────────────────────────────────────────────

export interface PagoDelDia {
  pedido: PedidoVista;
  monto: number;
  metodo: string;
  comprobante: string | null;
}

export interface MovimientoDelDia {
  fecha: Date;
  codigo: string;
  estadoAnterior: string | null;
  estadoNuevo: string;
  observacion: string | null;
  usuario: string;
}

export interface ResumenDelDia {
  creados: PedidoVista[];
  pagos: PagoDelDia[];
  movimientos: MovimientoDelDia[];
  valorVendido: number;
  abonos: number;
}

/**
 * Lo que pasó en un día (YYYY-MM-DD): pedidos creados, pagos recibidos y
 * cambios de estado. `pedidos` ya viene filtrado por alcance (ej. solo los
 * del asesor), y se ignora el historial de pedidos fuera de esa lista.
 */
export function resumenDelDia(
  pedidos: PedidoVista[],
  historial: HistorialPedido[],
  usuarios: Usuario[],
  dia: string,
): ResumenDelDia {
  const enAlcance = new Set(pedidos.map((p) => p.id));
  const nombres = new Map(usuarios.map((u) => [u.id, `${u.nombre} ${u.apellido}`.trim()]));

  const creados = pedidos
    .filter((p) => fechaISO(p.creadoEn) === dia)
    .sort((a, b) => a.creadoEn.getTime() - b.creadoEn.getTime());

  const pagos = pedidos.flatMap((pedido) =>
    pedido.abonos
      .filter((a) => a.fecha.slice(0, 10) === dia)
      .map((a) => ({ pedido, monto: a.monto, metodo: a.metodo, comprobante: a.comprobante })),
  );

  const movimientos = historial
    .filter((h) => enAlcance.has(h.pedido_id))
    .map((h) => ({ h, fecha: fechaMysql(h.fecha) }))
    .filter(({ fecha }) => fechaISO(fecha) === dia)
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
    .map(({ h, fecha }) => ({
      fecha,
      codigo: codigoPedido(h.pedido_id),
      estadoAnterior: h.estado_anterior,
      estadoNuevo: h.estado_nuevo ?? '',
      observacion: h.observacion,
      usuario: nombres.get(h.usuario_id) ?? `Usuario #${h.usuario_id}`,
    }));

  return {
    creados,
    pagos,
    movimientos,
    valorVendido: creados.reduce((s, p) => s + p.total, 0),
    abonos: pagos.reduce((s, p) => s + p.monto, 0),
  };
}

// ── Consolidado ──────────────────────────────────────────────────────────

export interface FilaEstado {
  estado: string;
  pedidos: number;
  valor: number;
  /** 0–100, relativo al estado con más pedidos (para la barra). */
  porcentaje: number;
}

export interface FilaAsesor {
  asesor: string;
  pedidos: number;
  vendido: number;
  recaudado: number;
  saldo: number;
}

export interface FilaProducto {
  producto: string;
  unidades: number;
  valor: number;
}

export interface Consolidado {
  pedidos: PedidoVista[];
  registrados: number;
  activos: number;
  valorVendido: number;
  recaudado: number;
  saldo: number;
  /** 0–100 */
  porcentajeRecaudado: number;
  porEstado: FilaEstado[];
  porAsesor: FilaAsesor[];
  productos: FilaProducto[];
}

/**
 * Resumen de los pedidos creados entre `desde` y `hasta` (YYYY-MM-DD, ambos
 * incluidos). Ventas, recaudo, asesores y productos cuentan solo pedidos
 * activos (sin cancelados ni rechazados); el desglose por estado los muestra todos.
 */
export function consolidar(pedidos: PedidoVista[], desde: string, hasta: string): Consolidado {
  const enPeriodo = pedidos.filter((p) => {
    const dia = fechaISO(p.creadoEn);
    return dia >= desde && dia <= hasta;
  });
  const activos = enPeriodo.filter(esActivo);
  const suma = (lista: PedidoVista[], campo: (p: PedidoVista) => number) =>
    lista.reduce((t, p) => t + campo(p), 0);

  const conteo = ORDEN_ESTADOS.map((estado) => {
    const lista = enPeriodo.filter((p) => normalizarEstado(p.estado) === normalizarEstado(estado));
    return { estado, pedidos: lista.length, valor: suma(lista, (p) => p.total) };
  });
  const maximo = Math.max(1, ...conteo.map((c) => c.pedidos));
  const porEstado = conteo.map((c) => ({ ...c, porcentaje: Math.round((c.pedidos / maximo) * 100) }));

  const asesores = new Map<string, FilaAsesor>();
  for (const p of activos) {
    const nombre = p.asesor ? `${p.asesor.nombre} ${p.asesor.apellido}`.trim() : `Asesor #${p.usuarioId}`;
    const fila = asesores.get(nombre) ?? { asesor: nombre, pedidos: 0, vendido: 0, recaudado: 0, saldo: 0 };
    fila.pedidos += 1;
    fila.vendido += p.total;
    fila.recaudado += p.pagado;
    fila.saldo += p.saldo;
    asesores.set(nombre, fila);
  }

  const productos = new Map<string, FilaProducto>();
  for (const item of activos.flatMap((p) => p.items)) {
    const fila = productos.get(item.nombre) ?? { producto: item.nombre, unidades: 0, valor: 0 };
    fila.unidades += item.cantidad;
    fila.valor += item.subtotal;
    productos.set(item.nombre, fila);
  }

  const valorVendido = suma(activos, (p) => p.total);
  const recaudado = suma(activos, (p) => p.pagado);
  return {
    pedidos: enPeriodo,
    registrados: enPeriodo.length,
    activos: activos.length,
    valorVendido,
    recaudado,
    saldo: suma(activos, (p) => p.saldo),
    porcentajeRecaudado: valorVendido ? Math.round((recaudado / valorVendido) * 100) : 0,
    porEstado,
    porAsesor: [...asesores.values()].sort((a, b) => b.vendido - a.vendido),
    productos: [...productos.values()].sort((a, b) => b.unidades - a.unidades || b.valor - a.valor),
  };
}

/** CSV (separado por ; para que Excel en español lo abra en columnas). */
export function consolidadoCsv(pedidos: PedidoVista[]): string {
  const celda = (v: string | number) => {
    const texto = String(v);
    return /[;"\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  const filas = [
    ['Código', 'Fecha', 'Cliente', 'Documento', 'Asesor', 'Estado', 'Total', 'Pagado', 'Saldo'],
    ...pedidos.map((p) => [
      p.codigo,
      fechaISO(p.creadoEn),
      p.cliente?.nombre ?? '',
      p.cliente?.documento ?? '',
      p.asesor ? `${p.asesor.nombre} ${p.asesor.apellido}`.trim() : '',
      p.estado,
      Math.round(p.total),
      Math.round(p.pagado),
      Math.round(p.saldo),
    ]),
  ];
  return filas.map((f) => f.map(celda).join(';')).join('\r\n');
}
