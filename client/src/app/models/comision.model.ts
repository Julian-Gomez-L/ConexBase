import { normalizarEstado } from '@app/components/estado-badge/estado-badge.component';
import { ESTADO_COMISIONABLE, ESTADOS_EN_CURSO } from '@app/config/comisiones';
import { HistorialPedido } from './historial-pedido.model';
import { PedidoVista } from './pedido-vista.model';

export interface ComisionPedido {
  pedido: PedidoVista;
  /** Fecha en que se entregó (historial); en pedidos en curso, la fecha de creación. */
  fecha: Date;
  comision: number;
}

export interface ComisionMes {
  /** "2026-10" para ordenar */
  clave: string;
  /** "Octubre de 2026" */
  etiqueta: string;
  pedidos: number;
  ventas: number;
  comision: number;
}

export interface ResumenComisiones {
  ganadas: ComisionPedido[];
  porGanar: ComisionPedido[];
  meses: ComisionMes[];
  totalGanado: number;
  totalVentas: number;
  totalPorGanar: number;
  ganadoEsteMes: number;
}

const claveMes = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

function etiquetaMes(d: Date): string {
  const texto = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Función PURA: calcula las comisiones de un asesor.
 * - Ganada: pedido Entregado → tasa × total, en el mes en que se entregó.
 * - Por ganar: pedido Confirmado, En producción o Finalizado.
 * Pendientes, cancelados y rechazados no generan comisión.
 */
export function calcularComisiones(
  pedidos: PedidoVista[],
  historial: HistorialPedido[],
  asesorId: number,
  tasa: number,
  hoy = new Date(),
): ResumenComisiones {
  const entregado = normalizarEstado(ESTADO_COMISIONABLE);
  const enCurso = ESTADOS_EN_CURSO.map(normalizarEstado);

  // Fecha de entrega = última entrada del historial que pasó a "Entregado"
  const fechaEntrega = new Map<number, Date>();
  for (const h of historial) {
    if (normalizarEstado(h.estado_nuevo ?? '') !== entregado) continue;
    const fecha = new Date(h.fecha.replace(' ', 'T'));
    const previa = fechaEntrega.get(h.pedido_id);
    if (!previa || fecha > previa) fechaEntrega.set(h.pedido_id, fecha);
  }

  const comision = (total: number) => Math.round(total * tasa);
  const propios = pedidos.filter((p) => p.usuarioId === asesorId);

  const ganadas = propios
    .filter((p) => normalizarEstado(p.estado) === entregado)
    .map((p) => ({ pedido: p, fecha: fechaEntrega.get(p.id) ?? p.creadoEn, comision: comision(p.total) }))
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  const porGanar = propios
    .filter((p) => enCurso.includes(normalizarEstado(p.estado)))
    .map((p) => ({ pedido: p, fecha: p.creadoEn, comision: comision(p.total) }))
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  const porMes = new Map<string, ComisionMes>();
  for (const g of ganadas) {
    const clave = claveMes(g.fecha);
    const mes = porMes.get(clave) ?? {
      clave,
      etiqueta: etiquetaMes(g.fecha),
      pedidos: 0,
      ventas: 0,
      comision: 0,
    };
    mes.pedidos += 1;
    mes.ventas += g.pedido.total;
    mes.comision += g.comision;
    porMes.set(clave, mes);
  }
  const meses = [...porMes.values()].sort((a, b) => b.clave.localeCompare(a.clave));

  const suma = (lista: ComisionPedido[], campo: (c: ComisionPedido) => number) =>
    lista.reduce((t, c) => t + campo(c), 0);

  return {
    ganadas,
    porGanar,
    meses,
    totalGanado: suma(ganadas, (c) => c.comision),
    totalVentas: suma(ganadas, (c) => c.pedido.total),
    totalPorGanar: suma(porGanar, (c) => c.comision),
    ganadoEsteMes: porMes.get(claveMes(hoy))?.comision ?? 0,
  };
}
