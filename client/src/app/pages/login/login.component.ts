import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideEye, LucideEyeOff, LucideLogIn, LucideSparkles } from '@lucide/angular';
import { ROLE_HOME } from '@app/config/navigation';
import { AppError } from '@app/models';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, LucideSparkles, LucideEye, LucideEyeOff, LucideLogIn],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected readonly verClave = signal(false);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');

  protected enviar(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Ingresa un correo válido y tu contraseña.');
      return;
    }

    const { correo, password } = this.form.getRawValue();
    this.enviando.set(true);
    this.auth.login(correo, password).subscribe({
      next: (sesion) => void this.router.navigateByUrl(ROLE_HOME[sesion.rol]),
      error: (e: AppError) => {
        this.error.set(e.message ?? 'No fue posible iniciar sesión.');
        this.enviando.set(false);
      },
    });
  }
}
