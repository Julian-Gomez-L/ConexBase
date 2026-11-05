import { Activo, RegistroBase } from './api.model';

/** Tabla `productos` del backend. Los decimales llegan como texto ("150000.00"). */
export interface Producto extends RegistroBase {
  nombre: string;
  /** Ej. "Doble 140x190". null si el producto no tiene medida. */
  medida: string | null;
  descripcion: string | null;
  precio: string;
  categoria_id: number;
  estado: Activo;
}

/**
 * Función PURA: el nombre con su medida, como se muestra en todo el sistema.
 * { nombre: 'Base cama', medida: 'Doble 140x190' } → "Base cama · Doble 140x190"
 */
export const nombreProducto = (p: Pick<Producto, 'nombre' | 'medida'>): string =>
  p.medida?.trim() ? `${p.nombre} · ${p.medida.trim()}` : p.nombre;
