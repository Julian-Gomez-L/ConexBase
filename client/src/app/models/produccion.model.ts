import { RegistroBase } from './api.model';

/** Tabla `producciones` del backend. Los decimales llegan como texto ("150000.00"). */
export interface Produccion extends RegistroBase {
  pedido_id: number;
  producto_id: number;
  usuario_id: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  /** Pendiente | En proceso | Finalizada */
  estado: string;
  observaciones: string | null;
}
