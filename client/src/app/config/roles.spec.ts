import { describe, expect, it } from 'vitest';
import { cumpleRol, gestionaUsuarios, resolverRol } from './roles';

describe('resolverRol', () => {
  it('reconoce los roles que siembra el backend', () => {
    expect(resolverRol('Super Administrador')).toBe('superadmin');
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

describe('cumpleRol', () => {
  it('el Super Administrador hereda todo lo del Administrador', () => {
    expect(cumpleRol('superadmin', ['administrador'])).toBe(true);
    expect(cumpleRol('superadmin', ['administrador', 'confirmador'])).toBe(true);
    expect(cumpleRol('superadmin', ['vendedor'])).toBe(false);
  });

  it('los demás roles solo entran donde están permitidos', () => {
    expect(cumpleRol('administrador', ['administrador'])).toBe(true);
    expect(cumpleRol('administrador', ['superadmin'])).toBe(false);
    expect(cumpleRol('vendedor', ['administrador'])).toBe(false);
  });
});

describe('gestionaUsuarios', () => {
  it('solo el Super Administrador modifica usuarios', () => {
    expect(gestionaUsuarios('superadmin')).toBe(true);
    expect(gestionaUsuarios('administrador')).toBe(false);
    expect(gestionaUsuarios(null)).toBe(false);
  });
});
