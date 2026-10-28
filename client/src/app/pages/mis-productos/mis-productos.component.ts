import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LucideCheck,
  LucideCircleCheck,
  LucideClock,
  LucidePlay,
  LucideRefreshCw,
  LucideScissors,
} from '@lucide/angular';
import { finalize, forkJoin, Observable } from 'rxjs';
import { EstadoBadgeComponent } from '@app/components/estado-badge/estado-badge.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { StatCardComponent } from '@app/components/stat-card/stat-card.component';
import { AppError } from '@app/models';
import { ESTADOS_TRABAJO } from '@app/models/fabricacion.model';
import { construirMisTrabajos, MiTrabajo, MisTrabajos } from '@app/models/mis-trabajos.model';
import { ProduccionesService, TrabajosTapicerosService } from '@app/services/api';
import { AuthService } from '@app/services/auth.service';
import { PedidosFacadeService } from '@app/services/pedidos-facade.service';
import { fechaCorta, fechaISO } from '@app/utils/fecha';

/**
 * Mis Productos (Tapicero): los trabajos de tapicería asignados a quien
 * inició sesión. Puede empezarlos, dejar observaciones y marcarlos terminados.
 */
@Component({
  selector: 'app-mis-productos',
  imports: [
    PageHeaderComponent,
    StatCardComponent,
    EstadoBadgeComponent,
    LucideRefreshCw,
    LucideCheck,
    LucidePlay,
    LucideScissors,
  ],
  templateUrl: './mis-productos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisProductosComponent implements OnInit {
  private readonly facade = inject(PedidosFacadeService);
  private readonly trabajosApi = inject(TrabajosTapicerosService);
  private readonly produccionesApi = inject(ProduccionesService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  protected readonly datos = signal<MisTrabajos | null>(null);
  /** Observaciones que el tapicero está escribiendo, por trabajo. */
  protected readonly borradores = signal<Record<number, string>>({});
  protected readonly guardandoId = signal<number | null>(null);
  protected readonly aviso = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

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
        next: ({ base, trabajos, producciones }) => {
          this.datos.set(
            construirMisTrabajos(trabajos, producciones, base.vistas, base.datos.usuarios, yo),
          );
          this.borradores.set({});
        },
        error: (e: AppError) => this.error.set(e),
      });
  }

  protected observacion(m: MiTrabajo): string {
    return this.borradores()[m.trabajo.id] ?? m.trabajo.observaciones ?? '';
  }

  protected alEscribir(m: MiTrabajo, evento: Event): void {
    const valor = (evento.target as HTMLTextAreaElement).value;
    this.borradores.update((b) => ({ ...b, [m.trabajo.id]: valor }));
  }

  protected cambio(m: MiTrabajo): boolean {
    const borrador = this.borradores()[m.trabajo.id];
    return borrador !== undefined && borrador.trim() !== (m.trabajo.observaciones ?? '').trim();
  }

  protected empezar(m: MiTrabajo): void {
    this.guardar(m, { estado: ESTADOS_TRABAJO.enProceso }, 'Empezaste el trabajo.');
  }

  protected guardarObservacion(m: MiTrabajo): void {
    this.guardar(m, { observaciones: this.observacion(m).trim() || null }, 'Observación guardada.');
  }

  protected terminar(m: MiTrabajo): void {
    this.guardar(
      m,
      {
        estado: ESTADOS_TRABAJO.finalizado,
        fecha_fin: fechaISO(),
        observaciones: this.observacion(m).trim() || null,
      },
      `"${m.trabajo.descripcion}" quedó terminado.`,
    );
  }

  private guardar(m: MiTrabajo, cambios: Parameters<TrabajosTapicerosService['actualizar']>[1], exito: string): void {
    this.guardandoId.set(m.trabajo.id);
    this.aviso.set(null);
    const accion$: Observable<unknown> = this.trabajosApi.actualizar(m.trabajo.id, cambios);
    accion$
      .pipe(
        finalize(() => this.guardandoId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.aviso.set({ tipo: 'ok', texto: exito });
          this.cargar();
        },
        error: (e: AppError) =>
          this.aviso.set({ tipo: 'error', texto: e.message ?? 'No fue posible guardar el cambio.' }),
      });
  }

  protected fecha(d: Date | null): string {
    return d ? fechaCorta(d) : '—';
  }

  protected readonly iconoReloj = LucideClock.icon;
  protected readonly iconoTijeras = LucideScissors.icon;
  protected readonly iconoCheck = LucideCircleCheck.icon;
}
