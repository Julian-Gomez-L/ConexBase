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
  LucideChevronLeft,
  LucideChevronRight,
  LucideCircleDollarSign,
  LucideClock,
  LucidePackage,
  LucideRefreshCw,
  LucideWallet,
} from '@lucide/angular';
import { finalize } from 'rxjs';
import { EstadoBadgeComponent } from '@app/components/estado-badge/estado-badge.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { StatCardComponent } from '@app/components/stat-card/stat-card.component';
import { AppError, HistorialPedido, Usuario } from '@app/models';
import { PedidoVista } from '@app/models/pedido-vista.model';
import { resumenDelDia } from '@app/models/reportes.model';
import { AuthService } from '@app/services/auth.service';
import { PedidosFacadeService } from '@app/services/pedidos-facade.service';
import { desdeFechaISO, fechaISO, fechaLarga, horaCorta } from '@app/utils/fecha';
import { formatearCOP } from '@app/utils/format';

/**
 * Pedidos del Día (Administrador, Vendedor, Confirmador y Producción).
 * Para un día: pedidos creados, pagos recibidos y cambios de estado.
 * El asesor comercial ve solo sus propios pedidos.
 */
@Component({
  selector: 'app-pedidos-del-dia',
  imports: [
    PageHeaderComponent,
    StatCardComponent,
    EstadoBadgeComponent,
    LucideChevronLeft,
    LucideChevronRight,
    LucideCalendarDays,
    LucideRefreshCw,
  ],
  templateUrl: './pedidos-del-dia.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosDelDiaComponent implements OnInit {
  private readonly facade = inject(PedidosFacadeService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  private readonly pedidos = signal<PedidoVista[]>([]);
  private readonly historial = signal<HistorialPedido[]>([]);
  private readonly usuarios = signal<Usuario[]>([]);

  protected readonly hoy = fechaISO();
  protected readonly dia = signal(this.hoy);
  protected readonly soloPropios = this.auth.rol() === 'vendedor';

  protected readonly titulo = computed(() => fechaLarga(desdeFechaISO(this.dia())));

  protected readonly resumen = computed(() => {
    const yo = this.auth.sesion()?.usuarioId;
    const alcance = this.soloPropios ? this.pedidos().filter((p) => p.usuarioId === yo) : this.pedidos();
    return resumenDelDia(alcance, this.historial(), this.usuarios(), this.dia());
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.facade
      .listarConDatos()
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ vistas, datos }) => {
          this.pedidos.set(vistas);
          this.historial.set(datos.historial);
          this.usuarios.set(datos.usuarios);
        },
        error: (e: AppError) => this.error.set(e),
      });
  }

  protected moverDia(dias: number): void {
    const d = desdeFechaISO(this.dia());
    d.setDate(d.getDate() + dias);
    this.dia.set(fechaISO(d));
  }

  protected alElegirDia(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    if (valor) this.dia.set(valor);
  }

  protected readonly formatearCOP = formatearCOP;
  protected readonly horaCorta = horaCorta;
  protected readonly iconoPaquete = LucidePackage.icon;
  protected readonly iconoDinero = LucideCircleDollarSign.icon;
  protected readonly iconoAbono = LucideWallet.icon;
  protected readonly iconoReloj = LucideClock.icon;
}
