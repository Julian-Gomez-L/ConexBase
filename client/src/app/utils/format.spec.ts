import { describe, expect, it } from 'vitest';
import { formatearMiles, leerMiles } from './format';

describe('formatearMiles / leerMiles', () => {
  it('pone puntos de miles', () => {
    expect(formatearMiles(1500000)).toBe('1.500.000');
    expect(formatearMiles(50000)).toBe('50.000');
    expect(formatearMiles(999)).toBe('999');
    expect(formatearMiles(0)).toBe('');
  });

  it('lee el número ignorando puntos, comas y otros signos', () => {
    expect(leerMiles('1.500.000')).toBe(1500000);
    expect(leerMiles('$ 1,500,000')).toBe(1500000);
    expect(leerMiles('')).toBe(0);
    expect(leerMiles('abc')).toBe(0);
  });
});
