const dos = (n: number) => String(n).padStart(2, '0');

/** Fecha local como YYYY-MM-DD (formato DATE de MySQL y de <input type="date">). */
export const fechaISO = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;

/** Fecha y hora local como "2026-10-28 14:05:00" (formato DATETIME de MySQL). */
export const ahoraMysql = (d: Date = new Date()): string =>
  `${fechaISO(d)} ${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`;

/** "Martes, 27 de octubre de 2026" */
export function fechaLarga(d: Date): string {
  const texto = d.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "27/10/2026" */
export const fechaCorta = (d: Date): string => d.toLocaleDateString('es-CO');

/** "10:05" */
export const horaCorta = (d: Date): string =>
  d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });

/** "YYYY-MM-DD" (sin hora) → Date local, sin el corrimiento de zona horaria de new Date('YYYY-MM-DD'). */
export function desdeFechaISO(valor: string): Date {
  const [a, m, d] = valor.slice(0, 10).split('-').map(Number);
  return new Date(a, m - 1, d);
}

/** Lunes (00:00) de la semana de esa fecha. Las semanas van de lunes a domingo. */
export function lunesDe(d: Date): Date {
  const lunes = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
  return lunes;
}

/** Copia de la fecha corrida `dias` días (negativo = hacia atrás). */
export function sumarDias(d: Date, dias: number): Date {
  const copia = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  copia.setDate(copia.getDate() + dias);
  return copia;
}

/** "Semana del 9 al 15 de noviembre de 2026" (recibe el lunes). */
export function etiquetaSemana(lunes: Date): string {
  const domingo = sumarDias(lunes, 6);
  const mes = (d: Date) => d.toLocaleDateString('es-CO', { month: 'long' });
  const desde = lunes.getMonth() === domingo.getMonth() ? `${lunes.getDate()}` : `${lunes.getDate()} de ${mes(lunes)}`;
  return `Semana del ${desde} al ${domingo.getDate()} de ${mes(domingo)} de ${domingo.getFullYear()}`;
}

/** "19:35:12" (con segundos, para registros de auditoría) */
export const horaConSegundos = (d: Date): string =>
  d.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
