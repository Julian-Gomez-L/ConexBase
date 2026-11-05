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
import { LucidePencil, LucidePlus, LucideRefreshCw, LucideSearch } from '@lucide/angular';
import { finalize, forkJoin, Observable } from 'rxjs';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { MEDIDAS } from '@app/config/medidas';
import {
  AppError,
  Categoria,
  estaActivo,
  filasCategorias,
  filasProductos,
  Producto,
  productoRepetido,
} from '@app/models';
import { CategoriasService, ProductosService } from '@app/services/api';
import { formatearCOP } from '@app/utils/format';

/** Valores especiales del selector de medida. */
const SIN_MEDIDA = '';
const OTRA = '__otra__';

type Aviso = { tipo: 'ok' | 'error'; texto: string } | null;

/**
 * Catálogo (Administrador): productos con su precio y medida, y categorías.
 * Cada medida es un producto aparte con su propio precio. Nada se borra: se
 * desactiva, para no dañar los pedidos que ya lo usan. Un producto inactivo
 * deja de aparecer en Crear Pedido.
 */
@Component({
  selector: 'app-catalogo',
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    LucideSearch,
    LucidePencil,
    LucidePlus,
    LucideRefreshCw,
  ],
  templateUrl: './catalogo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productosApi = inject(ProductosService);
  private readonly categoriasApi = inject(CategoriasService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly MEDIDAS = MEDIDAS;
  protected readonly SIN_MEDIDA = SIN_MEDIDA;
  protected readonly OTRA = OTRA;
  protected readonly formatearCOP = formatearCOP;

  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly pestana = signal<'productos' | 'categorias'>('productos');

  // ── Productos ──────────────────────────────────────────────────────────
  protected readonly busqueda = signal('');
  protected readonly filtroCategoria = signal<number | null>(null);
  protected readonly editandoProducto = signal<Producto | null>(null);
  protected readonly guardandoProducto = signal(false);
  protected readonly avisoProducto = signal<Aviso>(null);

  protected readonly formProducto = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    medida: [SIN_MEDIDA],
    otraMedida: ['', [Validators.maxLength(50)]],
    precio: [null as number | null, [Validators.required, Validators.min(0)]],
    categoriaId: [0, [Validators.min(1)]],
    descripcion: [''],
    activo: [true],
  });
  /** El select de medida como signal, para mostrar el campo "Otra". */
  protected readonly medidaElegida = signal(SIN_MEDIDA);

  protected readonly filas = computed(() =>
    filasProductos(this.productos(), this.categorias(), this.busqueda(), this.filtroCategoria()),
  );
  protected readonly categoriasActivas = computed(() =>
    this.categorias().filter((c) => estaActivo(c.estado)),
  );

  // ── Categorías ─────────────────────────────────────────────────────────
  protected readonly editandoCategoria = signal<Categoria | null>(null);
  protected readonly guardandoCategoria = signal(false);
  protected readonly avisoCategoria = signal<Aviso>(null);

  protected readonly formCategoria = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: [''],
    activa: [true],
  });

  protected readonly filasCat = computed(() =>
    filasCategorias(this.categorias(), this.productos()),
  );

  ngOnInit(): void {
    this.cargar();
    this.formProducto.controls.medida.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.medidaElegida.set(v));
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({ productos: this.productosApi.listar(), categorias: this.categoriasApi.listar() })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ productos, categorias }) => {
          this.productos.set(productos);
          this.categorias.set(categorias);
        },
        error: (e: AppError) => this.error.set(e),
      });
  }

  protected alBuscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  protected alFiltrarCategoria(evento: Event): void {
    const v = (evento.target as HTMLSelectElement).value;
    this.filtroCategoria.set(v ? Number(v) : null);
  }

  // ── Productos ──────────────────────────────────────────────────────────
  protected nuevoProducto(): void {
    this.editandoProducto.set(null);
    this.avisoProducto.set(null);
    const unaCategoria = this.categoriasActivas().length === 1 ? this.categoriasActivas()[0].id : 0;
    this.formProducto.reset({
      nombre: '',
      medida: SIN_MEDIDA,
      otraMedida: '',
      precio: null,
      categoriaId: unaCategoria,
      descripcion: '',
      activo: true,
    });
  }

  protected editarProducto(p: Producto): void {
    this.editandoProducto.set(p);
    this.avisoProducto.set(null);
    const medida = p.medida?.trim() ?? '';
    const deLaLista = !medida || MEDIDAS.includes(medida);
    this.formProducto.reset({
      nombre: p.nombre,
      medida: deLaLista ? medida : OTRA,
      otraMedida: deLaLista ? '' : medida,
      precio: Number(p.precio),
      categoriaId: p.categoria_id,
      descripcion: p.descripcion ?? '',
      activo: estaActivo(p.estado),
    });
  }

  /** Copia el producto en edición para crear la misma cosa en otra medida. */
  protected otraMedidaDe(p: Producto): void {
    this.editarProducto(p);
    this.editandoProducto.set(null);
    this.formProducto.patchValue({ medida: SIN_MEDIDA, otraMedida: '', precio: null });
    this.avisoProducto.set({
      tipo: 'ok',
      texto: `Elige la nueva medida y su precio para "${p.nombre}".`,
    });
  }

  protected invalidoProducto(campo: keyof typeof this.formProducto.controls): boolean {
    const c = this.formProducto.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  /** La medida que se va a guardar (null si es "Sin medida"). */
  private medidaFinal(): string | null {
    const v = this.formProducto.getRawValue();
    if (v.medida === OTRA) return v.otraMedida.trim() || null;
    return v.medida || null;
  }

  private validarProducto(): string {
    const v = this.formProducto.getRawValue();
    if (this.formProducto.invalid) {
      this.formProducto.markAllAsTouched();
      if (this.formProducto.controls.categoriaId.invalid) return 'Elige la categoría del producto.';
      if (this.formProducto.controls.precio.hasError('min'))
        return 'El precio no puede ser negativo.';
      if (this.formProducto.controls.otraMedida.invalid)
        return 'La medida no puede tener más de 50 caracteres.';
      return 'Completa el nombre y el precio.';
    }
    if (v.medida === OTRA && !v.otraMedida.trim())
      return 'Escribe la medida, o elige "Sin medida".';
    if (
      productoRepetido(
        this.productos(),
        v.nombre,
        this.medidaFinal(),
        this.editandoProducto()?.id ?? null,
      )
    ) {
      return 'Ya existe un producto con ese nombre y esa medida.';
    }
    return '';
  }

  protected guardarProducto(): void {
    const problema = this.validarProducto();
    if (problema) {
      this.avisoProducto.set({ tipo: 'error', texto: problema });
      return;
    }
    const v = this.formProducto.getRawValue();
    const datos = {
      nombre: v.nombre.trim(),
      medida: this.medidaFinal(),
      precio: String(v.precio),
      categoria_id: v.categoriaId,
      descripcion: v.descripcion.trim() || null,
      estado: v.activo,
    };

    const editando = this.editandoProducto();
    const accion$: Observable<Producto> = editando
      ? this.productosApi.actualizar(editando.id, datos)
      : this.productosApi.crear(datos);

    this.guardandoProducto.set(true);
    this.avisoProducto.set(null);
    accion$
      .pipe(
        finalize(() => this.guardandoProducto.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (p) => {
          this.nuevoProducto();
          const nombre = p.medida ? `${p.nombre} · ${p.medida}` : p.nombre;
          this.avisoProducto.set({
            tipo: 'ok',
            texto: editando
              ? `Se guardaron los cambios de "${nombre}".`
              : `Producto "${nombre}" creado.`,
          });
          this.cargar();
        },
        error: (e: AppError) =>
          this.avisoProducto.set({
            tipo: 'error',
            texto: e.message ?? 'No fue posible guardar el producto.',
          }),
      });
  }

  // ── Categorías ─────────────────────────────────────────────────────────
  protected nuevaCategoria(): void {
    this.editandoCategoria.set(null);
    this.avisoCategoria.set(null);
    this.formCategoria.reset({ nombre: '', descripcion: '', activa: true });
  }

  protected editarCategoria(c: Categoria): void {
    this.editandoCategoria.set(c);
    this.avisoCategoria.set(null);
    this.formCategoria.reset({
      nombre: c.nombre,
      descripcion: c.descripcion ?? '',
      activa: estaActivo(c.estado),
    });
  }

  protected invalidoCategoria(campo: keyof typeof this.formCategoria.controls): boolean {
    const c = this.formCategoria.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  protected guardarCategoria(): void {
    if (this.formCategoria.invalid) {
      this.formCategoria.markAllAsTouched();
      this.avisoCategoria.set({ tipo: 'error', texto: 'Escribe el nombre de la categoría.' });
      return;
    }
    const v = this.formCategoria.getRawValue();
    const datos = {
      nombre: v.nombre.trim(),
      descripcion: v.descripcion.trim() || null,
      estado: v.activa,
    };
    const editando = this.editandoCategoria();
    const accion$: Observable<Categoria> = editando
      ? this.categoriasApi.actualizar(editando.id, datos)
      : this.categoriasApi.crear(datos);

    this.guardandoCategoria.set(true);
    this.avisoCategoria.set(null);
    accion$
      .pipe(
        finalize(() => this.guardandoCategoria.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (c) => {
          this.nuevaCategoria();
          this.avisoCategoria.set({
            tipo: 'ok',
            texto: editando
              ? `Se guardaron los cambios de "${c.nombre}".`
              : `Categoría "${c.nombre}" creada.`,
          });
          this.cargar();
        },
        error: (e: AppError) =>
          this.avisoCategoria.set({
            tipo: 'error',
            texto: e.message ?? 'No fue posible guardar la categoría.',
          }),
      });
  }

  protected readonly estaActivo = estaActivo;
}
