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
  LucideCalendarDays,
  LucideCircleDollarSign,
  LucideClock,
  LucidePackage,
  LucideRefreshCw,
  LucideTrendingUp,
} from '@lucide/angular';
import { finalize, forkJoin } from 'rxjs';
import { EstadoBadgeComponent } from '@app/components/estado-badge/estado-badge.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { StatCardComponent } from '@app/components/stat-card/stat-card.component';
import { TASA_COMISION } from '@app/config/comisiones';
import { AppError } from '@app/models';
import { calcularComisiones, ResumenComisiones } from '@app/models/comision.model';
import { HistorialPedidosService } from '@app/services/api';
import { AuthService } from '@app/services/auth.service';
import { PedidosFacadeService } from '@app/services/pedidos-facade.service';
import { formatearCOP } from '@app/utils/format';

/**
 * Mis Comisiones (asesor comercial).
 * Comisión ganada = TASA_COMISION × total de cada pedido entregado, agrupada
 * por el mes de entrega. Los pedidos confirmados o en fabricación se muestran
 * como comisión "por ganar".
 */
@Component({
  selector: 'app-mis-comisiones',
  imports: [PageHeaderComponent, StatCardComponent, EstadoBadgeComponent, LucideRefreshCw, LucideCircleDollarSign],
  templateUrl: './mis-comisiones.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisComisionesComponent implements OnInit {
  private readonly facade = inject(PedidosFacadeService);
  private readonly historialApi = inject(HistorialPedidosService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly porcentaje = `${+(TASA_COMISION * 100).toFixed(2)} %`;
  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  protected readonly resumen = signal<ResumenComisiones | null>(null);

  protected readonly tarjetas = computed(() => {
    const r = this.resumen();
    // Montos completos: abreviar (ej. $78K) redondea y confunde en comisiones
    return {
      ganado: formatearCOP(r?.totalGanado ?? 0),
      esteMes: formatearCOP(r?.ganadoEsteMes ?? 0),
      porGanar: formatearCOP(r?.totalPorGanar ?? 0),
      entregados: r?.ganadas.length ?? 0,
      ventas: formatearCOP(r?.totalVentas ?? 0),
      enCurso: r?.porGanar.length ?? 0,
    };
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    const asesorId = this.auth.sesion()?.usuarioId;
    if (!asesorId) return;
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({ pedidos: this.facade.listarVista(), historial: this.historialApi.listar() })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ pedidos, historial }) =>
          this.resumen.set(calcularComisiones(pedidos, historial, asesorId, TASA_COMISION)),
        error: (e: AppError) => this.error.set(e),
      });
  }

  protected fecha(d: Date): string {
    return d.toLocaleDateString('es-CO');
  }

  protected readonly formatearCOP = formatearCOP;
  protected readonly iconoDinero = LucideCircleDollarSign.icon;
  protected readonly iconoCalendario = LucideCalendarDays.icon;
  protected readonly iconoReloj = LucideClock.icon;
  protected readonly iconoPaquete = LucidePackage.icon;
  protected readonly iconoTendencia = LucideTrendingUp.icon;
}
