import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AppRole, resolverRol } from '@app/config/roles';
import { ApiResponse, AppError, LoginData } from '@app/models';
import { environment } from '@env/environment';

export interface Sesion {
  usuarioId: number;
  nombre: string;
  correo: string;
  /** Nombre del rol tal como está en la tabla `roles` (ej. "Encargado de Producción"). */
  rolNombre: string;
  rol: AppRole;
  token: string;
  /** ISO 8601 */
  expiraEn: string;
}

const CLAVE_SESION = 'conexbase.sesion';

/**
 * Estado de sesión con signals + llamadas a /api/auth/*.
 * La sesión vive en sessionStorage: se pierde al cerrar la pestaña.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _sesion = signal<Sesion | null>(this.leerSesion());

  readonly sesion = this._sesion.asReadonly();
  readonly estaAutenticado = computed(() => this._sesion() !== null);
  readonly rol = computed(() => this._sesion()?.rol ?? null);
  readonly token = computed(() => this._sesion()?.token ?? null);

  /** POST /api/auth/login → guarda la sesión (token + usuario + rol). */
  login(correo: string, password: string): Observable<Sesion> {
    return this.http
      .post<ApiResponse<LoginData>>(`${environment.apiUrl}/auth/login`, { correo, password })
      .pipe(
        map((respuesta) => this.crearSesion(respuesta.data)),
        tap((sesion) => this.guardar(sesion)),
      );
  }

  /** Avisa al servidor para revocar el token. Si falla, igual se cierra la sesión local. */
  revocarToken(): Observable<void> {
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}).pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
    );
  }

  /** Borra la sesión local (también la usa el interceptor cuando el servidor responde 401). */
  logout(): void {
    this._sesion.set(null);
    sessionStorage.removeItem(CLAVE_SESION);
  }

  private crearSesion(datos: LoginData): Sesion {
    const rol = resolverRol(datos.usuario.rol.nombre);
    if (!rol) {
      const error: AppError = {
        status: 403,
        message: `El rol "${datos.usuario.rol.nombre}" no tiene acceso a esta aplicación.`,
      };
      throw error;
    }
    return {
      usuarioId: datos.usuario.id,
      nombre: `${datos.usuario.nombre} ${datos.usuario.apellido}`.trim(),
      correo: datos.usuario.correo,
      rolNombre: datos.usuario.rol.nombre,
      rol,
      token: datos.token,
      expiraEn: datos.expira_en,
    };
  }

  private guardar(sesion: Sesion): void {
    this._sesion.set(sesion);
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  }

  private leerSesion(): Sesion | null {
    try {
      const crudo = sessionStorage.getItem(CLAVE_SESION);
      if (!crudo) return null;
      const sesion = JSON.parse(crudo) as Sesion;
      const vigente = !!sesion.token && new Date(sesion.expiraEn).getTime() > Date.now();
      return vigente ? sesion : null;
    } catch {
      return null;
    }
  }
}
