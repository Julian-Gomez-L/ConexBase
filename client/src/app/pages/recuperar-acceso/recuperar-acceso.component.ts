import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideKeyRound, LucideShieldCheck } from '@lucide/angular';
import { AppError } from '@app/models';
import { RecuperacionAdminService } from '@app/services/recuperacion-admin.service';

/**
 * Recuperar acceso de administrador (pública, desde el login).
 * Con el código de recuperación impreso, el dueño crea un Administrador
 * cuando ya no queda ninguno activo. El backend rechaza el intento si todavía
 * hay un administrador activo.
 */
@Component({
  selector: 'app-recuperar-acceso',
  imports: [ReactiveFormsModule, RouterLink, LucideArrowLeft, LucideKeyRound, LucideShieldCheck],
  templateUrl: './recuperar-acceso.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecuperarAccesoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(RecuperacionAdminService);

  protected readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(40)]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.maxLength(100)]],
    documento: ['', [Validators.required, Validators.maxLength(20)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmacion: ['', [Validators.required]],
  });

  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  /** Mensaje del servidor cuando la recuperación salió bien. */
  protected readonly listo = signal('');

  protected invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  private validar(): string {
    const v = this.form.getRawValue();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.controls.correo.hasError('email')) return 'Escribe un correo válido.';
      if (this.form.controls.password.hasError('minlength'))
        return 'La contraseña debe tener al menos 8 caracteres.';
      return 'Completa todos los campos.';
    }
    if (v.password !== v.confirmacion) return 'Las contraseñas no coinciden.';
    return '';
  }

  protected enviar(): void {
    const problema = this.validar();
    this.error.set(problema);
    if (problema) return;

    const v = this.form.getRawValue();
    this.enviando.set(true);
    this.api
      .recuperar({
        codigo: v.codigo.trim(),
        nombre: v.nombre.trim(),
        apellido: v.apellido.trim(),
        documento: v.documento.trim(),
        correo: v.correo.trim(),
        password: v.password,
        password_confirmation: v.confirmacion,
      })
      .subscribe({
        next: (mensaje) => {
          this.enviando.set(false);
          this.listo.set(mensaje);
          this.form.reset();
        },
        error: (e: AppError) => {
          this.enviando.set(false);
          this.error.set(e.message ?? 'No fue posible recuperar el acceso.');
        },
      });
  }
}
