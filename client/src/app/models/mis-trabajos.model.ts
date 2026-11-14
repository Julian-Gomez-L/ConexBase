import { normalizarEstado } from '@app/components/estado-badge/estado-badge.component';
import { desdeFechaISO, fechaISO, sumarDias } from '@app/utils/fecha';
import { aNumero } from '@app/utils/format';
import { itemDeProduccion, PedidoVista } from './pedido-vista.model';
import { Produccion } from './produccion.model';
import { TrabajoTapicero } from './trabajo-tapicero.model';
import { Usuario } from './usuario.model';

export interface MiTrabajo {
  trabajo: TrabajoTapicero;
  pedidoCodigo: string;
  cliente: string;
  producto: string;
  /** "Tela lino · color gris" */
  tela: string;
  descripcion: string | null;
  /** Lugar de entrega del pedido. */
  localidad: string | null;
  cantidad: number;
  /** Quien registró la producción (encargado de producción). */
  asignadoPor: string;
  inicio: Date | null;
  fin: Date | null;
  estado: 'pendiente' | 'en proceso' | 'finalizado';
  /** Lo que se le paga por este trabajo; null = Producción aún no pone el valor. */
  valor: number | null;
  notaValor: string | null;
  /** El gerente (Administrador) ya lo revisó. */
  revisado: boolean;
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
      const item = produccion ? itemDeProduccion(pedido, produccion) : undefined;
      const encargado = produccion ? usuarioPorId.get(produccion.usuario_id) : undefined;
      const e = normalizarEstado(t.estado);
      return {
        trabajo: t,
        pedidoCodigo: pedido?.codigo ?? '—',
        cliente: pedido?.cliente?.nombre ?? '—',
        producto: item?.nombre ?? (produccion ? `Producto #${produccion.producto_id ?? produccion.detalle_pedido_id}` : '—'),
        tela: item?.tela ?? '',
        descripcion: item?.descripcion ?? null,
        localidad: pedido?.localidad ?? null,
        cantidad: t.cantidad ?? item?.cantidad ?? 1,
        asignadoPor: encargado ? `${encargado.nombre} ${encargado.apellido}` : '—',
        inicio: t.fecha_inicio ? desdeFechaISO(t.fecha_inicio) : null,
        fin: t.fecha_fin ? desdeFechaISO(t.fecha_fin) : null,
        estado: e.startsWith('finaliz') ? 'finalizado' : e === 'en proceso' ? 'en proceso' : 'pendiente',
        valor: t.valor === null || t.valor === undefined ? null : aNumero(t.valor),
        notaValor: t.observacion_valor ?? null,
        revisado: !!t.revisado_en,
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

export interface SemanaDeTrabajo {
  /** Trabajos terminados entre el lunes y el domingo (por fecha de fin). */
  trabajos: MiTrabajo[];
  /** Suma de los valores ya puestos. */
  total: number;
  /** Cuántos todavía no tienen valor. */
  sinValor: number;
  revisados: number;
}

/**
 * Función PURA: los trabajos terminados en la semana que empieza en `lunes`
 * y cuánto suman. Los que no tienen valor no suman (se cuentan aparte).
 */
export function trabajosDeLaSemana(terminados: MiTrabajo[], lunes: Date): SemanaDeTrabajo {
  const desde = fechaISO(lunes);
  const hasta = fechaISO(sumarDias(lunes, 6));
  const trabajos = terminados.filter((m) => {
    const dia = m.fin ? fechaISO(m.fin) : null;
    return dia !== null && dia >= desde && dia <= hasta;
  });
  return {
    trabajos,
    total: trabajos.reduce((s, m) => s + (m.valor ?? 0), 0),
    sinValor: trabajos.filter((m) => m.valor === null).length,
    revisados: trabajos.filter((m) => m.revisado).length,
  };
}
