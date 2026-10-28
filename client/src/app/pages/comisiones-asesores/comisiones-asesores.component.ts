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
  LucideRefreshCw,
  LucideUsers,
} from '@lucide/angular';
import { finalize, forkJoin } from 'rxjs';
import { EstadoBadgeComponent } from '@app/components/estado-badge/estado-badge.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { StatCardComponent } from '@app/components/stat-card/stat-card.component';
import { TASA_COMISION } from '@app/config/comisiones';
import { resolverRol } from '@app/config/roles';
import { AppError, HistorialPedido, Rol, Usuario } from '@app/models';
import { claveMes, comisionesPorAsesor } from '@app/models/comision.model';
import { PedidoVista } from '@app/models/pedido-vista.model';
import { RolesService } from '@app/services/api';
import { PedidosFacadeService } from '@app/services/pedidos-facade.service';
import { fechaCorta } from '@app/utils/fecha';
import { formatearCOP } from '@app/utils/format';

/**
 * Comisiones de Asesores (Administrador).
 * Lo ganado por cada asesor en el mes de entrega elegido y lo que tiene por
 * ganar en pedidos en curso. Mismo cálculo que "Mis Comisiones".
 */
@Component({
  selector: 'app-comisiones-asesores',
  imports: [PageHeaderComponent, StatCardComponent, EstadoBadgeComponent, LucideRefreshCw],
  templateUrl: './comisiones-asesores.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComisionesAsesoresComponent implements OnInit {
  private readonly facade = inject(PedidosFacadeService);
  private readonly rolesApi = inject(RolesService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly porcentaje = `${+(TASA_COMISION * 100).toFixed(2)} %`;
  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  private readonly datos = signal<{
    vistas: PedidoVista[];
    historial: HistorialPedido[];
    usuarios: Usuario[];
    roles: Rol[];
  } | null>(null);

  protected readonly mes = signal(claveMes(new Date()));
  /** Asesores con el detalle abierto. */
  protected readonly abiertos = signal<Set<number>>(new Set());

  protected readonly resultado = computed(() => {
    const d = this.datos();
    if (!d) return null;
    const idsVendedor = new Set(d.roles.filter((r) => resolverRol(r.nombre) === 'vendedor').map((r) => r.id));
    const asesores = d.usuarios.filter((u) => idsVendedor.has(u.rol_id));
    return comisionesPorAsesor(d.vistas, d.historial, asesores, TASA_COMISION, this.mes());
  });

  protected readonly tarjetas = computed(() => {
    const r = this.resultado();
    const conEntregas = r?.filas.filter((f) => f.entregados.length > 0).length ?? 0;
    return {
      comision: formatearCOP(r?.totales.comision ?? 0),
      ventas: formatearCOP(r?.totales.ventas ?? 0),
      porGanar: formatearCOP(r?.totales.porGanar ?? 0),
      enCurso: r?.totales.enCurso ?? 0,
      asesores: `${conEntregas} de ${r?.filas.length ?? 0}`,
    };
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({ base: this.facade.listarConDatos(), roles: this.rolesApi.listar() })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ base, roles }) =>
          this.datos.set({
            vistas: base.vistas,
            historial: base.datos.historial,
            usuarios: base.datos.usuarios,
            roles,
          }),
        error: (e: AppError) => this.error.set(e),
      });
  }

  protected alElegirMes(evento: Event): void {
    this.mes.set((evento.target as HTMLSelectElement).value);
  }

  protected alternar(id: number): void {
    this.abiertos.update((s) => {
      const nuevo = new Set(s);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  }

  protected readonly formatearCOP = formatearCOP;
  protected readonly fechaCorta = fechaCorta;
  protected readonly iconoDinero = LucideCircleDollarSign.icon;
  protected readonly iconoCalendario = LucideCalendarDays.icon;
  protected readonly iconoReloj = LucideClock.icon;
  protected readonly iconoUsuarios = LucideUsers.icon;
}
