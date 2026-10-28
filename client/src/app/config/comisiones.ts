/**
 * Porcentaje de comisión del asesor sobre el total de cada pedido ENTREGADO.
 * Cámbialo aquí si la empresa ajusta la política (0.05 = 5 %).
 */
export const TASA_COMISION = 0.05;

/** Estados en los que el pedido sigue vivo y la comisión aún está "por ganar". */
export const ESTADOS_EN_CURSO = ['Confirmado', 'En producción', 'Finalizado'];

/** Estado en el que la comisión se considera ganada. */
export const ESTADO_COMISIONABLE = 'Entregado';
