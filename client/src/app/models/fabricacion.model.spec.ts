import { describe, expect, it } from 'vitest';
import { construirTablero } from './fabricacion.model';
import { HistorialPedido } from './historial-pedido.model';
import { PedidoVista } from './pedido-vista.model';
import { Produccion } from './produccion.model';
import { Rol } from './rol.model';
import { TrabajoTapicero } from './trabajo-tapicero.model';
import { Usuario } from './usuario.model';

const base = { created_at: null, updated_at: null };

const pedido = (id: number, estado: string, items: [number, string, number][] = []): PedidoVista => ({
  id,
  codigo: `RM-${id}`,
  estado,
  usuarioId: 2,
  clienteId: 1,
  total: 100,
  pagado: 0,
  saldo: 100,
  creadoEn: new Date(2026, 9, id),
  cliente: null,
  asesor: null,
  items: items.map(([productoId, nombre, cantidad]) => ({ productoId, nombre, cantidad, subtotal: 0 })),
  abonos: [],
  rechazo: null,
});

const produccion = (id: number, pedidoId: number, productoId: number, estado: string): Produccion => ({
  id,
  pedido_id: pedidoId,
  producto_id: productoId,
  usuario_id: 3,
  fecha_inicio: '2026-10-12',
  fecha_fin: null,
  estado,
  observaciones: null,
  ...base,
});

const trabajo = (id: number, produccionId: number, estado: string): TrabajoTapicero => ({
  id,
  produccion_id: produccionId,
  usuario_id: 4,
  descripcion: 'Tapizado',
  fecha_inicio: '2026-10-13',
  fecha_fin: null,
  estado,
  observaciones: null,
  ...base,
});

const usuario = (id: number, rolId: number, nombre: string, estado = 1): Usuario =>
  ({ id, documento: String(id), nombre, apellido: 'X', correo: `${id}@x.com`, rol_id: rolId, estado, ...base }) as Usuario;

const roles: Rol[] = [
  { id: 3, nombre: 'Encargado de Producción', descripcion: null, estado: 1, ...base },
  { id: 4, nombre: 'Tapicero', descripcion: null, estado: 1, ...base },
];

const cambio = (pedidoId: number, estado: string, fecha: string): HistorialPedido => ({
  id: pedidoId,
  pedido_id: pedidoId,
  usuario_id: 1,
  cliente_id: 1,
  estado_anterior: null,
  estado_nuevo: estado,
  observacion: null,
  fecha,
  ...base,
});

describe('construirTablero', () => {
  const vistas = [
    pedido(1, 'Pendiente'),
    pedido(4, 'Confirmado', [[3, 'Mesa comedor', 1]]),
    pedido(2, 'En producción', [[2, 'Silla comedor', 2], [3, 'Mesa comedor', 1]]),
    pedido(5, 'En producción', [[1, 'Sofa', 1]]),
    pedido(6, 'Finalizado'),
    pedido(3, 'Entregado'),
  ];
  const producciones = [
    produccion(1, 2, 2, 'En proceso'),
    produccion(2, 2, 3, 'Pendiente'),
    produccion(3, 5, 1, 'Finalizada'),
  ];
  const trabajos = [trabajo(1, 1, 'En proceso'), trabajo(2, 3, 'Finalizado')];
  const usuarios = [usuario(3, 3, 'Andres'), usuario(4, 4, 'Miguel'), usuario(7, 4, 'Inactivo', 0)];
  const historial = [cambio(3, 'Entregado', '2026-10-05 11:00:00'), cambio(3, 'Entregado', '2026-09-01 11:00:00')];

  const t = construirTablero(vistas, producciones, trabajos, usuarios, roles, historial, new Date(2026, 9, 28));

  it('reparte los pedidos en columnas según su estado', () => {
    expect(t.porIniciar.map((p) => p.pedido.id)).toEqual([4]);
    expect(t.enFabricacion.map((p) => p.pedido.id)).toEqual([2, 5]);
    expect(t.listos.map((p) => p.pedido.id)).toEqual([6]);
    expect(t.entregadosRecientes.map((p) => p.pedido.id)).toEqual([3]);
  });

  it('une cada producción con su producto, cantidad y tapicero', () => {
    const [sillas, mesa] = t.enFabricacion[0].producciones;
    expect([sillas.producto, sillas.cantidad, sillas.trabajos[0].tapicero]).toEqual(['Silla comedor', 2, 'Miguel X']);
    expect(sillas.tapiceroActivo).toBe(true);
    expect([mesa.producto, mesa.trabajos.length, mesa.tapiceroActivo]).toEqual(['Mesa comedor', 0, false]);
  });

  it('solo deja finalizar cuando todas las producciones están terminadas', () => {
    expect(t.enFabricacion.map((p) => p.listoParaFinalizar)).toEqual([false, true]);
    expect(t.enFabricacion[1].producciones[0].tapiceroActivo).toBe(false);
  });

  it('lista solo tapiceros activos y cuenta entregas del mes por la última entrega', () => {
    expect(t.tapiceros.map((u) => u.nombre)).toEqual(['Miguel']);
    expect(t.entregadosRecientes[0].desde.getMonth()).toBe(9);
    expect(t.resumen).toEqual({
      porIniciar: 1,
      enFabricacion: 2,
      productosEnFabricacion: 3,
      listos: 1,
      entregadosEsteMes: 1,
    });
  });
});
