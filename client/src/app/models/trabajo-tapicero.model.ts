import { RegistroBase } from './api.model';

/** Tabla `trabajos_tapiceros` del backend. Los decimales llegan como texto ("150000.00"). */
export interface TrabajoTapicero extends RegistroBase {
  produccion_id: number;
  usuario_id: number;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  /** Pendiente | En proceso | Finalizado */
  estado: string;
  observaciones: string | null;
}
