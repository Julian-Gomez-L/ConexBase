import { Cliente, DetallePedido, Pago, Pedido, Producto, Usuario } from '@app/models';

/** Datos de ejemplo con la misma forma que devuelve la API (decimales como texto). */
const base = { created_at: '2026-10-01T10:00:00Z', updated_at: null, deleted_at: null };

export const DATOS = {
  pedidos: [
    { id: 1, cliente_id: 1, usuario_id: 2, estado: 'Pendiente', total: '300000.00', ...base },
    {
      id: 2,
      cliente_id: 1,
      usuario_id: 2,
      estado: 'En producción',
      total: '500000.00',
      ...base,
      created_at: '2026-10-05T10:00:00Z',
    },
  ] as Pedido[],
  clientes: [
    {
      id: 1,
      documento: '123',
      nombre: 'Pedro Ramirez',
      telefono: '3001112233',
      correo: 'p@x.com',
      direccion: 'Calle 1',
      estado: true,
      ...base,
    },
  ] as Cliente[],
  usuarios: [
    {
      id: 2,
      documento: '9',
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan@x.com',
      rol_id: 2,
      estado: true,
      ...base,
    },
  ] as Usuario[],
  detalles: [
    {
      id: 1,
      pedido_id: 1,
      producto_id: 7,
      cantidad: 2,
      precio_unitario: '150000.00',
      subtotal: '300000.00',
      ...base,
    },
  ] as DetallePedido[],
  productos: [
    {
      id: 7,
      nombre: 'Sofa 3 puestos',
      descripcion: null,
      precio: '150000.00',
      categoria_id: 1,
      estado: true,
      ...base,
    },
  ] as Producto[],
  pagos: [
    {
      id: 1,
      pedido_id: 1,
      usuario_id: 2,
      monto: '100000.00',
      metodo: 'Efectivo',
      fecha_pago: '2026-10-02',
      comprobante: null,
      ...base,
    },
    {
      id: 2,
      pedido_id: 1,
      usuario_id: 2,
      monto: '50000.50',
      metodo: 'Transferencia',
      fecha_pago: '2026-10-03',
      comprobante: null,
      ...base,
    },
  ] as Pago[],
};
