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
import { LucideDownload, LucideRefreshCw } from '@lucide/angular';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { AppError } from '@app/models';
import { PedidoVista } from '@app/models/pedido-vista.model';
import { consolidadoCsv, consolidar } from '@app/models/reportes.model';
import { AuthService } from '@app/services/auth.service';
import { PedidosFacadeService } from '@app/services/pedidos-facade.service';
import { fechaISO } from '@app/utils/fecha';
import { formatearCOP } from '@app/utils/format';

/** Color de la barra de cada estado (misma paleta que los badges). */
const COLOR_ESTADO: Record<string, string> = {
  Pendiente: 'bg-amber-500',
  Confirmado: 'bg-sky-500',
  'En producción': 'bg-cyan-500',
  Finalizado: 'bg-emerald-500',
  Entregado: 'bg-emerald-500',
  Cancelado: 'bg-gray-500',
  Rechazado: 'bg-gray-500',
};

/** Por defecto: desde el primer día del mes anterior hasta hoy. */
function inicioPorDefecto(): string {
  const d = new Date();
  return fechaISO(new Date(d.getFullYear(), d.getMonth() - 1, 1));
}

/**
 * Consolidado (Administrador, Vendedor, Confirmador y Producción).
 * Ventas, recaudo, pedidos por estado, por asesor y productos de un periodo.
 * El asesor comercial ve solo sus propios pedidos.
 */
@Component({
  selector: 'app-consolidado',
  imports: [PageHeaderComponent, LucideDownload, LucideRefreshCw],
  templateUrl: './consolidado.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsolidadoComponent implements OnInit {
  private readonly facade = inject(PedidosFacadeService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  private readonly pedidos = signal<PedidoVista[]>([]);

  protected readonly hoy = fechaISO();
  protected readonly desde = signal(inicioPorDefecto());
  protected readonly hasta = signal(this.hoy);
  protected readonly soloPropios = this.auth.rol() === 'vendedor';

  protected readonly datos = computed(() => {
    const yo = this.auth.sesion()?.usuarioId;
    const alcance = this.soloPropios ? this.pedidos().filter((p) => p.usuarioId === yo) : this.pedidos();
    // Si el usuario invierte las fechas, se ordenan solas
    const [a, b] = [this.desde(), this.hasta()].sort();
    return consolidar(alcance, a, b);
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
        next: (vistas) => this.pedidos.set(vistas),
        error: (e: AppError) => this.error.set(e),
      });
  }

  protected alCambiarFecha(campo: 'desde' | 'hasta', evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    if (valor) this[campo].set(valor);
  }

  protected exportarCsv(): void {
    // BOM al inicio para que Excel reconozca las tildes (UTF-8)
    const blob = new Blob(['﻿' + consolidadoCsv(this.datos().pedidos)], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `consolidado_${this.desde()}_${this.hasta()}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  protected colorEstado(estado: string): string {
    return COLOR_ESTADO[estado] ?? 'bg-gray-500';
  }

  /** 3500000 → "$ 3,5M" (las barras tienen poco espacio). */
  protected millones(valor: number): string {
    if (!valor) return '';
    return `$ ${(valor / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 2 })}M`;
  }

  protected readonly formatearCOP = formatearCOP;
}
