/** GET /api/recuperacion-admin: si hay un código guardado (nunca el código). */
export interface EstadoRecuperacion {
  configurado: boolean;
  /** "YYYY-MM-DD HH:mm:ss" (hora de Colombia) */
  generado_en: string | null;
  generado_por: string | null;
}

/** POST /api/recuperacion-admin/codigo: la única vez que se ve el código. */
export interface CodigoGenerado {
  codigo: string;
  generado_en: string;
}

/** POST /api/auth/recuperar-admin */
export interface DatosRecuperacion {
  codigo: string;
  documento: string;
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  password_confirmation: string;
}
