import { describe, expect, it } from 'vitest';
import { construirMisTrabajos, trabajosDeLaSemana } from './mis-trabajos.model';
import { pagosDeLaSemana } from './pagos-tapiceros.model';
import { lunesDe } from '@app/utils/fecha';
import { PedidoVista } from './pedido-vista.model';
import { Produccion } from './produccion.model';
import { TrabajoTapicero } from './trabajo-tapicero.model';
import { Usuario } from './usuario.model';

const base = { created_at: null, updated_at: null };

const trabajo = (id: number, produccionId: number, usuarioId: number, estado: string, inicio: string, fin: string | null = null): TrabajoTapicero => ({
  id,
  produccion_id: produccionId,
  usuario_id: usuarioId,
  cantidad: null,
  descripcion: `Trabajo ${id}`,
  fecha_inicio: inicio,
  fecha_fin: fin,
  estado,
  observaciones: null,
  ...base,
});

const produccion: Produccion = {
  id: 1,
  pedido_id: 2,
  producto_id: 5,
  detalle_pedido_id: null,
  usuario_id: 3,
  fecha_inicio: '2026-10-12',
  fecha_fin: null,
  estado: 'En proceso',
  observaciones: null,
  ...base,
};

const pedido = {
  id: 2,
  codigo: 'RM-00002',
  cliente: { nombre: 'Laura Torres' },
  items: [{ productoId: 5, nombre: 'Silla comedor', cantidad: 2, subtotal: 0, detalleId: 1, tela: '' }],
} as unknown as PedidoVista;

const usuarios = [{ id: 3, nombre: 'Andres', apellido: 'Gomez' }] as Usuario[];

describe('construirMisTrabajos', () => {
  const trabajos = [
    trabajo(1, 1, 4, 'Pendiente', '2026-10-20'),
    trabajo(2, 1, 4, 'En proceso', '2026-10-25'),
    trabajo(3, 1, 4, 'Finalizado', '2026-09-28', '2026-10-02'),
    trabajo(4, 1, 4, 'Finalizado', '2026-09-01', '2026-09-10'),
    trabajo(5, 1, 9, 'En proceso', '2026-10-01'), // de otro tapicero
  ];
  const r = construirMisTrabajos(trabajos, [produccion], [pedido], usuarios, 4, new Date(2026, 9, 28));

  it('muestra solo los trabajos del tapicero, en proceso primero', () => {
    expect(r.activos.map((m) => m.trabajo.id)).toEqual([2, 1]);
    expect(r.terminados.map((m) => m.trabajo.id)).toEqual([3, 4]);
  });

  it('une el trabajo con pedido, cliente, producto, cantidad y quién lo asignó', () => {
    const m = r.activos[0];
    expect([m.pedidoCodigo, m.cliente, m.producto, m.cantidad, m.asignadoPor]).toEqual([
      'RM-00002',
      'Laura Torres',
      'Silla comedor',
      2,
      'Andres Gomez',
    ]);
    expect(m.inicio?.getDate()).toBe(25); // fecha DATE leída en hora local
  });

  it('cuenta en proceso, por empezar y terminados del mes', () => {
    expect(r.resumen).toEqual({ enProceso: 1, porEmpezar: 1, terminadosEsteMes: 1 });
  });
});

describe('trabajos de la semana y pagos a tapiceros', () => {
  const conPago = (t: TrabajoTapicero, valor: string | null, revisado = false): TrabajoTapicero => ({
    ...t,
    valor,
    observacion_valor: valor ? 'ok' : null,
    revisado_en: revisado ? '2026-11-14 10:00:00' : null,
  });
  // Semana del lunes 9 al domingo 15 de noviembre de 2026
  const trabajos = [
    conPago(trabajo(1, 1, 4, 'Finalizado', '2026-11-05', '2026-11-09'), '120000.00', true),
    conPago(trabajo(2, 1, 4, 'Finalizado', '2026-11-10', '2026-11-15'), '80000.00'),
    conPago(trabajo(3, 1, 4, 'Finalizado', '2026-11-10', '2026-11-12'), null),
    conPago(trabajo(4, 1, 4, 'Finalizado', '2026-11-01', '2026-11-08'), '50000.00'), // semana anterior
    conPago(trabajo(5, 1, 4, 'En proceso', '2026-11-12'), null),
    conPago(trabajo(6, 1, 9, 'Finalizado', '2026-11-10', '2026-11-11'), '30000.00'),
  ];
  const tapiceros = [
    ...usuarios,
    { id: 4, nombre: 'Miguel', apellido: 'Martinez' },
    { id: 9, nombre: 'Carlos', apellido: 'Rojas' },
  ] as Usuario[];
  const lunes = lunesDe(new Date(2026, 10, 14));

  it('la semana va de lunes a domingo', () => {
    expect([lunes.getDate(), lunes.getDay()]).toEqual([9, 1]);
  });

  it('suma lo que hizo el tapicero en la semana; sin valor no suma', () => {
    const { terminados } = construirMisTrabajos(trabajos, [produccion], [pedido], tapiceros, 4);
    const s = trabajosDeLaSemana(terminados, lunes);
    expect(s.trabajos.map((m) => m.trabajo.id).sort()).toEqual([1, 2, 3]);
    expect([s.total, s.sinValor, s.revisados]).toEqual([200000, 1, 1]);
  });

  it('agrupa por tapicero con su total y el total general', () => {
    const p = pagosDeLaSemana(trabajos, [produccion], [pedido], tapiceros, lunes);
    expect(p.filas.map((f) => [f.nombre, f.total])).toEqual([
      ['Carlos Rojas', 30000],
      ['Miguel Martinez', 200000],
    ]);
    expect([p.total, p.trabajos, p.sinValor]).toEqual([230000, 4, 1]);
  });
});
