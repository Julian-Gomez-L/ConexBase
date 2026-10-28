import { Activo, RegistroBase } from './api.model';

/** Tabla `roles` del backend. Los decimales llegan como texto ("150000.00"). */
// 1. roles
export interface Rol extends RegistroBase {
  nombre: string;
  descripcion: string | null;
  estado: Activo;
}

// 2. usuarios (la API nunca devuelve `password`; está en $hidden)
