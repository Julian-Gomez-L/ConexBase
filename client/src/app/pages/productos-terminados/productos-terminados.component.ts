import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideBadgeCheck, LucideChevronLeft, LucideChevronRight, LucideRefreshCw } from '@lucide/angular';
import { finalize, forkJoin } from 'rxjs';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { AppError } from '@app/models';
import { construirMisTrabajos, MisTrabajos, trabajosDeLaSemana } from '@app/models/mis-trabajos.model';
import { ProduccionesService, TrabajosTapicerosService } from '@app/services/api';
import { AuthService } from '@app/services/auth.service';
import { PedidosFacadeService } from '@app/services/pedidos-facade.service';
import { etiquetaSemana, fechaCorta, lunesDe, sumarDias } from '@app/utils/fecha';
import { formatearCOP } from '@app/utils/format';

/**
 * Productos Terminados (Tapicero): por semana (lunes a domingo), lo que
 * terminó, el valor que Producción le puso a cada trabajo, si el gerente ya
 * lo revisó y el total de la semana.
 */
@Component({
  selector: 'app-productos-terminados',
  imports: [PageHeaderComponent, LucideRefreshCw, LucideChevronLeft, LucideChevronRight, LucideBadgeCheck],
  templateUrl: './productos-terminados.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosTerminadosComponent implements OnInit {
  private readonly facade = inject(PedidosFacadeService);
  private readonly trabajosApi = inject(TrabajosTapicerosService);
  private readonly produccionesApi = inject(ProduccionesService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  protected readonly datos = signal<MisTrabajos | null>(null);

  private readonly lunesActual = lunesDe(new Date());
  protected readonly lunes = signal(this.lunesActual);
  protected readonly esSemanaActual = computed(() => this.lunes().getTime() === this.lunesActual.getTime());
  protected readonly tituloSemana = computed(() => etiquetaSemana(this.lunes()));
  protected readonly semana = computed(() => {
    const d = this.datos();
    return d ? trabajosDeLaSemana(d.terminados, this.lunes()) : null;
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    const yo = this.auth.sesion()?.usuarioId;
    if (!yo) return;
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      base: this.facade.listarConDatos(),
      trabajos: this.trabajosApi.listar(),
      producciones: this.produccionesApi.listar(),
    })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ base, trabajos, producciones }) =>
          this.datos.set(construirMisTrabajos(trabajos, producciones, base.vistas, base.datos.usuarios, yo)),
        error: (e: AppError) => this.error.set(e),
      });
  }

  protected moverSemana(semanas: number): void {
    this.lunes.set(sumarDias(this.lunes(), semanas * 7));
  }

  protected fecha(d: Date | null): string {
    return d ? fechaCorta(d) : '—';
  }

  protected readonly formatearCOP = formatearCOP;
}
