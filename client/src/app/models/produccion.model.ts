import { RegistroBase } from './api.model';

/** Tabla `producciones` del backend. Los decimales llegan como texto ("150000.00"). */
export interface Produccion extends RegistroBase {
  pedido_id: number;
  /** Producciones anteriores al cambio (catálogo). */
  producto_id: number | null;
  /** Producto del pedido (detalle) que se fabrica. */
  detalle_pedido_id: number | null;
  usuario_id: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  /** Pendiente | En proceso | Finalizada */
  estado: string;
  observaciones: string | null;
}
