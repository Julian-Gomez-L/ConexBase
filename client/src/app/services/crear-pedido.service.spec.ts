import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { environment } from '@env/environment';
import { AuthService } from './auth.service';
import { CrearPedidoService } from './crear-pedido.service';

const api = environment.apiUrl;
const ok = <T>(data: T) => ({ success: true, message: 'ok', data });

describe('CrearPedidoService', () => {
  let http: HttpTestingController;
  let servicio: CrearPedidoService;

  beforeEach(() => {
    // Sesión del asesor Juan (id 2)
    sessionStorage.setItem(
      'conexbase.sesion',
      JSON.stringify({
        usuarioId: 2,
        nombre: 'Juan Perez',
        correo: 'vendedor@conexbase.com',
        rolNombre: 'Vendedor',
        rol: 'vendedor',
        token: 't',
        expiraEn: '2999-01-01T00:00:00Z',
      }),
    );
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(AuthService);
    servicio = TestBed.inject(CrearPedidoService);
  });

  it('calcula el total con precio × cantidad', () => {
    expect(
      CrearPedidoService.total([
        { diseno: 'Base doble', descripcion: null, colorTela: 'Gris', tipoTela: 'Lino', cantidad: 1, precioUnitario: 800000 },
        { diseno: 'Cabecero', descripcion: null, colorTela: 'Gris', tipoTela: 'Lino', cantidad: 2, precioUnitario: 250000 },
      ]),
    ).toBe(1300000);
  });

  it('con cliente nuevo: crea cliente, pedido a nombre de la sesión, detalles, abono e historial', () => {
    let creado: number | null = null;
    servicio
      .crear({
        cliente: { documento: '1', nombre: 'Diana', telefono: '3', correo: 'd@x.com', direccion: null },
        localidad: 'Suba',
        recargo: 0,
        lineas: [
          { diseno: 'Base doble', descripcion: null, colorTela: 'Gris', tipoTela: 'Lino', cantidad: 1, precioUnitario: 800000 },
          { diseno: 'Cabecero', descripcion: null, colorTela: 'Gris', tipoTela: 'Lino', cantidad: 2, precioUnitario: 250000 },
        ],
        abono: { monto: 500000, metodo: 'Efectivo', comprobante: null },
      })
      .subscribe((p) => (creado = p.id));

    const cliente = http.expectOne(`${api}/clientes`);
    expect(cliente.request.body).toMatchObject({ documento: '1', estado: true });
    cliente.flush(ok({ id: 6 }));

    const pedido = http.expectOne(`${api}/pedidos`);
    expect(pedido.request.body).toEqual({
      cliente_id: 6,
      usuario_id: 2,
      estado: 'Pendiente',
      localidad: 'Suba',
      total: '1300000',
      recargo: '0',
    });
    pedido.flush(ok({ id: 8 }));

    const detalles = http.match(`${api}/detalle-pedidos`);
    expect(detalles.map((d) => d.request.body.subtotal)).toEqual(['800000', '500000']);
    expect(detalles[1].request.body).toMatchObject({
      producto_id: null,
      diseno: 'Cabecero',
      tipo_tela: 'Lino',
      color_tela: 'Gris',
      cantidad: 2,
      precio_unitario: '250000',
    });
    detalles.forEach((d) => d.flush(ok({ id: 1 })));

    const pago = http.expectOne(`${api}/pagos`);
    expect(pago.request.body).toMatchObject({ pedido_id: 8, usuario_id: 2, monto: '500000' });
    pago.flush(ok({ id: 1 }));

    const historial = http.expectOne(`${api}/historial-pedidos`);
    expect(historial.request.body).toMatchObject({
      pedido_id: 8,
      cliente_id: 6,
      estado_anterior: null,
      estado_nuevo: 'Pendiente',
    });
    historial.flush(ok({ id: 1 }));

    expect(creado).toBe(8);
    http.verify();
  });

  it('con Addi: el total incluye el recargo y el pago es por el total', () => {
    servicio
      .crear({
        cliente: 4,
        localidad: 'Kennedy',
        recargo: 100000,
        lineas: [{ diseno: 'Base doble', descripcion: null, colorTela: 'Gris', tipoTela: 'Lino', cantidad: 1, precioUnitario: 1000000 }],
        abono: { monto: 1100000, metodo: 'Addi', comprobante: 'ADDI-123' },
      })
      .subscribe();

    const pedido = http.expectOne(`${api}/pedidos`);
    expect(pedido.request.body).toMatchObject({ total: '1100000', recargo: '100000' });
    pedido.flush(ok({ id: 10 }));
    http.expectOne(`${api}/detalle-pedidos`).flush(ok({ id: 1 }));
    const pago = http.expectOne(`${api}/pagos`);
    expect(pago.request.body).toMatchObject({ monto: '1100000', metodo: 'Addi', comprobante: 'ADDI-123' });
    pago.flush(ok({ id: 1 }));
    http.expectOne(`${api}/historial-pedidos`).flush(ok({ id: 1 }));
    http.verify();
  });

  it('con cliente existente y sin abono: no crea cliente ni pago', () => {
    servicio
      .crear({ cliente: 4, localidad: 'Chía', recargo: 0, lineas: [{ diseno: 'Puff', descripcion: null, colorTela: 'Gris', tipoTela: 'Lino', cantidad: 1, precioUnitario: 100 }], abono: null })
      .subscribe();

    http.expectOne(`${api}/pedidos`).flush(ok({ id: 9 }));
    http.expectOne(`${api}/detalle-pedidos`).flush(ok({ id: 1 }));
    http.expectOne(`${api}/historial-pedidos`).flush(ok({ id: 1 }));
    http.expectNone(`${api}/clientes`);
    http.expectNone(`${api}/pagos`);
    http.verify();
  });
});
