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
  LucideClock,
  LucideFactory,
  LucidePackage,
  LucidePlay,
  LucideRefreshCw,
  LucideTruck,
  LucideUserPlus,
} from '@lucide/angular';
import { finalize, forkJoin, Observable, switchMap } from 'rxjs';
import { EstadoBadgeComponent } from '@app/components/estado-badge/estado-badge.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { StatCardComponent } from '@app/components/stat-card/stat-card.component';
import { AppError } from '@app/models';
import {
  construirTablero,
  ESTADOS_PRODUCCION,
  ESTADOS_TRABAJO,
  PedidoEnFabricacion,
  ProduccionVista,
  Tablero,
} from '@app/models/fabricacion.model';
import {
  ProduccionesService,
  RolesService,
  TrabajosTapicerosService,
} from '@app/services/api';
import { AuthService } from '@app/services/auth.service';
import { CambioEstadoService } from '@app/services/cambio-estado.service';
import { PedidosFacadeService } from '@app/services/pedidos-facade.service';
import { desdeFechaISO, fechaCorta, fechaISO } from '@app/utils/fecha';
import { formatearCOP } from '@app/utils/format';

/** Formulario abierto sobre una producción. */
type Edicion =
  | { tipo: 'avance'; produccionId: number; estado: string; observaciones: string }
  | { tipo: 'tapicero'; produccionId: number; tapiceroId: number | null; descripcion: string };

/**
 * Fabricación (Encargado de Producción y Administrador).
 * Confirmado → (iniciar) En producción → (todas las producciones terminadas)
 * Finalizado → (entregar) Entregado. Cada paso queda en el historial.
 */
@Component({
  selector: 'app-fabricacion',
  imports: [
    PageHeaderComponent,
    StatCardComponent,
    EstadoBadgeComponent,
    LucideRefreshCw,
    LucidePlay,
    LucideCheck,
    LucideTruck,
    LucideUserPlus,
  ],
  templateUrl: './fabricacion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FabricacionComponent implements OnInit {
  private readonly facade = inject(PedidosFacadeService);
  private readonly produccionesApi = inject(ProduccionesService);
  private readonly trabajosApi = inject(TrabajosTapicerosService);
  private readonly rolesApi = inject(RolesService);
  private readonly cambioEstado = inject(CambioEstadoService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly estadosProduccion = ESTADOS_PRODUCCION;
  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  protected readonly tablero = signal<Tablero | null>(null);

  /** Pedido o producción que se está guardando (deshabilita sus botones). */
  protected readonly guardando = signal<string | null>(null);
  protected readonly aviso = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  protected readonly edicion = signal<Edicion | null>(null);

  protected readonly avance = computed(() => {
    const e = this.edicion();
    return e?.tipo === 'avance' ? e : null;
  });
  protected readonly asignacion = computed(() => {
    const e = this.edicion();
    return e?.tipo === 'tapicero' ? e : null;
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      base: this.facade.listarConDatos(),
      producciones: this.produccionesApi.listar(),
      trabajos: this.trabajosApi.listar(),
      roles: this.rolesApi.listar(),
    })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ base, producciones, trabajos, roles }) =>
          this.tablero.set(
            construirTablero(
              base.vistas,
              producciones,
              trabajos,
              base.datos.usuarios,
              roles,
              base.datos.historial,
            ),
          ),
        error: (e: AppError) => this.error.set(e),
      });
  }

  // ── Pedidos ────────────────────────────────────────────────────────────
  /** Crea una producción por producto y pasa el pedido a "En producción". */
  protected iniciar(p: PedidoEnFabricacion): void {
    const yo = this.auth.sesion()?.usuarioId;
    if (!yo) return;
    const hoy = fechaISO();
    const crear$ = forkJoin(
      p.pedido.items.map((item) =>
        this.produccionesApi.crear({
          pedido_id: p.pedido.id,
          producto_id: item.productoId,
          usuario_id: yo,
          fecha_inicio: hoy,
          fecha_fin: null,
          estado: 'Pendiente',
          observaciones: null,
        }),
      ),
    ).pipe(switchMap(() => this.cambioEstado.cambiar(p.pedido, 'En producción', 'Producción iniciada')));
    this.ejecutar(`pedido-${p.pedido.id}`, crear$, `${p.pedido.codigo} pasó a fabricación.`);
  }

  protected finalizar(p: PedidoEnFabricacion): void {
    this.ejecutar(
      `pedido-${p.pedido.id}`,
      this.cambioEstado.cambiar(p.pedido, 'Finalizado', 'Fabricación terminada'),
      `${p.pedido.codigo} quedó listo para entregar.`,
    );
  }

  protected entregar(p: PedidoEnFabricacion): void {
    this.ejecutar(
      `pedido-${p.pedido.id}`,
      this.cambioEstado.cambiar(p.pedido, 'Entregado', 'Pedido entregado al cliente'),
      `${p.pedido.codigo} quedó entregado.`,
    );
  }

  // ── Producciones ───────────────────────────────────────────────────────
  protected abrirAvance(pr: ProduccionVista): void {
    this.edicion.set({
      tipo: 'avance',
      produccionId: pr.produccion.id,
      estado: pr.produccion.estado,
      observaciones: pr.produccion.observaciones ?? '',
    });
  }

  protected abrirAsignacion(pr: ProduccionVista): void {
    const tapiceros = this.tablero()?.tapiceros ?? [];
    this.edicion.set({
      tipo: 'tapicero',
      produccionId: pr.produccion.id,
      tapiceroId: tapiceros.length === 1 ? tapiceros[0].id : null,
      descripcion: `Tapizado de ${pr.cantidad} × ${pr.producto}`,
    });
  }

  protected cerrarEdicion(): void {
    this.edicion.set(null);
  }

  protected alCambiar(campo: string, evento: Event): void {
    const valor = (evento.target as HTMLInputElement | HTMLSelectElement).value;
    const e = this.edicion();
    if (!e) return;
    if (campo === 'tapiceroId') {
      this.edicion.set({ ...e, tapiceroId: valor ? Number(valor) : null } as Edicion);
    } else {
      this.edicion.set({ ...e, [campo]: valor } as Edicion);
    }
  }

  protected guardarAvance(): void {
    const e = this.avance();
    if (!e) return;
    const terminada = e.estado === 'Finalizada';
    this.ejecutar(
      `produccion-${e.produccionId}`,
      this.produccionesApi.actualizar(e.produccionId, {
        estado: e.estado,
        observaciones: e.observaciones.trim() || null,
        fecha_fin: terminada ? fechaISO() : null,
      }),
      'Avance registrado.',
    );
  }

  protected guardarAsignacion(): void {
    const e = this.asignacion();
    if (!e) return;
    if (!e.tapiceroId || !e.descripcion.trim()) {
      this.aviso.set({ tipo: 'error', texto: 'Elige el tapicero y describe el trabajo.' });
      return;
    }
    this.ejecutar(
      `produccion-${e.produccionId}`,
      this.trabajosApi.crear({
        produccion_id: e.produccionId,
        usuario_id: e.tapiceroId,
        descripcion: e.descripcion.trim(),
        fecha_inicio: fechaISO(),
        fecha_fin: null,
        estado: ESTADOS_TRABAJO.pendiente,
        observaciones: null,
      }),
      'Trabajo asignado al tapicero.',
    );
  }

  private ejecutar(clave: string, accion$: Observable<unknown>, exito: string): void {
    this.guardando.set(clave);
    this.aviso.set(null);
    accion$
      .pipe(
        finalize(() => this.guardando.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.edicion.set(null);
          this.aviso.set({ tipo: 'ok', texto: exito });
          this.cargar();
        },
        error: (err: AppError) =>
          this.aviso.set({ tipo: 'error', texto: err.message ?? 'No fue posible guardar el cambio.' }),
      });
  }

  /** "12/10/2026" a partir de una columna DATE. */
  protected dia(valor: string | null): string {
    return valor ? fechaCorta(desdeFechaISO(valor)) : '—';
  }

  protected colorProduccion(estado: string): string {
    if (estado === 'Finalizada') return 'text-emerald-300';
    if (estado === 'En proceso') return 'text-cyan-300';
    return 'text-amber-300';
  }

  protected readonly fechaCorta = fechaCorta;
  protected readonly formatearCOP = formatearCOP;
  protected readonly iconoPaquete = LucidePackage.icon;
  protected readonly iconoFabrica = LucideFactory.icon;
  protected readonly iconoReloj = LucideClock.icon;
  protected readonly iconoCheck = LucideCircleCheck.icon;
}
