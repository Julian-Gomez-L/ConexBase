import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { ROLE_HOME } from '@app/config/navigation';
import { AppRole } from '@app/config/roles';
import { AuthService } from '@app/services/auth.service';

/** Solo usuarios con sesión. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.estaAutenticado() || inject(Router).createUrlTree(['/login']);
};

/** El login no se muestra a quien ya inició sesión. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const rol = auth.rol();
  return rol ? inject(Router).createUrlTree([ROLE_HOME[rol]]) : true;
};

/**
 * Restringe un módulo lazy a ciertos roles. Al usar `canMatch`, el código de la
 * ruta NI SIQUIERA SE DESCARGA si el rol no corresponde.
 * ⚠ Es UX, no seguridad: la autorización real debe hacerla el backend.
 */
export const rolesPermitidos =
  (...roles: AppRole[]): CanMatchFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const rol = auth.rol();
    if (!rol) return router.createUrlTree(['/login']);
    return roles.includes(rol) || router.createUrlTree([ROLE_HOME[rol]]);
  };

/** `/dashboard` (Panel General) es solo del administrador; los demás van a su inicio. */
export const inicioPorRolGuard: CanActivateFn = () => {
  const rol = inject(AuthService).rol();
  const router = inject(Router);
  if (!rol) return router.createUrlTree(['/login']);
  return rol === 'administrador' || router.createUrlTree([ROLE_HOME[rol]]);
};
