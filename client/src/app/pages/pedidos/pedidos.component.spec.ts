import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { environment } from '@env/environment';
import { errorInterceptor } from '@app/interceptors/error.interceptor';
import { AuthService } from '@app/services/auth.service';
import { PedidosComponent } from './pedidos.component';
import { DATOS } from '@app/testing/datos-prueba';

const ok = <T>(data: T) => ({ success: true, message: 'Se listaron correctamente.', data });

describe('PedidosComponent (con API simulada)', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  const responder = () => {
    const api = environment.apiUrl;
    http.expectOne(`${api}/pedidos`).flush(ok(DATOS.pedidos));
    http.expectOne(`${api}/clientes`).flush(ok(DATOS.clientes));
    http.expectOne(`${api}/usuarios`).flush(ok(DATOS.usuarios));
    http.expectOne(`${api}/detalle-pedidos`).flush(ok(DATOS.detalles));
    http.expectOne(`${api}/productos`).flush(ok(DATOS.productos));
    http.expectOne(`${api}/pagos`).flush(ok(DATOS.pagos));
  };

  it('pide los 6 recursos en paralelo y pinta los pedidos', async () => {
    const fixture = TestBed.createComponent(PedidosComponent);
    fixture.componentRef.setInput('titulo', 'Ventas');
    fixture.detectChanges();

    responder();
    await fixture.whenStable();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Ventas');
    expect(texto).toContain('Pedro Ramirez');
    expect(texto).toContain('RM-00001');
    expect(texto).toContain('2 × Sofa 3 puestos');
    http.verify();
  });

  it('con alcance "propios" muestra solo los pedidos del asesor en sesión', async () => {
    // Sesión del usuario 99 (no tiene pedidos)
    sessionStorage.setItem(
      'conexbase.sesion',
      JSON.stringify({
        usuarioId: 99,
        nombre: 'Otro',
        correo: 'o@x.com',
        rolNombre: 'Vendedor',
        rol: 'vendedor',
        token: null,
      }),
    );
    TestBed.inject(AuthService);

    const fixture = TestBed.createComponent(PedidosComponent);
    fixture.componentRef.setInput('alcance', 'propios');
    fixture.detectChanges();
    responder();
    await fixture.whenStable();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).not.toContain('Pedro Ramirez');
    expect(texto).toContain('No hay pedidos para mostrar');
  });

  it('muestra el error normalizado y permite reintentar', async () => {
    const fixture = TestBed.createComponent(PedidosComponent);
    fixture.detectChanges();

    http
      .expectOne(`${environment.apiUrl}/pedidos`)
      .flush(
        { success: false, message: 'El pedido no existe.', error: 'PEDIDO_NOT_FOUND', status: 404 },
        { status: 404, statusText: 'Not Found' },
      );
    await fixture.whenStable();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('El pedido no existe.');
    expect(texto).toContain('PEDIDO_NOT_FOUND');
    expect(texto).toContain('Reintentar');
  });
});
