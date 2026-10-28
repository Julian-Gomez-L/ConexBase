import { Activo, RegistroBase } from './api.model';

/** Tabla `categorias` del backend. Los decimales llegan como texto ("150000.00"). */
export interface Categoria extends RegistroBase {
  nombre: string;
  descripcion: string | null;
  estado: Activo;
}
