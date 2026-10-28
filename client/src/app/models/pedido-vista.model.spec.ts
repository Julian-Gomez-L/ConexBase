import { describe, expect, it } from 'vitest';
import { DATOS } from '@app/testing/datos-prueba';
import { codigoPedido, construirVistas } from './pedido-vista.model';

describe('construirVistas', () => {
  it('une pedido + cliente + asesor + productos + pagos', () => {
    const vistas = construirVistas(DATOS);
    const p1 = vistas.find((v) => v.id === 1)!;

    expect(p1.codigo).toBe('RM-00001');
    expect(p1.cliente?.nombre).toBe('Pedro Ramirez');
    expect(p1.asesor?.nombre).toBe('Juan');
    expect(p1.items).toEqual([
      { productoId: 7, nombre: 'Sofa 3 puestos', cantidad: 2, subtotal: 300000 },
    ]);
    expect(p1.total).toBe(300000);
    expect(p1.pagado).toBeCloseTo(150000.5);
    expect(p1.saldo).toBeCloseTo(149999.5);
  });

  it('ordena del más reciente al más antiguo', () => {
    expect(construirVistas(DATOS).map((v) => v.id)).toEqual([2, 1]);
  });

  it('tolera relaciones faltantes sin romper', () => {
    const vistas = construirVistas({ ...DATOS, clientes: [], detalles: [], pagos: [] });
    expect(vistas[0].cliente).toBeNull();
    expect(vistas[0].items).toEqual([]);
    expect(vistas[0].saldo).toBe(vistas[0].total);
  });

  it('incluye los abonos y, en pedidos rechazados, el último motivo del historial', () => {
    const rechazado = { ...DATOS.pedidos[0], estado: 'Rechazado' };
    const h = (fecha: string, observacion: string) => ({
      id: 1, pedido_id: 1, usuario_id: 5, cliente_id: 1, estado_anterior: 'Pendiente',
      estado_nuevo: 'Rechazado', observacion, fecha, created_at: null, updated_at: null,
    });
    const [vista] = construirVistas({
      ...DATOS,
      pedidos: [rechazado],
      historial: [h('2026-10-25 09:00:00', 'Falta dirección'), h('2026-10-20 09:00:00', 'Viejo')],
    });
    expect(vista.abonos.map((a) => a.metodo)).toEqual(['Efectivo', 'Transferencia']);
    expect(vista.rechazo?.motivo).toBe('Falta dirección');
    // Un pedido que no está rechazado no muestra motivo aunque tenga historial
    expect(construirVistas({ ...DATOS, historial: [h('2026-10-25 09:00:00', 'x')] })[1].rechazo).toBeNull();
  });

  it('formatea el código con ceros a la izquierda', () => {
    expect(codigoPedido(42)).toBe('RM-00042');
  });
});
