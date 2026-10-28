import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Colores por estado (misma paleta ámbar / cian / esmeralda de la maqueta). */
const ESTILOS: Record<string, string> = {
  pendiente: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  confirmado: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  'en produccion': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'en proceso': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  finalizado: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  finalizada: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  entregado: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  cancelado: 'bg-red-500/20 text-red-300 border-red-500/30',
};
const POR_DEFECTO = 'bg-secondary text-muted-foreground border-border';

/** Normaliza "En producción" → "en produccion" para buscar el estilo sin depender de tildes. */
export const normalizarEstado = (estado: string): string =>
  estado
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

@Component({
  selector: 'app-estado-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span
    class="px-3 py-1 rounded-full text-xs border whitespace-nowrap"
    [class]="estilo()"
    >{{ estado() }}</span
  >`,
})
export class EstadoBadgeComponent {
  readonly estado = input.required<string>();
  protected readonly estilo = computed(
    () => ESTILOS[normalizarEstado(this.estado())] ?? POR_DEFECTO,
  );
}
