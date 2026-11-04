import { RegistroBase } from './api.model';

/** Tabla `intentos_login` del backend: un inicio de sesión fallido. */
export interface IntentoLogin extends RegistroBase {
  correo: string;
  /** null si el correo no pertenece a ningún usuario. */
  usuario_id: number | null;
  /** Nombre y rol tal como estaban al momento del intento. */
  nombre: string | null;
  rol: string | null;
  /** "Contraseña incorrecta", "El correo no existe" o "Usuario inactivo". */
  motivo: string;
  ip: string | null;
  /** User-Agent completo del navegador. */
  navegador: string | null;
  /** DATETIME en hora de Colombia: YYYY-MM-DD HH:mm:ss */
  fecha: string;
}

/**
 * Función PURA: resume el User-Agent en algo legible.
 * "Mozilla/5.0 (Windows NT 10.0; Win64; x64) … Chrome/131.0 Safari/537.36" → "Chrome en Windows"
 */
export function resumirNavegador(userAgent: string | null): string {
  if (!userAgent) return 'Desconocido';
  const ua = userAgent.toLowerCase();

  // El orden importa: Edge y Opera también dicen "chrome", y Chrome también dice "safari".
  const navegador = ua.includes('edg/')
    ? 'Edge'
    : ua.includes('opr/') || ua.includes('opera')
      ? 'Opera'
      : ua.includes('firefox/')
        ? 'Firefox'
        : ua.includes('chrome/')
          ? 'Chrome'
          : ua.includes('safari/')
            ? 'Safari'
            : null;

  const sistema = ua.includes('android')
    ? 'Android'
    : ua.includes('iphone') || ua.includes('ipad')
      ? 'iPhone/iPad'
      : ua.includes('windows')
        ? 'Windows'
        : ua.includes('mac os')
          ? 'Mac'
          : ua.includes('linux')
            ? 'Linux'
            : null;

  if (!navegador && !sistema) return 'Otro (no es un navegador)';
  if (!navegador) return `Otro navegador en ${sistema}`;
  return sistema ? `${navegador} en ${sistema}` : navegador;
}

/** Función PURA: filtra por texto (correo, nombre, IP o motivo). */
export function filtrarIntentos(intentos: IntentoLogin[], texto: string): IntentoLogin[] {
  const t = texto.trim().toLowerCase();
  if (!t) return intentos;
  return intentos.filter(
    (i) =>
      i.correo.toLowerCase().includes(t) ||
      (i.nombre ?? '').toLowerCase().includes(t) ||
      (i.ip ?? '').includes(t) ||
      i.motivo.toLowerCase().includes(t),
  );
}

/** Cuántos intentos son del día `dia` (formato YYYY-MM-DD). */
export const contarDelDia = (intentos: IntentoLogin[], dia: string): number =>
  intentos.filter((i) => i.fecha.startsWith(dia)).length;
