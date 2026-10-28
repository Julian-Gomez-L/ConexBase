import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { environment } from '@env/environment';
import { CambioEstadoService } from './cambio-estado.service';

const api = environment.apiUrl;
const ok = <T>(data: T) => ({ success: true, message: 'ok', data });

describe('CambioEstadoService', () => {
  beforeEach(() => {
    sessionStorage.setItem(
      'conexbase.sesion',
      JSON.stringify({ usuarioId: 5, nombre: 'Sofia', correo: 'c@x.com', rolNombre: 'Confirmador', rol: 'confirmador', token: 't', expiraEn: '2999-01-01T00:00:00Z' }),
    );
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  });

  it('actualiza el estado del pedido y registra el historial con quien hizo el cambio', () => {
    const http = TestBed.inject(HttpTestingController);
    let listo = false;
    TestBed.inject(CambioEstadoService)
      .cambiar({ id: 7, estado: 'Pendiente', clienteId: 5 }, 'Rechazado', 'Dirección incompleta')
      .subscribe(() => (listo = true));

    const put = http.expectOne(`${api}/pedidos/7`);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({ estado: 'Rechazado' });
    put.flush(ok({ id: 7, estado: 'Rechazado' }));

    const h = http.expectOne(`${api}/historial-pedidos`);
    expect(h.request.body).toMatchObject({
      pedido_id: 7,
      usuario_id: 5,
      cliente_id: 5,
      estado_anterior: 'Pendiente',
      estado_nuevo: 'Rechazado',
      observacion: 'Dirección incompleta',
    });
    h.flush(ok({ id: 1 }));

    expect(listo).toBe(true);
    http.verify();
  });
});
