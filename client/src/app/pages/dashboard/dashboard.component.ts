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
import {
  LucideCircleDollarSign,
  LucideClock,
  LucidePackage,
  LucideTrendingUp,
} from '@lucide/angular';
import { finalize } from 'rxjs';
import { AppError } from '@app/models';
import { abreviarCOP, formatearCOP } from '@app/utils/format';
import {
  EstadoBadgeComponent,
  normalizarEstado,
} from '@app/components/estado-badge/estado-badge.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { StatCardComponent } from '@app/components/stat-card/stat-card.component';
import { PedidoVista } from '@app/models/pedido-vista.model';
import { PedidosFacadeService } from '@app/services/pedidos-facade.service';

/** Panel General (solo administrador). Réplica de Overview.tsx con datos reales de la API. */
@Component({
  selector: 'app-dashboard',
  imports: [PageHeaderComponent, StatCardComponent, EstadoBadgeComponent],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly facade = inject(PedidosFacadeService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  private readonly pedidos = signal<PedidoVista[]>([]);

  protected readonly stats = computed(() => {
    const lista = this.pedidos();
    const activos = lista.filter((p) => normalizarEstado(p.estado) !== 'cancelado');
    return {
      total: lista.length,
      enProduccion: lista.filter((p) => normalizarEstado(p.estado).includes('produccion')).length,
      entregados: lista.filter((p) => normalizarEstado(p.estado) === 'entregado').length,
      ingresos: abreviarCOP(activos.reduce((suma, p) => suma + p.total, 0)),
    };
  });

  /** Pedidos por estado → barras del "Pipeline de Producción". */
  protected readonly pipeline = computed(() => {
    const conteo = new Map<string, number>();
    for (const p of this.pedidos()) conteo.set(p.estado, (conteo.get(p.estado) ?? 0) + 1);
    const maximo = Math.max(1, ...conteo.values());
    return [...conteo].map(([estado, cantidad]) => ({
      estado,
      cantidad,
      porcentaje: (cantidad / maximo) * 100,
    }));
  });

  protected readonly recientes = computed(() => this.pedidos().slice(0, 5));

  protected readonly iconoPaquete = LucidePackage.icon;
  protected readonly iconoReloj = LucideClock.icon;
  protected readonly iconoTendencia = LucideTrendingUp.icon;
  protected readonly iconoDinero = LucideCircleDollarSign.icon;
  protected readonly formatearCOP = formatearCOP;

  ngOnInit(): void {
    this.facade
      .listarVista()
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (datos) => this.pedidos.set(datos),
        error: (e: AppError) => this.error.set(e),
      });
  }
}
