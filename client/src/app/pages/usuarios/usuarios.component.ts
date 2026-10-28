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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucidePencil, LucideRefreshCw, LucideSearch, LucideUserPlus } from '@lucide/angular';
import { finalize, forkJoin, Observable } from 'rxjs';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { AppError, estaActivo, Rol, Usuario, UsuarioPayload } from '@app/models';
import { RolesService, UsuariosService } from '@app/services/api';
import { AuthService } from '@app/services/auth.service';

/**
 * Usuarios y Roles (Administrador).
 * Crear, editar y desactivar usuarios. No se borran: desactivarlos les
 * quita el acceso y conserva sus pedidos e historial.
 */
@Component({
  selector: 'app-usuarios',
  imports: [ReactiveFormsModule, PageHeaderComponent, LucideSearch, LucidePencil, LucideRefreshCw, LucideUserPlus],
  templateUrl: './usuarios.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuariosApi = inject(UsuariosService);
  private readonly rolesApi = inject(RolesService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly roles = signal<Rol[]>([]);

  protected readonly pestana = signal<'usuarios' | 'roles'>('usuarios');
  protected readonly busqueda = signal('');
  protected readonly filtroRol = signal<number | null>(null);

  /** Usuario en edición; null = creando uno nuevo. */
  protected readonly editando = signal<Usuario | null>(null);
  protected readonly guardando = signal(false);
  protected readonly aviso = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.maxLength(100)]],
    documento: ['', [Validators.required, Validators.maxLength(20)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: [''],
    rolId: [0, [Validators.min(1)]],
    activo: [true],
  });

  private readonly nombreRol = computed(() => new Map(this.roles().map((r) => [r.id, r.nombre])));
  protected rolDe(u: Usuario): string {
    return this.nombreRol().get(u.rol_id) ?? '—';
  }

  protected readonly visibles = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const rol = this.filtroRol();
    return this.usuarios()
      .filter((u) => !rol || u.rol_id === rol)
      .filter(
        (u) =>
          !texto ||
          `${u.nombre} ${u.apellido}`.toLowerCase().includes(texto) ||
          u.correo.toLowerCase().includes(texto) ||
          u.documento.includes(texto),
      )
      .sort((a, b) => Number(estaActivo(b.estado)) - Number(estaActivo(a.estado)) || a.nombre.localeCompare(b.nombre));
  });

  protected readonly resumenRoles = computed(() =>
    this.roles().map((r) => {
      const suyos = this.usuarios().filter((u) => u.rol_id === r.id);
      return { rol: r, total: suyos.length, activos: suyos.filter((u) => estaActivo(u.estado)).length };
    }),
  );

  protected readonly estaActivo = estaActivo;
  protected readonly yo = computed(() => this.auth.sesion()?.usuarioId ?? null);

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({ usuarios: this.usuariosApi.listar(), roles: this.rolesApi.listar() })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ usuarios, roles }) => {
          this.usuarios.set(usuarios);
          this.roles.set([...roles].sort((a, b) => a.id - b.id));
        },
        error: (e: AppError) => this.error.set(e),
      });
  }

  protected alBuscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  protected alFiltrarRol(evento: Event): void {
    const v = (evento.target as HTMLSelectElement).value;
    this.filtroRol.set(v ? Number(v) : null);
  }

  protected editar(u: Usuario): void {
    this.editando.set(u);
    this.aviso.set(null);
    this.form.reset({
      nombre: u.nombre,
      apellido: u.apellido,
      documento: u.documento,
      correo: u.correo,
      password: '',
      rolId: u.rol_id,
      activo: estaActivo(u.estado),
    });
  }

  protected nuevo(): void {
    this.editando.set(null);
    this.aviso.set(null);
    this.form.reset({ nombre: '', apellido: '', documento: '', correo: '', password: '', rolId: 0, activo: true });
  }

  protected invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  /** Primer problema del formulario, o '' si está listo. */
  private validar(): string {
    const v = this.form.getRawValue();
    const editando = this.editando();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.controls.rolId.invalid) return 'Elige el rol del usuario.';
      if (this.form.controls.correo.hasError('email')) return 'Escribe un correo válido.';
      return 'Completa los campos obligatorios.';
    }
    if (!editando && v.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (editando && v.password && v.password.length < 8) return 'La nueva contraseña debe tener al menos 8 caracteres.';
    if (editando && editando.id === this.yo()) {
      if (!v.activo) return 'No puedes desactivar tu propio usuario.';
      if (v.rolId !== editando.rol_id) return 'No puedes cambiar tu propio rol.';
    }
    return '';
  }

  protected guardar(): void {
    const problema = this.validar();
    if (problema) {
      this.aviso.set({ tipo: 'error', texto: problema });
      return;
    }
    const v = this.form.getRawValue();
    const datos: Partial<UsuarioPayload> = {
      nombre: v.nombre.trim(),
      apellido: v.apellido.trim(),
      documento: v.documento.trim(),
      correo: v.correo.trim(),
      rol_id: v.rolId,
      estado: v.activo,
    };
    if (v.password) datos.password = v.password;

    const editando = this.editando();
    const accion$: Observable<Usuario> = editando
      ? this.usuariosApi.actualizar(editando.id, datos)
      : this.usuariosApi.crear(datos as UsuarioPayload);

    this.guardando.set(true);
    this.aviso.set(null);
    accion$
      .pipe(
        finalize(() => this.guardando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (u) => {
          this.nuevo(); // limpia el formulario (y el aviso anterior)
          this.aviso.set({
            tipo: 'ok',
            texto: editando ? `Se guardaron los cambios de ${u.nombre} ${u.apellido}.` : `Usuario ${u.nombre} ${u.apellido} creado.`,
          });
          this.cargar();
        },
        error: (e: AppError) =>
          this.aviso.set({ tipo: 'error', texto: e.message ?? 'No fue posible guardar el usuario.' }),
      });
  }
}
