import { describe, expect, it } from 'vitest';
import { filasCategorias, filasProductos, productoRepetido } from './catalogo.model';
import { Categoria } from './categoria.model';
import { nombreProducto, Producto } from './producto.model';

const base = { created_at: null, updated_at: null };
const cat = (id: number, nombre: string, estado = true): Categoria => ({
  id,
  nombre,
  descripcion: null,
  estado,
  ...base,
});
const prod = (
  id: number,
  nombre: string,
  medida: string | null,
  precio: string,
  categoria_id: number,
  estado = true,
): Producto => ({
  id,
  nombre,
  medida,
  descripcion: null,
  precio,
  categoria_id,
  estado,
  ...base,
});

const categorias = [cat(1, 'Camas'), cat(2, 'Colchones')];
const productos = [
  prod(1, 'Base cama', 'Queen 160x190', '990000.00', 1),
  prod(2, 'Base cama', 'Doble 140x190', '850000.00', 1),
  prod(3, 'Colchón Ortopédico', 'Doble 140x190', '1200000.00', 2),
  prod(4, 'Cojín', null, '45000.00', 1, false),
];

describe('nombreProducto', () => {
  it('agrega la medida al nombre, o deja solo el nombre si no tiene', () => {
    expect(nombreProducto({ nombre: 'Base cama', medida: 'Doble 140x190' })).toBe(
      'Base cama · Doble 140x190',
    );
    expect(nombreProducto({ nombre: 'Cojín', medida: null })).toBe('Cojín');
    expect(nombreProducto({ nombre: 'Cojín', medida: '  ' })).toBe('Cojín');
  });
});

describe('filasProductos', () => {
  it('activos primero, luego por nombre y medida, con categoría y precio como número', () => {
    const filas = filasProductos(productos, categorias, '', null);
    expect(filas.map((f) => f.producto.id)).toEqual([2, 1, 3, 4]);
    expect(filas[0]).toMatchObject({
      nombre: 'Base cama · Doble 140x190',
      categoria: 'Camas',
      precio: 850000,
      activo: true,
    });
  });

  it('busca por nombre o medida sin importar tildes ni mayúsculas, y filtra por categoría', () => {
    expect(
      filasProductos(productos, categorias, 'colchon', null).map((f) => f.producto.id),
    ).toEqual([3]);
    expect(filasProductos(productos, categorias, 'doble', null).map((f) => f.producto.id)).toEqual([
      2, 3,
    ]);
    expect(filasProductos(productos, categorias, '', 2).map((f) => f.producto.id)).toEqual([3]);
  });
});

describe('filasCategorias', () => {
  it('cuenta los productos de cada categoría (total y activos)', () => {
    const filas = filasCategorias(categorias, productos);
    expect(filas.find((f) => f.categoria.id === 1)).toMatchObject({
      productos: 3,
      activos: 2,
      activa: true,
    });
    expect(filas.find((f) => f.categoria.id === 2)).toMatchObject({ productos: 1, activos: 1 });
  });
});

describe('productoRepetido', () => {
  it('detecta el mismo nombre y medida, sin importar mayúsculas ni tildes', () => {
    expect(productoRepetido(productos, 'BASE CAMA', 'doble 140x190', null)).toBe(true);
    expect(productoRepetido(productos, 'Colchon ortopedico', 'Doble 140x190', null)).toBe(true);
  });

  it('el mismo nombre en otra medida no es repetido, ni el propio producto al editarlo', () => {
    expect(productoRepetido(productos, 'Base cama', 'King 200x200', null)).toBe(false);
    expect(productoRepetido(productos, 'Base cama', 'Doble 140x190', 2)).toBe(false);
    expect(productoRepetido(productos, 'Cojín', null, null)).toBe(true);
  });
});
