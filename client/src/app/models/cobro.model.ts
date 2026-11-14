import { METODO_ADDI, RECARGO_ADDI } from '@app/config/pagos';

export interface Cobro {
  /** Valor de los productos. */
  subtotal: number;
  /** Recargo por el método de pago (Addi: 10 %). */
  recargo: number;
  /** subtotal + recargo: lo que vale el pedido. */
  total: number;
  /** Lo que se registra como abono. */
  abono: number;
  saldo: number;
  /** Addi: el pago es completo y por anticipado (el abono no se escribe). */
  pagoAnticipado: boolean;
}

/**
 * Función PURA: lo que se cobra según el método de pago.
 * - Addi: recargo del 10 % sobre los productos y se paga todo por anticipado.
 * - Los demás: sin recargo; el abono es el que escribió el asesor.
 */
export function calcularCobro(subtotal: number, metodo: string, abonoEscrito: number): Cobro {
  if (metodo === METODO_ADDI) {
    const recargo = Math.round(subtotal * RECARGO_ADDI);
    const total = subtotal + recargo;
    return { subtotal, recargo, total, abono: total, saldo: 0, pagoAnticipado: true };
  }
  const abono = Math.max(abonoEscrito || 0, 0);
  return { subtotal, recargo: 0, total: subtotal, abono, saldo: Math.max(subtotal - abono, 0), pagoAnticipado: false };
}
