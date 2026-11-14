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
  LucideBadgeCheck,
  LucideChevronLeft,
  LucideChevronRight,
  LucideCircleDollarSign,
  LucideRefreshCw,
  LucideScissors,
  LucideUndo2,
} from '@lucide/angular';
import { finalize, forkJoin } from 'rxjs';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { StatCardComponent } from '@app/components/stat-card/stat-card.component';
import { AppError, Produccion, TrabajoTapicero, Usuario } from '@app/models';
import { PedidoVista } from '@app/models/pedido-vista.model';
import { MiTrabajo } from '@app/models/mis-trabajos.model';
import { pagosDeLaSemana } from '@app/models/pagos-tapiceros.model';
import { ActualizarTrabajo } from '@app/services/api/trabajos-tapiceros.service';
import { ProduccionesService, TrabajosTapicerosService } from '@app/services/api';
import { AuthService } from '@app/services/auth.service';
import { PedidosFacadeService } from '@app/services/pedidos-facade.service';
import { etiquetaSemana, fechaCorta, lunesDe, sumarDias } from '@app/utils/fecha';
import { formatearCOP, formatearMiles, leerMiles } from '@app/utils/format';
import { refrescoAutomatico } from '@app/utils/refresco';

interface Borrador {
  valor: number | null;
  nota: string;
}

/**
 * Pagos a Tapiceros (Encargado de Producción y Administrador).
 * Por semana (lunes a domingo, según la fecha en que el tapicero terminó):
 * Producción pone el valor de cada producto terminado y una observación
 * opcional; se suma lo que hizo cada tapicero. El gerente (Administrador)
 * marca cada trabajo como revisado; ya revisado, Producción no cambia el valor.
 */
@Component({
  selector: 'app-pagos-tapiceros',
  imports: [
    PageHeaderComponent,
    StatCardComponent,
    LucideChevronLeft,
    LucideChevronRight,
    LucideRefreshCw,
    LucideBadgeCheck,
    LucideUndo2,
  ],
  templateUrl: './pagos-tapiceros.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagosTapicerosComponent implements OnInit {
  private readonly facade = inject(PedidosFacadeService);
  private readonly trabajosApi = inject(TrabajosTapicerosService);
  private readonly produccionesApi = inject(ProduccionesService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  /** Estados al día sin recargar la página (cada 15 s y al volver a la pestaña). */
  private readonly refresco = refrescoAutomatico(() => this.cargar(true), () => this.guardandoId() !== null);

  /** El gerente: marca "Revisado" y puede cambiar valores ya revisados. */
  protected readonly esGerente = this.auth.rol() === 'administrador' || this.auth.rol() === 'superadmin';

  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  private readonly trabajos = signal<TrabajoTapicero[]>([]);
  private readonly producciones = signal<Produccion[]>([]);
  private readonly vistas = signal<PedidoVista[]>([]);
  private readonly usuarios = signal<Usuario[]>([]);

  protected readonly trabajosCargados = computed(() => this.trabajos().length > 0);
  protected readonly borradores = signal<Record<number, Borrador>>({});
  protected readonly guardandoId = signal<number | null>(null);
  protected readonly aviso = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  private readonly lunesActual = lunesDe(new Date());
  protected readonly lunesDeHoy = this.lunesActual;
  protected readonly lunes = signal(this.lunesActual);
  protected readonly esSemanaActual = computed(() => this.lunes().getTime() === this.lunesActual.getTime());
  protected readonly tituloSemana = computed(() => etiquetaSemana(this.lunes()));

  protected readonly pagos = computed(() =>
    pagosDeLaSemana(this.trabajos(), this.producciones(), this.vistas(), this.usuarios(), this.lunes()),
  );

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(silencioso = false): void {
    // En el refresco automático no se muestra el esqueleto de carga
    if (!silencioso) {
      this.cargando.set(true);
      this.error.set(null);
    }
    forkJoin({
      base: this.facade.listarConDatos(),
      trabajos: this.trabajosApi.listar(),
      producciones: this.produccionesApi.listar(),
    })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ base, trabajos, producciones }) => {
          this.trabajos.set(trabajos);
          this.producciones.set(producciones);
          this.vistas.set(base.vistas);
          this.usuarios.set(base.datos.usuarios);
          if (!silencioso) this.borradores.set({}); // no se pierden los valores que se están escribiendo
        },
        error: (e: AppError) => {
          if (!silencioso) this.error.set(e); // un fallo del refresco no tapa la pantalla
        },
      });
  }

  protected moverSemana(semanas: number): void {
    this.lunes.set(sumarDias(this.lunes(), semanas * 7));
  }

  // ── Valor y observación ───────────────────────────────────────────────
  private borrador(m: MiTrabajo): Borrador {
    return this.borradores()[m.trabajo.id] ?? { valor: m.valor, nota: m.notaValor ?? '' };
  }

  protected valorTexto(m: MiTrabajo): string {
    return formatearMiles(this.borrador(m).valor ?? 0);
  }

  protected nota(m: MiTrabajo): string {
    return this.borrador(m).nota;
  }

  protected alEscribirValor(m: MiTrabajo, evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const valor = campo.value.trim() ? leerMiles(campo.value) : null;
    campo.value = formatearMiles(valor ?? 0);
    this.borradores.update((b) => ({ ...b, [m.trabajo.id]: { ...this.borrador(m), valor } }));
  }

  protected alEscribirNota(m: MiTrabajo, evento: Event): void {
    const nota = (evento.target as HTMLInputElement).value;
    this.borradores.update((b) => ({ ...b, [m.trabajo.id]: { ...this.borrador(m), nota } }));
  }

  /** Producción no edita lo que el gerente ya revisó. */
  protected editable(m: MiTrabajo): boolean {
    return this.esGerente || !m.revisado;
  }

  protected cambio(m: MiTrabajo): boolean {
    const b = this.borradores()[m.trabajo.id];
    return !!b && (b.valor !== m.valor || b.nota.trim() !== (m.notaValor ?? '').trim());
  }

  protected guardarValor(m: MiTrabajo): void {
    const b = this.borrador(m);
    this.guardar(
      m,
      { valor: b.valor === null ? null : String(b.valor), observacion_valor: b.nota.trim() || null },
      'Valor guardado.',
    );
  }

  // ── Revisión del gerente ──────────────────────────────────────────────
  protected revisar(m: MiTrabajo, revisado: boolean): void {
    this.guardar(m, { revisado }, revisado ? 'Trabajo marcado como revisado.' : 'Se quitó la revisión.');
  }

  private guardar(m: MiTrabajo, cambios: ActualizarTrabajo, exito: string): void {
    this.guardandoId.set(m.trabajo.id);
    this.aviso.set(null);
    this.trabajosApi
      .actualizar(m.trabajo.id, cambios)
      .pipe(
        finalize(() => this.guardandoId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (actualizado) => {
          this.trabajos.update((lista) => lista.map((t) => (t.id === actualizado.id ? actualizado : t)));
          this.borradores.update((b) => {
            const { [m.trabajo.id]: _, ...resto } = b;
            return resto;
          });
          this.aviso.set({ tipo: 'ok', texto: exito });
        },
        error: (e: AppError) =>
          this.aviso.set({ tipo: 'error', texto: e.message ?? 'No fue posible guardar el cambio.' }),
      });
  }

  protected fecha(d: Date | null): string {
    return d ? fechaCorta(d) : '—';
  }

  protected readonly formatearCOP = formatearCOP;
  protected readonly iconoDinero = LucideCircleDollarSign.icon;
  protected readonly iconoTijeras = LucideScissors.icon;
}
