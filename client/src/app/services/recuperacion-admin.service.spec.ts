import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { DatosRecuperacion } from '@app/models';
import { environment } from '@env/environment';
import { RecuperacionAdminService } from './recuperacion-admin.service';

describe('RecuperacionAdminService', () => {
  let http: HttpTestingController;
  let servicio: RecuperacionAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    servicio = TestBed.inject(RecuperacionAdminService);
  });

  it('consulta el estado y genera el código en las rutas del Administrador', () => {
    let configurado: boolean | undefined;
    servicio.estado().subscribe((e) => (configurado = e.configurado));
    http
      .expectOne({ method: 'GET', url: `${environment.apiUrl}/recuperacion-admin` })
      .flush({
        success: true,
        message: '',
        data: { configurado: true, generado_en: null, generado_por: null },
      });
    expect(configurado).toBe(true);

    let codigo = '';
    servicio.generar().subscribe((c) => (codigo = c.codigo));
    http
      .expectOne({ method: 'POST', url: `${environment.apiUrl}/recuperacion-admin/codigo` })
      .flush({
        success: true,
        message: '',
        data: { codigo: 'K7QM-2XRP-9TWD-H4NB-6CVJ', generado_en: '2026-11-03 20:00:00' },
      });
    expect(codigo).toBe('K7QM-2XRP-9TWD-H4NB-6CVJ');
    http.verify();
  });

  it('recupera el acceso por la ruta pública y devuelve el mensaje del servidor', () => {
    const datos: DatosRecuperacion = {
      codigo: 'K7QM-2XRP-9TWD-H4NB-6CVJ',
      documento: '9999',
      nombre: 'Dueño',
      apellido: 'Empresa',
      correo: 'dueno@conexbase.com',
      password: 'nuevaClave2026',
      password_confirmation: 'nuevaClave2026',
    };
    let mensaje = '';
    servicio.recuperar(datos).subscribe((m) => (mensaje = m));

    const req = http.expectOne({
      method: 'POST',
      url: `${environment.apiUrl}/auth/recuperar-admin`,
    });
    expect(req.request.body).toEqual(datos);
    req.flush({
      success: true,
      message: 'Listo. Ya puedes iniciar sesión.',
      data: { correo: datos.correo },
    });

    expect(mensaje).toBe('Listo. Ya puedes iniciar sesión.');
    http.verify();
  });
});
