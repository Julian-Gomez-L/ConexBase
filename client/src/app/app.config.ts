import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { apiHeadersInterceptor } from '@app/interceptors/api-headers.interceptor';
import { authInterceptor } from '@app/interceptors/auth.interceptor';
import { errorInterceptor } from '@app/interceptors/error.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // Orden: 1) cabeceras/HTTPS → 2) token → 3) manejo de errores
    provideHttpClient(
      withFetch(),
      withInterceptors([apiHeadersInterceptor, authInterceptor, errorInterceptor]),
    ),
  ],
};
