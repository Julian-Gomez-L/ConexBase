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
  LucideCheck,
  LucideClock,
  LucidePackage,
  LucideRefreshCw,
  LucideTruck,
  LucideUndo2,
  LucideWallet,
} from '@lucide/angular';
import { finalize } from 'rxjs';
import { EstadoBadgeComponent } from '@app/components/estado-badge/estado-badge.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { StatCardComponent } from '@app/components/stat-card/stat-card.component';
import { AppError, HistorialPedido, Usuario } from '@app/models';
import { PedidoVista } from '@app/models/pedido-vista.model';
import { entregasDelDia, resumenDelDia } from '@app/models/reportes.model';
import { AuthService } from '@app/services/auth.service';
import { CambioEstadoService } from '@app/services/cambio-estado.service';
import { PedidosFacadeService } from '@app/services/pedidos-facade.service';
import { desdeFechaISO, fechaISO, fechaLarga, horaCorta } from '@app/utils/fecha';
import { formatearCOP } from '@app/utils/format';

/**
 * Pedidos del Día (Administrador, Vendedor, Confirmador y Producción).
 * Para un día: pedidos creados, pagos recibidos y cambios de estado.
 * El asesor comercial ve solo sus propios pedidos.
 * El Administrador además confirma aquí las entregas: al marcar un pedido
 * como Entregado, el asesor gana su comisión (Mis Comisiones y Comisiones
 * de Asesores). Si no se entregó, lo devuelve a Finalizado y la comisión
 * vuelve a quedar "por ganar".
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
    LucideCheck,
    LucideTruck,
    LucideUndo2,
  ],
  templateUrl: './pedidos-del-dia.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosDelDiaComponent implements OnInit {
  private readonly facade = inject(PedidosFacadeService);
  private readonly auth = inject(AuthService);
  private readonly cambioEstado = inject(CambioEstadoService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  private readonly pedidos = signal<PedidoVista[]>([]);
  private readonly historial = signal<HistorialPedido[]>([]);
  private readonly usuarios = signal<Usuario[]>([]);

  protected readonly hoy = fechaISO();
  protected readonly dia = signal(this.hoy);
  protected readonly soloPropios = this.auth.rol() === 'vendedor';
  /** Solo el Administrador (y el Super Administrador) confirma entregas. */
  protected readonly puedeEntregar = this.auth.rol() === 'administrador' || this.auth.rol() === 'superadmin';

  /** Pedido que se está guardando (deshabilita los botones). */
  protected readonly guardando = signal<number | null>(null);
  protected readonly aviso = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  protected readonly entregas = computed(() => entregasDelDia(this.pedidos(), this.historial(), this.dia()));

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

  /** Finalizado → Entregado. Desde este momento el asesor tiene su comisión. */
  protected marcarEntregado(p: PedidoVista): void {
    this.cambiarEstado(
      p,
      'Entregado',
      'Entrega confirmada por el administrador',
      `${p.codigo} quedó entregado. La comisión ya aparece al asesor.`,
    );
  }

  /** Entregado → Finalizado: no se entregó; la comisión deja de contar como ganada. */
  protected marcarNoEntregado(p: PedidoVista): void {
    this.cambiarEstado(
      p,
      'Finalizado',
      'No se entregó: vuelve a pendiente de entrega',
      `${p.codigo} quedó como no entregado.`,
    );
  }

  private cambiarEstado(p: PedidoVista, estado: string, observacion: string, exito: string): void {
    this.guardando.set(p.id);
    this.aviso.set(null);
    this.cambioEstado
      .cambiar(p, estado, observacion)
      .pipe(
        finalize(() => this.guardando.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.aviso.set({ tipo: 'ok', texto: exito });
          this.cargar();
        },
        error: (e: AppError) => this.aviso.set({ tipo: 'error', texto: e.message ?? 'No fue posible guardar el cambio.' }),
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
