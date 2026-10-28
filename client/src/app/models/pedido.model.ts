import { RegistroBase } from './api.model';

/** Tabla `pedidos` del backend. Los decimales llegan como texto ("150000.00"). */
export interface Pedido extends RegistroBase {
  cliente_id: number;
  usuario_id: number;
  /** Texto libre (50). Valores usados: Pendiente, Confirmado, En producción, Finalizado, Entregado, Cancelado. */
  estado: string;
  total: string;
}
