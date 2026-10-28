import { RegistroBase } from './api.model';

/** Tabla `historial_pedidos` del backend. Los decimales llegan como texto ("150000.00"). */
export interface HistorialPedido extends RegistroBase {
  pedido_id: number;
  usuario_id: number;
  cliente_id: number;
  estado_anterior: string | null;
  estado_nuevo: string | null;
  observacion: string | null;
  /** DATETIME: YYYY-MM-DD HH:mm:ss */
  fecha: string;
}
