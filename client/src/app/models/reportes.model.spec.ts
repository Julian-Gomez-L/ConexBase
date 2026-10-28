import { describe, expect, it } from 'vitest';
import { HistorialPedido, Usuario } from '@app/models';
import { PedidoVista } from './pedido-vista.model';
import { consolidadoCsv, consolidar, resumenDelDia } from './reportes.model';

const vista = (
  id: number,
  estado: string,
  total: number,
  pagado: number,
  creado: string,
  usuarioId = 2,
): PedidoVista => ({
  id,
  codigo: `RM-0000${id}`,
  estado,
  usuarioId,
  clienteId: 1,
  total,
  pagado,
  saldo: total - pagado,
  creadoEn: new Date(creado),
  cliente: { id: 1, documento: '1', nombre: 'Ana; "la grande"', telefono: '', correo: '', direccion: null, estado: true, created_at: null, updated_at: null },
  asesor: { id: usuarioId, documento: '', nombre: usuarioId === 2 ? 'Juan' : 'Vale', apellido: 'X', correo: '', rol_id: 2, estado: true, created_at: null, updated_at: null },
  items: [{ productoId: 1, nombre: 'Sofa', cantidad: 2, subtotal: total }],
  abonos: pagado ? [{ monto: pagado, metodo: 'Efectivo', comprobante: null, fecha: creado.slice(0, 10) }] : [],
  rechazo: null,
});

describe('resumenDelDia', () => {
  const pedidos = [
    vista(1, 'Pendiente', 1_000_000, 300_000, '2026-10-27T10:00:00'),
    vista(2, 'Confirmado', 500_000, 0, '2026-10-26T09:00:00'),
  ];
  const historial: HistorialPedido[] = [
    { id: 1, pedido_id: 1, usuario_id: 2, cliente_id: 1, estado_anterior: null, estado_nuevo: 'Pendiente', observacion: 'Pedido creado', fecha: '2026-10-27 10:00:00', created_at: null, updated_at: null },
    { id: 2, pedido_id: 2, usuario_id: 5, cliente_id: 1, estado_anterior: 'Pendiente', estado_nuevo: 'Confirmado', observacion: 'ok', fecha: '2026-10-27 15:30:00', created_at: null, updated_at: null },
    { id: 3, pedido_id: 99, usuario_id: 5, cliente_id: 1, estado_anterior: 'Pendiente', estado_nuevo: 'Confirmado', observacion: 'fuera', fecha: '2026-10-27 16:00:00', created_at: null, updated_at: null },
  ];
  const usuarios = [{ id: 5, nombre: 'Sofia', apellido: 'Castro' }] as Usuario[];

  it('reúne creados, pagos y cambios de estado de ese día, en orden', () => {
    const r = resumenDelDia(pedidos, historial, usuarios, '2026-10-27');
    expect(r.creados.map((p) => p.id)).toEqual([1]);
    expect(r.valorVendido).toBe(1_000_000);
    expect(r.abonos).toBe(300_000);
    // El historial de un pedido fuera del alcance (id 99) no aparece
    expect(r.movimientos.map((m) => [m.codigo, m.estadoNuevo, m.usuario])).toEqual([
      ['RM-00001', 'Pendiente', 'Usuario #2'],
      ['RM-00002', 'Confirmado', 'Sofia Castro'],
    ]);
  });

  it('un día sin actividad queda vacío', () => {
    const r = resumenDelDia(pedidos, historial, usuarios, '2026-10-01');
    expect([r.creados.length, r.pagos.length, r.movimientos.length]).toEqual([0, 0, 0]);
  });
});

describe('consolidar', () => {
  const pedidos = [
    vista(1, 'Pendiente', 2_000_000, 1_000_000, '2026-10-20T10:00:00'),
    vista(2, 'Entregado', 1_000_000, 1_000_000, '2026-10-05T10:00:00', 3),
    vista(3, 'Cancelado', 900_000, 0, '2026-10-10T10:00:00'),
    vista(4, 'Pendiente', 5_000_000, 0, '2026-08-01T10:00:00'),
  ];
  const c = consolidar(pedidos, '2026-10-01', '2026-10-31');

  it('suma ventas y recaudo sin cancelados/rechazados, y solo del periodo', () => {
    expect([c.registrados, c.activos]).toEqual([3, 2]);
    expect(c.valorVendido).toBe(3_000_000);
    expect(c.recaudado).toBe(2_000_000);
    expect(c.saldo).toBe(1_000_000);
    expect(c.porcentajeRecaudado).toBe(67);
  });

  it('desglosa por estado (todos), asesor y producto (solo activos)', () => {
    expect(c.porEstado.find((e) => e.estado === 'Cancelado')?.pedidos).toBe(1);
    expect(c.porAsesor.map((a) => [a.asesor, a.vendido])).toEqual([
      ['Juan X', 2_000_000],
      ['Vale X', 1_000_000],
    ]);
    expect(c.productos).toEqual([{ producto: 'Sofa', unidades: 4, valor: 3_000_000 }]);
  });

  it('exporta CSV con ; y escapa comillas y separadores', () => {
    const csv = consolidadoCsv(c.pedidos).split('\r\n');
    expect(csv[0]).toBe('Código;Fecha;Cliente;Documento;Asesor;Estado;Total;Pagado;Saldo');
    expect(csv).toHaveLength(4);
    expect(csv[1]).toContain('"Ana; ""la grande"""');
  });
});
