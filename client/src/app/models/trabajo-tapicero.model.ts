import { RegistroBase } from './api.model';

/** Tabla `trabajos_tapiceros` del backend. Los decimales llegan como texto ("150000.00"). */
export interface TrabajoTapicero extends RegistroBase {
  produccion_id: number;
  usuario_id: number;
  /** Unidades que le tocan a este tapicero. null = todas (trabajos anteriores al reparto). */
  cantidad: number | null;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  /** Pendiente | En proceso | Finalizado */
  estado: string;
  observaciones: string | null;
  /** Lo que se le paga al tapicero por este trabajo ("150000.00"). Lo ponen Producción o el Administrador. */
  valor?: string | null;
  /** Nota opcional de quien puso el valor. */
  observacion_valor?: string | null;
  /** DATETIME en que el gerente (Administrador) lo marcó revisado; null = sin revisar. */
  revisado_en?: string | null;
  revisado_por?: number | null;
}
