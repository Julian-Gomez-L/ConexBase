import { RegistroBase } from './api.model';

/** Tabla `detalle_pedidos` del backend. Los decimales llegan como texto ("150000.00"). */
export interface DetallePedido extends RegistroBase {
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
}
