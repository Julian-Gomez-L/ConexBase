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
        { productoId: 1, cantidad: 1, precioUnitario: 800000 },
        { productoId: 2, cantidad: 2, precioUnitario: 250000 },
      ]),
    ).toBe(1300000);
  });

  it('con cliente nuevo: crea cliente, pedido a nombre de la sesión, detalles, abono e historial', () => {
    let creado: number | null = null;
    servicio
      .crear({
        cliente: { documento: '1', nombre: 'Diana', telefono: '3', correo: 'd@x.com', direccion: null },
        lineas: [
          { productoId: 3, cantidad: 1, precioUnitario: 800000 },
          { productoId: 2, cantidad: 2, precioUnitario: 250000 },
        ],
        abono: { monto: 500000, metodo: 'Efectivo', comprobante: null },
      })
      .subscribe((p) => (creado = p.id));

    const cliente = http.expectOne(`${api}/clientes`);
    expect(cliente.request.body).toMatchObject({ documento: '1', estado: true });
    cliente.flush(ok({ id: 6 }));

    const pedido = http.expectOne(`${api}/pedidos`);
    expect(pedido.request.body).toEqual({ cliente_id: 6, usuario_id: 2, estado: 'Pendiente', total: '1300000' });
    pedido.flush(ok({ id: 8 }));

    const detalles = http.match(`${api}/detalle-pedidos`);
    expect(detalles.map((d) => d.request.body.subtotal)).toEqual(['800000', '500000']);
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

  it('con cliente existente y sin abono: no crea cliente ni pago', () => {
    servicio
      .crear({ cliente: 4, lineas: [{ productoId: 1, cantidad: 1, precioUnitario: 100 }], abono: null })
      .subscribe();

    http.expectOne(`${api}/pedidos`).flush(ok({ id: 9 }));
    http.expectOne(`${api}/detalle-pedidos`).flush(ok({ id: 1 }));
    http.expectOne(`${api}/historial-pedidos`).flush(ok({ id: 1 }));
    http.expectNone(`${api}/clientes`);
    http.expectNone(`${api}/pagos`);
    http.verify();
  });
});
