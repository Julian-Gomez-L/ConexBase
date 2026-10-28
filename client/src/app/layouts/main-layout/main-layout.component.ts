import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideLogOut,
  LucideMenu,
  LucideSparkles,
  LucideX,
} from '@lucide/angular';
import { NAV_BY_ROLE } from '@app/config/navigation';
import { ROLE_LABEL } from '@app/config/roles';
import { AuthService } from '@app/services/auth.service';

/** Marco de la aplicación: sidebar por rol + encabezado + contenido (réplica de DashboardLayout.tsx). */
@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideDynamicIcon,
    LucideSparkles,
    LucideMenu,
    LucideX,
    LucideLogOut,
  ],
  templateUrl: './main-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly sesion = this.auth.sesion;
  protected readonly menu = computed(() => {
    const rol = this.auth.rol();
    return rol ? NAV_BY_ROLE[rol] : [];
  });
  protected readonly etiquetaRol = computed(() => {
    const rol = this.auth.rol();
    return rol ? ROLE_LABEL[rol] : '';
  });

  /** En pantallas grandes el menú inicia abierto; en móvil, cerrado. */
  protected readonly menuAbierto = signal(
    typeof window !== 'undefined' && window.innerWidth >= 1024,
  );

  protected readonly fecha = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  /** En móvil, cerrar el menú al navegar. */
  protected alNavegar(): void {
    if (window.innerWidth < 1024) this.menuAbierto.set(false);
  }

  protected cerrarSesion(): void {
    // 1) revoca el token en el servidor, 2) borra la sesión local, 3) vuelve al login
    this.auth.revocarToken().subscribe(() => {
      this.auth.logout();
      void this.router.navigateByUrl('/login');
    });
  }
}
