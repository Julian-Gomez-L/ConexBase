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
import { LucideRefreshCw, LucideSearch, LucideShieldAlert } from '@lucide/angular';
import { finalize } from 'rxjs';
import {
  AppError,
  contarDelDia,
  filtrarIntentos,
  IntentoLogin,
  resumirNavegador,
} from '@app/models';
import { fechaMysql } from '@app/models/pedido-vista.model';
import { IntentosLoginService } from '@app/services/api';
import { fechaCorta, fechaISO, horaConSegundos } from '@app/utils/fecha';

/**
 * Pestaña "Intentos fallidos" de Usuarios y Roles (solo Administrador).
 * Muestra los inicios de sesión fallidos que registra el backend: quién,
 * fecha y hora, desde dónde y por qué.
 */
@Component({
  selector: 'app-intentos-login',
  imports: [LucideRefreshCw, LucideSearch, LucideShieldAlert],
  templateUrl: './intentos-login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntentosLoginComponent implements OnInit {
  private readonly api = inject(IntentosLoginService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  protected readonly intentos = signal<IntentoLogin[]>([]);
  protected readonly busqueda = signal('');

  protected readonly visibles = computed(() =>
    filtrarIntentos(this.intentos(), this.busqueda()).map((i) => {
      const fecha = fechaMysql(i.fecha);
      return {
        intento: i,
        fecha: fechaCorta(fecha),
        hora: horaConSegundos(fecha),
        navegador: resumirNavegador(i.navegador),
      };
    }),
  );

  protected readonly hoy = computed(() => contarDelDia(this.intentos(), fechaISO()));

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.api
      .listar()
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (datos) => this.intentos.set(datos),
        error: (e: AppError) => this.error.set(e),
      });
  }

  protected alBuscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  /** Color del motivo: el correo inexistente suele ser alguien probando correos. */
  protected colorMotivo(motivo: string): string {
    if (motivo.startsWith('El correo')) return 'bg-red-500/15 text-red-300';
    if (motivo.startsWith('Usuario inactivo')) return 'bg-secondary text-muted-foreground';
    return 'bg-amber-500/15 text-amber-300';
  }
}
