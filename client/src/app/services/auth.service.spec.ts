import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { LoginData } from '@app/models';
import { environment } from '@env/environment';
import { AuthService } from './auth.service';

const respuesta = (rol: string): { success: boolean; data: LoginData } => ({
  success: true,
  data: {
    token: 'token-en-claro',
    tipo: 'Bearer',
    expira_en: '2999-01-01T00:00:00Z',
    usuario: {
      id: 7,
      nombre: 'Juan',
      apellido: 'Perez',
      correo: 'vendedor@conexbase.com',
      rol: { id: 2, nombre: rol },
    },
  },
});

describe('AuthService', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  it('inicia sesión: llama al backend y guarda token, usuario y rol', () => {
    const auth = TestBed.inject(AuthService);
    let rolFinal = '';
    auth.login('vendedor@conexbase.com', '123456').subscribe((s) => (rolFinal = s.rol));

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ correo: 'vendedor@conexbase.com', password: '123456' });
    req.flush(respuesta('Vendedor'));

    expect(rolFinal).toBe('vendedor');
    expect(auth.estaAutenticado()).toBe(true);
    expect(auth.token()).toBe('token-en-claro');
    expect(auth.sesion()?.nombre).toBe('Juan Perez');
  });

  it('rechaza roles que la aplicación no conoce', () => {
    const auth = TestBed.inject(AuthService);
    let error: { status: number } | null = null;
    auth.login('x@x.com', '1').subscribe({ error: (e) => (error = e) });

    http.expectOne(`${environment.apiUrl}/auth/login`).flush(respuesta('Invitado'));

    expect(error).toMatchObject({ status: 403 });
    expect(auth.estaAutenticado()).toBe(false);
  });

  it('descarta una sesión guardada que ya expiró', () => {
    sessionStorage.setItem(
      'conexbase.sesion',
      JSON.stringify({
        usuarioId: 1,
        nombre: 'X',
        correo: 'x@x.com',
        rolNombre: 'Vendedor',
        rol: 'vendedor',
        token: 't',
        expiraEn: '2000-01-01T00:00:00Z',
      }),
    );
    expect(TestBed.inject(AuthService).estaAutenticado()).toBe(false);
  });

  it('cierra la sesión local aunque el servidor falle al revocar el token', () => {
    const auth = TestBed.inject(AuthService);
    auth.login('a@a.com', '1').subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush(respuesta('Vendedor'));

    let terminó = false;
    auth.revocarToken().subscribe(() => (terminó = true));
    http
      .expectOne(`${environment.apiUrl}/auth/logout`)
      .flush({}, { status: 500, statusText: 'Error' });
    auth.logout();

    expect(terminó).toBe(true);
    expect(auth.estaAutenticado()).toBe(false);
  });
});
