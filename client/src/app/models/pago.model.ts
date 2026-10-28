import { RegistroBase } from './api.model';

/** Tabla `pagos` del backend. Los decimales llegan como texto ("150000.00"). */
export interface Pago extends RegistroBase {
  pedido_id: number;
  usuario_id: number;
  monto: string;
  metodo: string;
  /** Formato YYYY-MM-DD */
  fecha_pago: string;
  comprobante: string | null;
}
