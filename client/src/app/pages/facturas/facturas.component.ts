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
import { LucideFileText, LucidePrinter, LucideRefreshCw, LucideSearch } from '@lucide/angular';
import { finalize } from 'rxjs';
import { EstadoBadgeComponent } from '@app/components/estado-badge/estado-badge.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { EMPRESA } from '@app/config/empresa';
import { AppError } from '@app/models';
import { buscarParaFacturar, construirFactura } from '@app/models/factura.model';
import { PedidoVista } from '@app/models/pedido-vista.model';
import { PedidosFacadeService } from '@app/services/pedidos-facade.service';
import { fechaCorta, fechaLarga } from '@app/utils/fecha';
import { formatearCOP } from '@app/utils/format';
import { refrescoAutomatico } from '@app/utils/refresco';

/**
 * Facturas (Administrador y Encargado de Producción): se elige un pedido y se
 * imprime su factura (o se guarda como PDF desde el diálogo de impresión).
 * Al imprimir solo sale la factura: ver `.zona-impresion` en styles.css.
 */
@Component({
  selector: 'app-facturas',
  imports: [PageHeaderComponent, EstadoBadgeComponent, LucideSearch, LucidePrinter, LucideRefreshCw, LucideFileText],
  templateUrl: './facturas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacturasComponent implements OnInit {
  private readonly facade = inject(PedidosFacadeService);
  private readonly destroyRef = inject(DestroyRef);

  /** Estados al día sin recargar la página (cada 15 s y al volver a la pestaña). */
  private readonly refresco = refrescoAutomatico(() => this.cargar(true));

  protected readonly empresa = EMPRESA;
  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  private readonly pedidos = signal<PedidoVista[]>([]);

  protected readonly busqueda = signal('');
  protected readonly incluirAnulados = signal(false);
  protected readonly seleccionadoId = signal<number | null>(null);

  protected readonly lista = computed(() =>
    buscarParaFacturar(this.pedidos(), this.busqueda(), this.incluirAnulados()),
  );
  protected readonly factura = computed(() => {
    const p = this.pedidos().find((x) => x.id === this.seleccionadoId());
    return p ? construirFactura(p) : null;
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(silencioso = false): void {
    // En el refresco automático no se muestra el esqueleto de carga
    if (!silencioso) {
      this.cargando.set(true);
      this.error.set(null);
    }
    this.facade
      .listarVista()
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (vistas) => {
          this.pedidos.set(vistas);
          if (this.seleccionadoId() === null) {
            this.seleccionadoId.set(buscarParaFacturar(vistas, '')[0]?.id ?? null);
          }
        },
        error: (e: AppError) => {
          if (!silencioso) this.error.set(e); // un fallo del refresco no tapa la pantalla
        },
      });
  }

  protected alBuscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  protected alCambiarAnulados(evento: Event): void {
    this.incluirAnulados.set((evento.target as HTMLInputElement).checked);
  }

  protected imprimir(): void {
    window.print();
  }

  protected readonly formatearCOP = formatearCOP;
  protected readonly fechaCorta = fechaCorta;
  protected readonly fechaLarga = fechaLarga;
}
