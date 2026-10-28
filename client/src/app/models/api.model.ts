/**
 * Contratos genéricos de la API Laravel de ConexBase.
 * Fuente: controladores y excepciones del backend (ConexBase-back).
 */

/** Campos que Laravel agrega a TODAS las tablas (timestamps + borrado lógico). */
export interface RegistroBase {
  id: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at?: string | null;
}

/**
 * Laravel/MySQL puede devolver `tinyint` como boolean o como 0/1 según el driver.
 * Usa `estaActivo()` para no depender de eso.
 */
export type Activo = boolean | 0 | 1;
export const estaActivo = (v: Activo): boolean => v === true || v === 1;

/** Respuesta de éxito: el backend siempre responde { success: true, message, data }. */
export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

/** Error del backend (404 NOT_FOUND, 422 INVALID_ID / VALIDATION_ERROR, 401, 403, 429). */
export interface ApiErrorBody {
  success?: false;
  message?: string;
  error?: string;
  status?: number;
  /** Errores de validación de Laravel (HTTP 422): campo → mensajes. */
  errors?: Record<string, string[]>;
}

/** Error ya normalizado que consume la interfaz (lo crea el errorInterceptor). */
export interface AppError {
  status: number;
  message: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
}

/** Datos para crear: todo menos lo que genera el servidor. */
export type Crear<T extends RegistroBase> = Omit<
  T,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;
/** Datos para actualizar: igual que crear, pero todo opcional. */
export type Actualizar<T extends RegistroBase> = Partial<Crear<T>>;
