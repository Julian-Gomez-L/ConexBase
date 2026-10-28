import { describe, expect, it } from 'vitest';
import { construirMisTrabajos } from './mis-trabajos.model';
import { PedidoVista } from './pedido-vista.model';
import { Produccion } from './produccion.model';
import { TrabajoTapicero } from './trabajo-tapicero.model';
import { Usuario } from './usuario.model';

const base = { created_at: null, updated_at: null };

const trabajo = (id: number, produccionId: number, usuarioId: number, estado: string, inicio: string, fin: string | null = null): TrabajoTapicero => ({
  id,
  produccion_id: produccionId,
  usuario_id: usuarioId,
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
  items: [{ productoId: 5, nombre: 'Silla comedor', cantidad: 2, subtotal: 0 }],
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
