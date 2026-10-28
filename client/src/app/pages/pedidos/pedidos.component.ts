import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LucideClock,
  LucideCircleDollarSign,
  LucideMapPin,
  LucidePackage,
  LucidePhone,
  LucideRefreshCw,
  LucideSearch,
} from '@lucide/angular';
import { finalize } from 'rxjs';
import { AppError } from '@app/models';
import { AuthService } from '@app/services/auth.service';
import { abreviarCOP, formatearCOP } from '@app/utils/format';
import {
  EstadoBadgeComponent,
  normalizarEstado,
} from '@app/components/estado-badge/estado-badge.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { StatCardComponent } from '@app/components/stat-card/stat-card.component';
import { PedidosFacadeService } from '@app/services/pedidos-facade.service';
import { PedidoVista } from '@app/models/pedido-vista.model';

/**
 * Listado de pedidos (réplica de MyOrders.tsx / Sales.tsx), conectado a la API REST.
 * Se reutiliza en varias rutas cambiando `data` en app.routes.ts:
 *   - alcance 'propios' → solo los pedidos del asesor que inició sesión
 *   - alcance 'todos'   → todos los pedidos (administración)
 */
@Component({
  selector: 'app-pedidos',
  imports: [
    PageHeaderComponent,
    StatCardComponent,
    EstadoBadgeComponent,
    LucidePackage,
    LucidePhone,
    LucideMapPin,
    LucideSearch,
    LucideRefreshCw,
  ],
  templateUrl: './pedidos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosComponent implements OnInit {
  // Entradas que llegan desde `data` de la ruta (withComponentInputBinding)
  readonly titulo = input('Pedidos');
  readonly descripcion = input('');
  readonly alcance = input<'propios' | 'todos'>('todos');

  private readonly facade = inject(PedidosFacadeService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  // Estado de la pantalla
  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  private readonly pedidos = signal<PedidoVista[]>([]);
  protected readonly busqueda = signal('');
  protected readonly filtroEstado = signal('');

  // Derivados (se recalculan solos cuando cambia alguna señal)
  private readonly base = computed(() => {
    if (this.alcance() === 'todos') return this.pedidos();
    const yo = this.auth.sesion()?.usuarioId;
    return this.pedidos().filter((p) => p.usuarioId === yo);
  });

  protected readonly estados = computed(() =>
    [...new Set(this.base().map((p) => p.estado))].sort(),
  );

  protected readonly visibles = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const estado = this.filtroEstado();
    return this.base().filter(
      (p) =>
        (!estado || p.estado === estado) &&
        (!texto ||
          p.codigo.toLowerCase().includes(texto) ||
          (p.cliente?.nombre ?? '').toLowerCase().includes(texto) ||
          (p.cliente?.documento ?? '').includes(texto)),
    );
  });

  protected readonly resumen = computed(() => {
    const lista = this.base();
    return {
      total: lista.length,
      enProduccion: lista.filter((p) => normalizarEstado(p.estado).includes('produccion')).length,
      entregados: lista.filter((p) => normalizarEstado(p.estado) === 'entregado').length,
      ventas: abreviarCOP(lista.reduce((suma, p) => suma + p.total, 0)),
    };
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

  protected alFiltrar(evento: Event): void {
    this.filtroEstado.set((evento.target as HTMLSelectElement).value);
  }

  // Datos de los iconos para <app-stat-card>
  protected readonly iconoPaquete = LucidePackage.icon;
  protected readonly iconoReloj = LucideClock.icon;
  protected readonly iconoDinero = LucideCircleDollarSign.icon;

  protected formatearCOP = formatearCOP;
  protected abreviarCOP = abreviarCOP;
}
