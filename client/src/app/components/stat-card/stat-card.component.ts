import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideDynamicIcon, LucideIconData } from '@lucide/angular';

/** Tarjeta de métrica (réplica de StatCard.tsx de la maqueta). */
@Component({
  selector: 'app-stat-card',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-card border border-border rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <svg [lucideIcon]="icono()" class="w-8 h-8" [class]="colorIcono()" aria-hidden="true"></svg>
      </div>
      <div class="text-3xl font-semibold mb-1">{{ valor() }}</div>
      <div class="text-sm text-muted-foreground">{{ etiqueta() }}</div>
      @if (detalle()) {
        <div class="text-xs text-muted-foreground mt-2">{{ detalle() }}</div>
      }
    </div>
  `,
})
export class StatCardComponent {
  readonly etiqueta = input.required<string>();
  readonly valor = input.required<string | number>();
  readonly icono = input.required<LucideIconData>();
  readonly detalle = input<string>('');
  readonly variante = input<'dorado' | 'exito' | 'alerta'>('dorado');

  protected colorIcono(): string {
    return { dorado: 'text-primary', exito: 'text-emerald-400', alerta: 'text-amber-400' }[
      this.variante()
    ];
  }
}
