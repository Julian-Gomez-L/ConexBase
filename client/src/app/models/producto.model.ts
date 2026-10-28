import { Activo, RegistroBase } from './api.model';

/** Tabla `productos` del backend. Los decimales llegan como texto ("150000.00"). */
export interface Producto extends RegistroBase {
  nombre: string;
  descripcion: string | null;
  precio: string;
  categoria_id: number;
  estado: Activo;
}
