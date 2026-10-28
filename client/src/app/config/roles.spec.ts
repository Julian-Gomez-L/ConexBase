import { describe, expect, it } from 'vitest';
import { resolverRol } from './roles';

describe('resolverRol', () => {
  it('reconoce los roles que siembra el backend', () => {
    expect(resolverRol('Administrador')).toBe('administrador');
    expect(resolverRol('Vendedor')).toBe('vendedor');
    expect(resolverRol('Encargado de Producción')).toBe('produccion');
    expect(resolverRol('Tapicero')).toBe('tapicero');
  });

  it('ignora tildes y mayúsculas, y acepta alias de la maqueta', () => {
    expect(resolverRol('FABRICACIÓN')).toBe('produccion');
    expect(resolverRol('Asesor Comercial')).toBe('vendedor');
    expect(resolverRol('Confirmador')).toBe('confirmador');
  });

  it('devuelve null si el rol no existe', () => {
    expect(resolverRol('Invitado')).toBeNull();
    expect(resolverRol(undefined)).toBeNull();
  });
});
