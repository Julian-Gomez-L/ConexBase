const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** 4500000 → "$ 4.500.000" */
export const formatearCOP = (valor: number): string => cop.format(valor);

const miles = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

/** 1500000 → "1.500.000" (para campos de dinero mientras se escribe). 0 → "". */
export const formatearMiles = (valor: number): string => (valor > 0 ? miles.format(valor) : '');

/** "1.500.000" (o "$ 1,500,000", "1500000") → 1500000. Solo cuenta los dígitos. */
export const leerMiles = (texto: string): number => Number(texto.replace(/\D/g, '')) || 0;

/** 4500000 → "$4.5M" · 50000 → "$50K" (estilo de las tarjetas de la maqueta) */
export function abreviarCOP(valor: number): string {
  if (Math.abs(valor) >= 1_000_000) return `$${(valor / 1_000_000).toFixed(1)}M`;
  if (Math.abs(valor) >= 1_000) return `$${(valor / 1_000).toFixed(0)}K`;
  return `$${valor}`;
}

/** Los decimales de Laravel llegan como texto ("150000.00"). */
export const aNumero = (valor: string | number | null | undefined): number =>
  Number(valor ?? 0) || 0;
