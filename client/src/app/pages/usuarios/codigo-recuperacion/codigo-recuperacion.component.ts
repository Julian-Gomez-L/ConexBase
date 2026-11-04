import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideCopy, LucideKeyRound, LucideTriangleAlert } from '@lucide/angular';
import { finalize } from 'rxjs';
import { AppError, CodigoGenerado, EstadoRecuperacion } from '@app/models';
import { fechaMysql } from '@app/models/pedido-vista.model';
import { RecuperacionAdminService } from '@app/services/recuperacion-admin.service';
import { fechaCorta, horaCorta } from '@app/utils/fecha';

/**
 * Tarjeta "Código de recuperación de administrador" (pestaña Seguridad).
 * Muestra si hay un código guardado y permite generar uno nuevo. El código
 * se ve una sola vez: el servidor solo guarda su versión cifrada.
 */
@Component({
  selector: 'app-codigo-recuperacion',
  imports: [LucideKeyRound, LucideCopy, LucideTriangleAlert],
  templateUrl: './codigo-recuperacion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodigoRecuperacionComponent implements OnInit {
  private readonly api = inject(RecuperacionAdminService);
  private readonly destroyRef = inject(DestroyRef);

  /** Avisa al padre si hay o no código (para marcar la pestaña). */
  readonly configurado = output<boolean>();

  protected readonly estado = signal<EstadoRecuperacion | null>(null);
  protected readonly error = signal('');
  protected readonly trabajando = signal(false);
  /** Paso de confirmación antes de reemplazar el código. */
  protected readonly confirmando = signal(false);
  /** El código recién generado (solo vive en esta pantalla). */
  protected readonly nuevo = signal<CodigoGenerado | null>(null);
  protected readonly copiado = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.api
      .estado()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (e) => {
          this.estado.set(e);
          this.configurado.emit(e.configurado);
        },
        error: (e: AppError) => this.error.set(e.message),
      });
  }

  protected cuando(valor: string | null): string {
    if (!valor) return '';
    const d = fechaMysql(valor);
    return `${fechaCorta(d)} a las ${horaCorta(d)}`;
  }

  protected pedirGenerar(): void {
    // Si ya hay uno, se pide confirmar porque el anterior deja de servir
    if (this.estado()?.configurado) this.confirmando.set(true);
    else this.generar();
  }

  protected generar(): void {
    this.confirmando.set(false);
    this.trabajando.set(true);
    this.error.set('');
    this.copiado.set(false);
    this.api
      .generar()
      .pipe(
        finalize(() => this.trabajando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (c) => {
          this.nuevo.set(c);
          this.cargar();
        },
        error: (e: AppError) => this.error.set(e.message ?? 'No fue posible generar el código.'),
      });
  }

  protected async copiar(codigo: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(codigo);
      this.copiado.set(true);
    } catch {
      this.copiado.set(false); // sin permiso de portapapeles: el código igual se puede seleccionar
    }
  }

  protected ocultar(): void {
    this.nuevo.set(null);
    this.copiado.set(false);
  }
}
