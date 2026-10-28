import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h1 class="text-3xl font-semibold tracking-tight">{{ titulo() }}</h1>
      @if (subtitulo()) {
        <p class="text-muted-foreground mt-1">{{ subtitulo() }}</p>
      }
    </div>
  `,
})
export class PageHeaderComponent {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>('');
}
