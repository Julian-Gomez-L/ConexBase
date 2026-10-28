import { HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { environment } from '@env/environment';

/**
 * 1) Pide siempre JSON (así Laravel devuelve errores de validación en JSON y no HTML).
 * 2) En producción bloquea cualquier llamada a la API que no use HTTPS.
 */
export const apiHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req);

  if (environment.production && req.url.startsWith('http://')) {
    return throwError(() => new Error('En producción la API debe consumirse por HTTPS.'));
  }
  return next(req.clone({ setHeaders: { Accept: 'application/json' } }));
};
