import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiErrorBody, AppError } from '@app/models';
import { AuthService } from '@app/services/auth.service';

function mensajePorEstado(status: number): string {
  switch (status) {
    case 0:
      return 'No se pudo conectar con el servidor. Revisa tu conexión.';
    case 401:
      return 'Tu sesión expiró. Inicia sesión de nuevo.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no existe.';
    case 422:
      return 'Hay datos inválidos en la solicitud.';
    default:
      return status >= 500
        ? 'Error interno del servidor. Intenta más tarde.'
        : 'Ocurrió un error inesperado.';
  }
}

/**
 * Traduce cualquier HttpErrorResponse al tipo `AppError`, para que las pantallas
 * solo manejen un formato. Si el servidor responde 401, cierra la sesión.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) return throwError(() => err);

      const body = (err.error ?? null) as ApiErrorBody | null;
      // En errores de validación (422) Laravel manda el detalle por campo: mostramos el primero.
      const primerErrorDeCampo = Object.values(body?.errors ?? {})[0]?.[0];
      const appError: AppError = {
        status: err.status,
        message: primerErrorDeCampo ?? body?.message ?? mensajePorEstado(err.status),
        code: body?.error,
        fieldErrors: body?.errors,
      };

      if (err.status === 401) {
        auth.logout();
        void router.navigateByUrl('/login');
      }
      return throwError(() => appError);
    }),
  );
};
