import { describe, expect, it } from 'vitest';
import { calcularCobro } from './cobro.model';

describe('calcularCobro', () => {
  it('Addi: 10 % de recargo y se paga todo por anticipado', () => {
    expect(calcularCobro(1_500_000, 'Addi', 0)).toEqual({
      subtotal: 1_500_000,
      recargo: 150_000,
      total: 1_650_000,
      abono: 1_650_000,
      saldo: 0,
      pagoAnticipado: true,
    });
  });

  it('Addi ignora el abono que se haya escrito', () => {
    expect(calcularCobro(100_000, 'Addi', 20_000).abono).toBe(110_000);
  });

  it('otros métodos: sin recargo, abono y saldo normales', () => {
    expect(calcularCobro(800_000, 'Efectivo', 300_000)).toEqual({
      subtotal: 800_000,
      recargo: 0,
      total: 800_000,
      abono: 300_000,
      saldo: 500_000,
      pagoAnticipado: false,
    });
  });
});
