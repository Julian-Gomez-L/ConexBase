/** Respuesta de `POST /api/auth/login` (campo `data`). */
export interface LoginData {
  token: string;
  tipo: 'Bearer';
  /** ISO 8601. El backend emite tokens de 8 horas. */
  expira_en: string;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    rol: { id: number; nombre: string };
  };
}
