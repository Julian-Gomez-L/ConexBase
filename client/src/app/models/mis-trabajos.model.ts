import { normalizarEstado } from '@app/components/estado-badge/estado-badge.component';
import { desdeFechaISO } from '@app/utils/fecha';
import { PedidoVista } from './pedido-vista.model';
import { Produccion } from './produccion.model';
import { TrabajoTapicero } from './trabajo-tapicero.model';
import { Usuario } from './usuario.model';

export interface MiTrabajo {
  trabajo: TrabajoTapicero;
  pedidoCodigo: string;
  cliente: string;
  producto: string;
  cantidad: number;
  /** Quien registró la producción (encargado de producción). */
  asignadoPor: string;
  inicio: Date | null;
  fin: Date | null;
  estado: 'pendiente' | 'en proceso' | 'finalizado';
}

export interface MisTrabajos {
  activos: MiTrabajo[];
  terminados: MiTrabajo[];
  resumen: { enProceso: number; porEmpezar: number; terminadosEsteMes: number };
}

/**
 * Función PURA: los trabajos de tapicería de un tapicero, con el pedido,
 * cliente y producto de cada uno.
 */
export function construirMisTrabajos(
  trabajos: TrabajoTapicero[],
  producciones: Produccion[],
  vistas: PedidoVista[],
  usuarios: Usuario[],
  tapiceroId: number,
  hoy = new Date(),
): MisTrabajos {
  const produccionPorId = new Map(producciones.map((p) => [p.id, p]));
  const pedidoPorId = new Map(vistas.map((v) => [v.id, v]));
  const usuarioPorId = new Map(usuarios.map((u) => [u.id, u]));

  const mios = trabajos
    .filter((t) => t.usuario_id === tapiceroId)
    .map((t): MiTrabajo => {
      const produccion = produccionPorId.get(t.produccion_id);
      const pedido = produccion ? pedidoPorId.get(produccion.pedido_id) : undefined;
      const item = pedido?.items.find((i) => i.productoId === produccion?.producto_id);
      const encargado = produccion ? usuarioPorId.get(produccion.usuario_id) : undefined;
      const e = normalizarEstado(t.estado);
      return {
        trabajo: t,
        pedidoCodigo: pedido?.codigo ?? '—',
        cliente: pedido?.cliente?.nombre ?? '—',
        producto: item?.nombre ?? (produccion ? `Producto #${produccion.producto_id}` : '—'),
        cantidad: item?.cantidad ?? 1,
        asignadoPor: encargado ? `${encargado.nombre} ${encargado.apellido}` : '—',
        inicio: t.fecha_inicio ? desdeFechaISO(t.fecha_inicio) : null,
        fin: t.fecha_fin ? desdeFechaISO(t.fecha_fin) : null,
        estado: e.startsWith('finaliz') ? 'finalizado' : e === 'en proceso' ? 'en proceso' : 'pendiente',
      };
    });

  // Primero lo que está en proceso, luego lo pendiente; los más antiguos arriba
  const orden = { 'en proceso': 0, pendiente: 1, finalizado: 2 };
  const activos = mios
    .filter((m) => m.estado !== 'finalizado')
    .sort((a, b) => orden[a.estado] - orden[b.estado] || (a.inicio?.getTime() ?? 0) - (b.inicio?.getTime() ?? 0));
  const terminados = mios
    .filter((m) => m.estado === 'finalizado')
    .sort((a, b) => (b.fin?.getTime() ?? 0) - (a.fin?.getTime() ?? 0));

  return {
    activos,
    terminados,
    resumen: {
      enProceso: activos.filter((m) => m.estado === 'en proceso').length,
      porEmpezar: activos.filter((m) => m.estado === 'pendiente').length,
      terminadosEsteMes: terminados.filter(
        (m) => m.fin && m.fin.getFullYear() === hoy.getFullYear() && m.fin.getMonth() === hoy.getMonth(),
      ).length,
    },
  };
}
