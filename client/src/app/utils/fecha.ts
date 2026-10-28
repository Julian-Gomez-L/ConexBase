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
