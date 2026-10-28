/**
 * Roles de la aplicación (frontend) y su correspondencia con la tabla `roles` del backend.
 *
 * El backend guarda el rol como TEXTO libre (Administrador, Vendedor, Encargado de Producción, Tapicero).
 * `resolverRol()` lo normaliza para no depender de mayúsculas, tildes ni del plural exacto.
 * El rol "Confirmador" aún no existe en el seeder del backend: créalo en la tabla `roles`.
 */
export type AppRole = 'administrador' | 'vendedor' | 'confirmador' | 'produccion' | 'tapicero';

export const ROLE_LABEL: Record<AppRole, string> = {
  administrador: 'Administración',
  vendedor: 'Asesor Comercial',
  confirmador: 'Confirmación',
  produccion: 'Fabricación',
  tapicero: 'Tapicero',
};

export function resolverRol(nombreRol: string | null | undefined): AppRole | null {
  const n = (nombreRol ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (n.includes('admin')) return 'administrador';
  if (n.includes('tapicer')) return 'tapicero';
  if (n.includes('confirm')) return 'confirmador';
  if (n.includes('produccion') || n.includes('fabricacion')) return 'produccion';
  if (n.includes('vend') || n.includes('asesor') || n.includes('comercial')) return 'vendedor';
  return null;
}
