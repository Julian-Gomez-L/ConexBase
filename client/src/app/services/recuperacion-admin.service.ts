import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, CodigoGenerado, DatosRecuperacion, EstadoRecuperacion } from '@app/models';

/**
 * Código de recuperación de administrador.
 * - estado() y generar(): solo Administrador (pantalla Usuarios y Roles → Seguridad).
 * - recuperar(): pública, desde "Recuperar acceso de administrador" en el login.
 */
@Injectable({ providedIn: 'root' })
export class RecuperacionAdminService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/recuperacion-admin`;

  estado(): Observable<EstadoRecuperacion> {
    return this.http.get<ApiResponse<EstadoRecuperacion>>(this.url).pipe(map((r) => r.data));
  }

  generar(): Observable<CodigoGenerado> {
    return this.http
      .post<ApiResponse<CodigoGenerado>>(`${this.url}/codigo`, {})
      .pipe(map((r) => r.data));
  }

  /** Devuelve el mensaje del servidor para mostrarlo tal cual. */
  recuperar(datos: DatosRecuperacion): Observable<string> {
    return this.http
      .post<ApiResponse<{ correo: string }>>(`${environment.apiUrl}/auth/recuperar-admin`, datos)
      .pipe(map((r) => r.message));
  }
}
