import { Activo, RegistroBase } from './api.model';

/** Tabla `usuarios` del backend. Los decimales llegan como texto ("150000.00"). */
export interface Usuario extends RegistroBase {
  documento: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol_id: number;
  estado: Activo;
}
/** `password` solo se envía al crear/actualizar. */
export type UsuarioPayload = Omit<Usuario, keyof RegistroBase> & { password?: string };
