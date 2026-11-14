import { describe, expect, it } from 'vitest';
import { buscarParaFacturar, construirFactura } from './factura.model';
import { PedidoVista } from './pedido-vista.model';

const pedido = (id: number, estado: string, cliente: string, documento: string, dia: number): PedidoVista =>
  ({
    id,
    codigo: `RM-0000${id}`,
    estado,
    clienteId: id,
    usuarioId: 2,
    total: 900000,
    pagado: 300000,
    saldo: 600000,
    creadoEn: new Date(2026, 10, dia),
    cliente: { nombre: cliente, documento },
    asesor: null,
    items: [
      { productoId: 1, nombre: 'Cama doble', cantidad: 2, subtotal: 600000 },
      { productoId: 2, nombre: 'Colchón', cantidad: 1, subtotal: 300000 },
    ],
    abonos: [],
    rechazo: null,
  }) as unknown as PedidoVista;

describe('construirFactura', () => {
  it('calcula valor unitario, unidades y saldo', () => {
    const f = construirFactura(pedido(1, 'Confirmado', 'Ana', '123', 1));
    expect(f.numero).toBe('RM-00001');
    expect(f.lineas.map((l) => l.precioUnitario)).toEqual([300000, 300000]);
    expect([f.unidades, f.total, f.abonado, f.saldo, f.anulada]).toEqual([3, 900000, 300000, 600000, false]);
  });

  it('marca como anulada la factura de un pedido rechazado o cancelado', () => {
    expect(construirFactura(pedido(2, 'Rechazado', 'Ana', '123', 1)).anulada).toBe(true);
    expect(construirFactura(pedido(3, 'Cancelado', 'Ana', '123', 1)).anulada).toBe(true);
  });
});

describe('buscarParaFacturar', () => {
  const lista = [
    pedido(1, 'Entregado', 'José Pérez', '1010', 1),
    pedido(2, 'Rechazado', 'Ana Gómez', '2020', 3),
    pedido(3, 'Confirmado', 'Luis Rojas', '3030', 2),
  ];

  it('ordena del más reciente y oculta anulados por defecto', () => {
    expect(buscarParaFacturar(lista, '').map((p) => p.id)).toEqual([3, 1]);
    expect(buscarParaFacturar(lista, '', true).map((p) => p.id)).toEqual([2, 3, 1]);
  });

  it('busca por cliente (sin tildes), código o documento', () => {
    expect(buscarParaFacturar(lista, 'jose').map((p) => p.id)).toEqual([1]);
    expect(buscarParaFacturar(lista, 'rm-00003').map((p) => p.id)).toEqual([3]);
    expect(buscarParaFacturar(lista, '1010').map((p) => p.id)).toEqual([1]);
  });
});
