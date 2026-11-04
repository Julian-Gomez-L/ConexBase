import { describe, expect, it } from 'vitest';
import {
  contarDelDia,
  filtrarIntentos,
  IntentoLogin,
  resumirNavegador,
} from './intento-login.model';

const intento = (
  id: number,
  correo: string,
  fecha: string,
  extra: Partial<IntentoLogin> = {},
): IntentoLogin => ({
  id,
  correo,
  usuario_id: null,
  nombre: null,
  rol: null,
  motivo: 'El correo no existe',
  ip: '192.168.1.20',
  navegador: null,
  fecha,
  created_at: null,
  updated_at: null,
  ...extra,
});

describe('resumirNavegador', () => {
  it('reconoce los navegadores y sistemas más comunes', () => {
    expect(
      resumirNavegador(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      ),
    ).toBe('Chrome en Windows');
    expect(
      resumirNavegador(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36 Edg/131.0',
      ),
    ).toBe('Edge en Windows');
    expect(
      resumirNavegador(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0',
      ),
    ).toBe('Firefox en Mac');
    expect(
      resumirNavegador(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
      ),
    ).toBe('Safari en iPhone/iPad');
    expect(
      resumirNavegador(
        'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36',
      ),
    ).toBe('Chrome en Android');
  });

  it('marca lo que no es un navegador (por ejemplo, un script o Postman)', () => {
    expect(resumirNavegador('PostmanRuntime/7.42.0')).toBe('Otro (no es un navegador)');
    expect(resumirNavegador(null)).toBe('Desconocido');
  });
});

describe('filtrarIntentos', () => {
  const lista = [
    intento(1, 'sofia@conexbase.com', '2026-11-03 19:35:12', {
      nombre: 'Sofia Castro',
      motivo: 'Contraseña incorrecta',
    }),
    intento(2, 'nadie@gmail.com', '2026-11-03 19:36:40', { ip: '10.0.0.7' }),
  ];

  it('busca por correo, nombre, IP o motivo, sin importar mayúsculas', () => {
    expect(filtrarIntentos(lista, 'SOFIA').map((i) => i.id)).toEqual([1]);
    expect(filtrarIntentos(lista, 'castro').map((i) => i.id)).toEqual([1]);
    expect(filtrarIntentos(lista, '10.0.0').map((i) => i.id)).toEqual([2]);
    expect(filtrarIntentos(lista, 'contraseña').map((i) => i.id)).toEqual([1]);
  });

  it('sin texto devuelve todo', () => {
    expect(filtrarIntentos(lista, '  ')).toHaveLength(2);
  });
});

describe('contarDelDia', () => {
  it('cuenta solo los intentos de ese día', () => {
    const lista = [
      intento(1, 'a@x.com', '2026-11-03 08:00:00'),
      intento(2, 'b@x.com', '2026-11-03 23:59:59'),
      intento(3, 'c@x.com', '2026-11-02 23:59:59'),
    ];
    expect(contarDelDia(lista, '2026-11-03')).toBe(2);
  });
});
