const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** 4500000 → "$ 4.500.000" */
export const formatearCOP = (valor: number): string => cop.format(valor);

/** 4500000 → "$4.5M" · 50000 → "$50K" (estilo de las tarjetas de la maqueta) */
export function abreviarCOP(valor: number): string {
  if (Math.abs(valor) >= 1_000_000) return `$${(valor / 1_000_000).toFixed(1)}M`;
  if (Math.abs(valor) >= 1_000) return `$${(valor / 1_000).toFixed(0)}K`;
  return `$${valor}`;
}

/** Los decimales de Laravel llegan como texto ("150000.00"). */
export const aNumero = (valor: string | number | null | undefined): number =>
  Number(valor ?? 0) || 0;
