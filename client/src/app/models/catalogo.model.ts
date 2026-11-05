import { aNumero } from '@app/utils/format';
import { estaActivo } from './api.model';
import { Categoria } from './categoria.model';
import { nombreProducto, Producto } from './producto.model';

/** Fila de la tabla de productos de la pantalla Catálogo. */
export interface FilaProducto {
  producto: Producto;
  nombre: string;
  categoria: string;
  precio: number;
  activo: boolean;
}

/** Tarjeta/fila de una categoría con cuántos productos tiene. */
export interface FilaCategoria {
  categoria: Categoria;
  productos: number;
  activos: number;
  activa: boolean;
}

const sinTildes = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Función PURA: arma la tabla de productos filtrada por texto (nombre, medida o
 * descripción, sin importar tildes) y por categoría. Activos primero; luego por
 * nombre y medida.
 */
export function filasProductos(
  productos: Producto[],
  categorias: Categoria[],
  texto: string,
  categoriaId: number | null,
): FilaProducto[] {
  const nombres = new Map(categorias.map((c) => [c.id, c.nombre]));
  const t = sinTildes(texto.trim());

  return productos
    .filter((p) => !categoriaId || p.categoria_id === categoriaId)
    .filter((p) => !t || sinTildes(`${nombreProducto(p)} ${p.descripcion ?? ''}`).includes(t))
    .map((p) => ({
      producto: p,
      nombre: nombreProducto(p),
      categoria: nombres.get(p.categoria_id) ?? '—',
      precio: aNumero(p.precio),
      activo: estaActivo(p.estado),
    }))
    .sort(
      (a, b) =>
        Number(b.activo) - Number(a.activo) ||
        a.producto.nombre.localeCompare(b.producto.nombre) ||
        (a.producto.medida ?? '').localeCompare(b.producto.medida ?? ''),
    );
}

/** Función PURA: categorías con su conteo de productos, activas primero. */
export function filasCategorias(categorias: Categoria[], productos: Producto[]): FilaCategoria[] {
  return categorias
    .map((c) => {
      const suyos = productos.filter((p) => p.categoria_id === c.id);
      return {
        categoria: c,
        productos: suyos.length,
        activos: suyos.filter((p) => estaActivo(p.estado)).length,
        activa: estaActivo(c.estado),
      };
    })
    .sort(
      (a, b) =>
        Number(b.activa) - Number(a.activa) || a.categoria.nombre.localeCompare(b.categoria.nombre),
    );
}

/**
 * Función PURA: true si ya existe OTRO producto con el mismo nombre y medida
 * (sin importar mayúsculas ni tildes). Sirve para avisar antes de duplicar.
 */
export function productoRepetido(
  productos: Producto[],
  nombre: string,
  medida: string | null,
  idEditando: number | null,
): boolean {
  const clave = (n: string, m: string | null) =>
    `${sinTildes(n.trim())}|${sinTildes((m ?? '').trim())}`;
  const buscada = clave(nombre, medida);
  return productos.some((p) => p.id !== idEditando && clave(p.nombre, p.medida) === buscada);
}
