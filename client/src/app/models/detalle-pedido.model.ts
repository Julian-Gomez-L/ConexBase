import { RegistroBase } from './api.model';

/** Tabla `detalle_pedidos` del backend. Los decimales llegan como texto ("150000.00"). */
export interface DetallePedido extends RegistroBase {
  pedido_id: number;
  /** Solo en pedidos anteriores al cambio (catálogo). Los nuevos van con especificaciones. */
  producto_id: number | null;
  diseno: string | null;
  descripcion: string | null;
  color_tela: string | null;
  tipo_tela: string | null;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
}
