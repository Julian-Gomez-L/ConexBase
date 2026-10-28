import { describe, expect, it } from 'vitest';
import { calcularComisiones, comisionesPorAsesor } from './comision.model';
import { Usuario } from './usuario.model';
import { HistorialPedido } from './historial-pedido.model';
import { PedidoVista } from './pedido-vista.model';

const pedido = (id: number, estado: string, total: number, usuarioId = 2): PedidoVista => ({
  id,
  codigo: `RM-${id}`,
  estado,
  usuarioId,
  clienteId: 1,
  total,
  pagado: 0,
  saldo: total,
  creadoEn: new Date('2026-09-01T10:00:00'),
  cliente: null,
  asesor: null,
  items: [],
  abonos: [],
  rechazo: null,
});

const entrega = (pedidoId: number, fecha: string): HistorialPedido => ({
  id: pedidoId,
  pedido_id: pedidoId,
  usuario_id: 1,
  cliente_id: 1,
  estado_anterior: 'Finalizado',
  estado_nuevo: 'Entregado',
  observacion: null,
  fecha,
  created_at: null,
  updated_at: null,
});

describe('calcularComisiones', () => {
  const pedidos = [
    pedido(1, 'Entregado', 1_550_000),
    pedido(2, 'Entregado', 1_000_000),
    pedido(3, 'En producción', 1_300_000),
    pedido(4, 'Confirmado', 500_000),
    pedido(5, 'Pendiente', 2_000_000),
    pedido(6, 'Cancelado', 900_000),
    pedido(7, 'Entregado', 9_999_999, 99), // de otro asesor
  ];
  const historial = [entrega(1, '2026-10-05 11:00:00'), entrega(2, '2026-09-20 09:00:00')];
  const r = calcularComisiones(pedidos, historial, 2, 0.05, new Date('2026-10-28T12:00:00'));

  it('gana el 5 % solo sobre los pedidos entregados del asesor', () => {
    expect(r.ganadas.map((c) => c.pedido.id)).toEqual([1, 2]);
    expect(r.totalGanado).toBe(77_500 + 50_000);
    expect(r.totalVentas).toBe(2_550_000);
  });

  it('confirmados y en producción quedan por ganar; pendientes y cancelados no cuentan', () => {
    expect(r.porGanar.map((c) => c.pedido.id).sort()).toEqual([3, 4]);
    expect(r.totalPorGanar).toBe(65_000 + 25_000);
  });

  it('agrupa por el mes de entrega (no el de creación)', () => {
    expect(r.meses.map((m) => [m.clave, m.comision])).toEqual([
      ['2026-10', 77_500],
      ['2026-09', 50_000],
    ]);
    expect(r.ganadoEsteMes).toBe(77_500);
  });
});

describe('comisionesPorAsesor', () => {
  const pedidos = [
    pedido(1, 'Entregado', 1_550_000, 2),
    pedido(2, 'Entregado', 1_000_000, 2),
    pedido(3, 'En producción', 1_300_000, 2),
    pedido(4, 'Confirmado', 1_800_000, 6),
  ];
  const historial = [entrega(1, '2026-10-05 11:00:00'), entrega(2, '2026-09-20 09:00:00')];
  const asesores = [
    { id: 6, nombre: 'Valentina', apellido: 'Suarez' },
    { id: 2, nombre: 'Juan', apellido: 'Perez' },
  ] as Usuario[];
  const hoy = new Date('2026-10-28T12:00:00');

  it('filtra lo ganado por el mes elegido y mantiene lo por ganar', () => {
    const r = comisionesPorAsesor(pedidos, historial, asesores, 0.05, '2026-10', hoy);
    expect(r.filas.map((f) => [f.asesor.nombre, f.entregados.length, f.comision, f.totalPorGanar])).toEqual([
      ['Juan', 1, 77_500, 65_000],
      ['Valentina', 0, 0, 90_000],
    ]);
    expect(r.totales).toEqual({ entregados: 1, ventas: 1_550_000, comision: 77_500, porGanar: 155_000, enCurso: 2 });
  });

  it('ofrece los meses con entregas más el actual', () => {
    const r = comisionesPorAsesor(pedidos, historial, asesores, 0.05, '2026-09', hoy);
    expect(r.meses.map((m) => m.clave)).toEqual(['2026-10', '2026-09']);
    expect(r.filas.find((f) => f.asesor.id === 2)?.comision).toBe(50_000);
  });
});
