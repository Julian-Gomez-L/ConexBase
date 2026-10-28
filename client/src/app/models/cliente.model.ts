import { Activo, RegistroBase } from './api.model';

/** Tabla `clientes` del backend. Los decimales llegan como texto ("150000.00"). */
export interface Cliente extends RegistroBase {
  documento: string;
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string | null;
  estado: Activo;
}
