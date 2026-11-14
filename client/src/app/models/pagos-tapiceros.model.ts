import { construirMisTrabajos, SemanaDeTrabajo, trabajosDeLaSemana } from './mis-trabajos.model';
import { PedidoVista } from './pedido-vista.model';
import { Produccion } from './produccion.model';
import { TrabajoTapicero } from './trabajo-tapicero.model';
import { Usuario } from './usuario.model';

export interface PagoTapicero extends SemanaDeTrabajo {
  tapicero: Usuario;
  nombre: string;
}

export interface PagosDeLaSemana {
  filas: PagoTapicero[];
  total: number;
  sinValor: number;
  trabajos: number;
}

/**
 * Función PURA: por cada tapicero, los trabajos que terminó en la semana del
 * `lunes` y cuánto suma lo que hizo. Usa las mismas funciones que "Mis
 * Productos", así el total coincide con el que ve cada tapicero.
 */
export function pagosDeLaSemana(
  trabajos: TrabajoTapicero[],
  producciones: Produccion[],
  vistas: PedidoVista[],
  usuarios: Usuario[],
  lunes: Date,
): PagosDeLaSemana {
  const ids = [...new Set(trabajos.map((t) => t.usuario_id))];
  const porId = new Map(usuarios.map((u) => [u.id, u]));

  const filas = ids
    .map((id): PagoTapicero | null => {
      const tapicero = porId.get(id);
      if (!tapicero) return null;
      const { terminados } = construirMisTrabajos(trabajos, producciones, vistas, usuarios, id);
      const semana = trabajosDeLaSemana(terminados, lunes);
      return semana.trabajos.length
        ? { ...semana, tapicero, nombre: `${tapicero.nombre} ${tapicero.apellido}`.trim() }
        : null;
    })
    .filter((f): f is PagoTapicero => f !== null)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return {
    filas,
    total: filas.reduce((s, f) => s + f.total, 0),
    sinValor: filas.reduce((s, f) => s + f.sinValor, 0),
    trabajos: filas.reduce((s, f) => s + f.trabajos.length, 0),
  };
}
