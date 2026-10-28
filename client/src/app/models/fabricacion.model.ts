import { normalizarEstado } from '@app/components/estado-badge/estado-badge.component';
import { resolverRol } from '@app/config/roles';
import { estaActivo } from './api.model';
import { HistorialPedido } from './historial-pedido.model';
import { fechaMysql, PedidoVista } from './pedido-vista.model';
import { Produccion } from './produccion.model';
import { Rol } from './rol.model';
import { TrabajoTapicero } from './trabajo-tapicero.model';
import { Usuario } from './usuario.model';

/** Estados de una producción (tabla `producciones`). */
export const ESTADOS_PRODUCCION = ['Pendiente', 'En proceso', 'Finalizada'] as const;

/** Estados de un trabajo de tapicería (tabla `trabajos_tapiceros`). */
export const ESTADOS_TRABAJO = { pendiente: 'Pendiente', enProceso: 'En proceso', finalizado: 'Finalizado' };

export interface TrabajoVista {
  trabajo: TrabajoTapicero;
  tapicero: string;
}

export interface ProduccionVista {
  produccion: Produccion;
  producto: string;
  cantidad: number;
  terminada: boolean;
  /** Trabajos de tapicería de esta producción (el último primero). */
  trabajos: TrabajoVista[];
  /** true si tiene un trabajo sin terminar: no se ofrece asignar otro. */
  tapiceroActivo: boolean;
}

export interface PedidoEnFabricacion {
  pedido: PedidoVista;
  /** Cuándo entró al estado actual (historial), o la fecha de creación. */
  desde: Date;
  producciones: ProduccionVista[];
  /** Se puede marcar Finalizado: tiene producciones y todas están terminadas. */
  listoParaFinalizar: boolean;
}

export interface Tablero {
  porIniciar: PedidoEnFabricacion[];
  enFabricacion: PedidoEnFabricacion[];
  listos: PedidoEnFabricacion[];
  entregadosRecientes: PedidoEnFabricacion[];
  tapiceros: Usuario[];
  resumen: {
    porIniciar: number;
    enFabricacion: number;
    productosEnFabricacion: number;
    listos: number;
    entregadosEsteMes: number;
  };
}

const nombre = (u: Usuario | undefined) => (u ? `${u.nombre} ${u.apellido}`.trim() : 'Tapicero');

/**
 * Función PURA: organiza los pedidos de Confirmado a Entregado en las columnas
 * de Fabricación, con sus producciones y trabajos de tapicería.
 */
export function construirTablero(
  vistas: PedidoVista[],
  producciones: Produccion[],
  trabajos: TrabajoTapicero[],
  usuarios: Usuario[],
  roles: Rol[],
  historial: HistorialPedido[],
  hoy = new Date(),
): Tablero {
  const usuariosPorId = new Map(usuarios.map((u) => [u.id, u]));
  const idsRolTapicero = new Set(roles.filter((r) => resolverRol(r.nombre) === 'tapicero').map((r) => r.id));
  const tapiceros = usuarios
    .filter((u) => idsRolTapicero.has(u.rol_id) && estaActivo(u.estado))
    .sort((a, b) => nombre(a).localeCompare(nombre(b)));

  // Fecha en que cada pedido llegó a su estado actual
  const llegada = new Map<string, Date>();
  for (const h of historial) {
    const clave = `${h.pedido_id}|${normalizarEstado(h.estado_nuevo ?? '')}`;
    const fecha = fechaMysql(h.fecha);
    const previa = llegada.get(clave);
    if (!previa || fecha > previa) llegada.set(clave, fecha);
  }

  const armar = (pedido: PedidoVista): PedidoEnFabricacion => {
    const prods = producciones
      .filter((pr) => pr.pedido_id === pedido.id)
      .sort((a, b) => a.id - b.id)
      .map((pr): ProduccionVista => {
        const item = pedido.items.find((i) => i.productoId === pr.producto_id);
        const suyos = trabajos
          .filter((t) => t.produccion_id === pr.id)
          .sort((a, b) => b.id - a.id)
          .map((t) => ({ trabajo: t, tapicero: nombre(usuariosPorId.get(t.usuario_id)) }));
        return {
          produccion: pr,
          producto: item?.nombre ?? `Producto #${pr.producto_id}`,
          cantidad: item?.cantidad ?? 1,
          terminada: normalizarEstado(pr.estado).startsWith('finaliz'),
          trabajos: suyos,
          tapiceroActivo: suyos.some(
            (t) => !normalizarEstado(t.trabajo.estado).startsWith('finaliz'),
          ),
        };
      });
    return {
      pedido,
      desde: llegada.get(`${pedido.id}|${normalizarEstado(pedido.estado)}`) ?? pedido.creadoEn,
      producciones: prods,
      listoParaFinalizar: prods.length > 0 && prods.every((p) => p.terminada),
    };
  };

  const enEstado = (estado: string) =>
    vistas.filter((v) => normalizarEstado(v.estado) === estado).map(armar);
  const masAntiguoPrimero = (a: PedidoEnFabricacion, b: PedidoEnFabricacion) =>
    a.desde.getTime() - b.desde.getTime();

  const porIniciar = enEstado('confirmado').sort(masAntiguoPrimero);
  const enFabricacion = enEstado('en produccion').sort(masAntiguoPrimero);
  const listos = enEstado('finalizado').sort(masAntiguoPrimero);
  const entregados = enEstado('entregado').sort((a, b) => b.desde.getTime() - a.desde.getTime());

  return {
    porIniciar,
    enFabricacion,
    listos,
    entregadosRecientes: entregados.slice(0, 3),
    tapiceros,
    resumen: {
      porIniciar: porIniciar.length,
      enFabricacion: enFabricacion.length,
      productosEnFabricacion: enFabricacion.reduce((s, p) => s + p.producciones.length, 0),
      listos: listos.length,
      entregadosEsteMes: entregados.filter(
        (e) => e.desde.getFullYear() === hoy.getFullYear() && e.desde.getMonth() === hoy.getMonth(),
      ).length,
    },
  };
}
