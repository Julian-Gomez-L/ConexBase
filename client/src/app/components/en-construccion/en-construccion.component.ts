import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideConstruction } from '@lucide/angular';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';

/**
 * Pantalla temporal para los módulos que aún no se implementan.
 * `titulo` llega desde `data` de la ruta gracias a withComponentInputBinding().
 */
@Component({
  selector: 'app-en-construccion',
  imports: [PageHeaderComponent, LucideConstruction],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <app-page-header
        [titulo]="titulo()"
        subtitulo="Este módulo se implementará en la siguiente fase."
      />
      <div class="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
        <svg lucideConstruction class="w-16 h-16 mx-auto mb-4 opacity-30" aria-hidden="true"></svg>
        <p>Módulo en construcción</p>
      </div>
    </div>
  `,
})
export class EnConstruccionComponent {
  readonly titulo = input('Módulo');
}
