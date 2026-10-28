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
  LucideCheck,
  LucideCircleCheck,
  LucideCircleDollarSign,
  LucideCircleX,
  LucideClock,
  LucideRefreshCw,
  LucideSearch,
  LucideX,
} from '@lucide/angular';
import { finalize } from 'rxjs';
import {
  EstadoBadgeComponent,
  normalizarEstado,
} from '@app/components/estado-badge/estado-badge.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { StatCardComponent } from '@app/components/stat-card/stat-card.component';
import { AppError } from '@app/models';
import { PedidoVista } from '@app/models/pedido-vista.model';
import { CambioEstadoService } from '@app/services/cambio-estado.service';
import { PedidosFacadeService } from '@app/services/pedidos-facade.service';
import { fechaCorta } from '@app/utils/fecha';
import { abreviarCOP, formatearCOP } from '@app/utils/format';

/** Largo mínimo del motivo de rechazo (para que el asesor sepa qué corregir). */
const MIN_MOTIVO = 5;

/**
 * Confirmación (Confirmador y Administrador).
 * Lista los pedidos Pendientes para aprobarlos (→ Confirmado) o rechazarlos
 * (→ Rechazado, con motivo obligatorio). Cada cambio queda en el historial.
 */
@Component({
  selector: 'app-confirmacion',
  imports: [
    PageHeaderComponent,
    StatCardComponent,
    EstadoBadgeComponent,
    LucideSearch,
    LucideRefreshCw,
    LucideX,
    LucideCheck,
    LucideCircleCheck,
  ],
  templateUrl: './confirmacion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmacionComponent implements OnInit {
  private readonly facade = inject(PedidosFacadeService);
  private readonly cambioEstado = inject(CambioEstadoService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  private readonly pedidos = signal<PedidoVista[]>([]);

  protected readonly pestana = signal<'pendientes' | 'rechazados'>('pendientes');
  protected readonly busqueda = signal('');

  /** Pedido con el formulario de rechazo abierto, y su motivo. */
  protected readonly rechazandoId = signal<number | null>(null);
  protected readonly motivo = signal('');
  protected readonly errorMotivo = signal('');

  /** Pedido que se está guardando (deshabilita sus botones). */
  protected readonly guardandoId = signal<number | null>(null);
  protected readonly aviso = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  private readonly porEstado = (estado: string) =>
    this.pedidos().filter((p) => normalizarEstado(p.estado) === estado);

  protected readonly pendientes = computed(() =>
    // Los más antiguos primero: llevan más tiempo esperando
    [...this.porEstado('pendiente')].sort((a, b) => a.creadoEn.getTime() - b.creadoEn.getTime()),
  );
  protected readonly rechazados = computed(() => this.porEstado('rechazado'));

  protected readonly resumen = computed(() => ({
    pendientes: this.pendientes().length,
    valorPendiente: abreviarCOP(this.pendientes().reduce((s, p) => s + p.total, 0)),
    confirmados: this.porEstado('confirmado').length,
    rechazados: this.rechazados().length,
  }));

  protected readonly visibles = computed(() => {
    const lista = this.pestana() === 'pendientes' ? this.pendientes() : this.rechazados();
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return lista;
    return lista.filter(
      (p) =>
        p.codigo.toLowerCase().includes(texto) ||
        (p.cliente?.nombre ?? '').toLowerCase().includes(texto) ||
        (p.cliente?.documento ?? '').includes(texto),
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
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

  protected alBuscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  protected abrirRechazo(id: number): void {
    this.rechazandoId.set(id);
    this.motivo.set('');
    this.errorMotivo.set('');
  }

  protected cerrarRechazo(): void {
    this.rechazandoId.set(null);
  }

  protected alEscribirMotivo(evento: Event): void {
    this.motivo.set((evento.target as HTMLTextAreaElement).value);
    this.errorMotivo.set('');
  }

  protected confirmar(pedido: PedidoVista): void {
    this.guardar(pedido, 'Confirmado', 'Pedido confirmado', `${pedido.codigo} quedó confirmado y pasa a Fabricación.`);
  }

  protected rechazar(pedido: PedidoVista): void {
    const motivo = this.motivo().trim();
    if (motivo.length < MIN_MOTIVO) {
      this.errorMotivo.set('Escribe el motivo del rechazo para que el asesor pueda corregirlo.');
      return;
    }
    this.guardar(pedido, 'Rechazado', motivo, `${pedido.codigo} fue rechazado.`);
  }

  private guardar(pedido: PedidoVista, estado: string, observacion: string, exito: string): void {
    this.guardandoId.set(pedido.id);
    this.aviso.set(null);
    this.cambioEstado
      .cambiar(pedido, estado, observacion)
      .pipe(
        finalize(() => this.guardandoId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.rechazandoId.set(null);
          this.aviso.set({ tipo: 'ok', texto: exito });
          this.cargar();
        },
        error: (e: AppError) =>
          this.aviso.set({ tipo: 'error', texto: e.message ?? 'No fue posible guardar el cambio.' }),
      });
  }

  protected readonly formatearCOP = formatearCOP;
  protected readonly fechaCorta = fechaCorta;
  protected readonly iconoReloj = LucideClock.icon;
  protected readonly iconoDinero = LucideCircleDollarSign.icon;
  protected readonly iconoCheck = LucideCircleCheck.icon;
  protected readonly iconoX = LucideCircleX.icon;
}
