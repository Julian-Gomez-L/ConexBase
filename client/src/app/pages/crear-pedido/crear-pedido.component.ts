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
import { RouterLink } from '@angular/router';
import {
  LucideCircleCheck,
  LucideMinus,
  LucidePackage,
  LucidePlus,
  LucideRefreshCw,
  LucideSearch,
  LucideShoppingCart,
  LucideTrash2,
  LucideUser,
  LucideUserPlus,
  LucideWallet,
} from '@lucide/angular';
import { finalize, forkJoin, merge } from 'rxjs';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { AppError, Cliente, estaActivo, Pedido, Producto } from '@app/models';
import { codigoPedido } from '@app/models/pedido-vista.model';
import { ClientesService, ProductosService } from '@app/services/api';
import { CrearPedidoService, LineaPedido } from '@app/services/crear-pedido.service';
import { aNumero, formatearCOP } from '@app/utils/format';

/** Línea del carrito con lo necesario para mostrarla. */
interface LineaVista extends LineaPedido {
  nombre: string;
}

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta', 'Nequi', 'Daviplata'];

/**
 * Crear Pedido (asesor comercial).
 * El pedido nace en "Pendiente" a nombre de quien inició sesión, y luego lo
 * revisa el Confirmador. El total se calcula con el precio de cada producto.
 */
@Component({
  selector: 'app-crear-pedido',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeaderComponent,
    LucideUser,
    LucideUserPlus,
    LucideSearch,
    LucideShoppingCart,
    LucidePlus,
    LucideMinus,
    LucideTrash2,
    LucideWallet,
    LucidePackage,
    LucideCircleCheck,
    LucideRefreshCw,
  ],
  templateUrl: './crear-pedido.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearPedidoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clientesApi = inject(ClientesService);
  private readonly productosApi = inject(ProductosService);
  private readonly crearPedido = inject(CrearPedidoService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly metodosPago = METODOS_PAGO;
  protected readonly formatearCOP = formatearCOP;

  // ── Catálogos ──────────────────────────────────────────────────────────
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<AppError | null>(null);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly productos = signal<Producto[]>([]);

  // ── Cliente ────────────────────────────────────────────────────────────
  protected readonly modoCliente = signal<'existente' | 'nuevo'>('existente');
  protected readonly clienteId = signal<number | null>(null);
  protected readonly busquedaCliente = signal('');

  protected readonly formCliente = this.fb.nonNullable.group({
    documento: ['', [Validators.required, Validators.maxLength(20)]],
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    telefono: ['', [Validators.required, Validators.maxLength(20)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    direccion: ['', [Validators.maxLength(255)]],
  });

  protected readonly clientesFiltrados = computed(() => {
    const texto = this.busquedaCliente().trim().toLowerCase();
    const activos = this.clientes().filter((c) => estaActivo(c.estado));
    if (!texto) return activos;
    return activos.filter(
      (c) => c.nombre.toLowerCase().includes(texto) || c.documento.includes(texto),
    );
  });

  protected readonly clienteSeleccionado = computed(
    () => this.clientes().find((c) => c.id === this.clienteId()) ?? null,
  );

  // ── Productos ──────────────────────────────────────────────────────────
  protected readonly productoElegido = signal<number | null>(null);
  protected readonly cantidadElegida = signal(1);
  protected readonly lineas = signal<LineaVista[]>([]);

  protected readonly productosActivos = computed(() =>
    this.productos().filter((p) => estaActivo(p.estado)),
  );

  // ── Abono ──────────────────────────────────────────────────────────────
  protected readonly formAbono = this.fb.nonNullable.group({
    monto: [0, [Validators.min(0)]],
    metodo: [METODOS_PAGO[0]],
    comprobante: [''],
  });
  private readonly montoAbono = signal(0);

  // ── Resumen ────────────────────────────────────────────────────────────
  protected readonly total = computed(() => CrearPedidoService.total(this.lineas()));
  protected readonly unidades = computed(() =>
    this.lineas().reduce((suma, l) => suma + l.cantidad, 0),
  );
  protected readonly abono = computed(() => Math.max(this.montoAbono() || 0, 0));
  protected readonly saldo = computed(() => Math.max(this.total() - this.abono(), 0));

  // ── Envío ──────────────────────────────────────────────────────────────
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly creado = signal<Pedido | null>(null);
  protected readonly codigoPedido = codigoPedido;

  ngOnInit(): void {
    this.cargarCatalogos();
    this.formAbono.controls.monto.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.montoAbono.set(Number(v) || 0));
    // El aviso de error se borra apenas el usuario corrige algo
    merge(this.formAbono.valueChanges, this.formCliente.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.error.set(''));
  }

  protected cargarCatalogos(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    forkJoin({ clientes: this.clientesApi.listar(), productos: this.productosApi.listar() })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ clientes, productos }) => {
          this.clientes.set([...clientes].sort((a, b) => a.nombre.localeCompare(b.nombre)));
          this.productos.set([...productos].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        },
        error: (e: AppError) => this.errorCarga.set(e),
      });
  }

  // ── Cliente ────────────────────────────────────────────────────────────
  protected cambiarModo(modo: 'existente' | 'nuevo'): void {
    this.modoCliente.set(modo);
    this.error.set('');
  }

  protected alBuscarCliente(evento: Event): void {
    this.busquedaCliente.set((evento.target as HTMLInputElement).value);
  }

  protected elegirCliente(id: number): void {
    this.clienteId.set(id);
    this.error.set('');
  }

  protected campoInvalido(nombre: keyof typeof this.formCliente.controls): boolean {
    const c = this.formCliente.controls[nombre];
    return c.invalid && (c.touched || c.dirty);
  }

  // ── Productos ──────────────────────────────────────────────────────────
  protected alElegirProducto(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.productoElegido.set(valor ? Number(valor) : null);
  }

  protected alCambiarCantidad(evento: Event): void {
    const n = Math.floor(Number((evento.target as HTMLInputElement).value));
    this.cantidadElegida.set(n > 0 ? n : 1);
  }

  protected agregarProducto(): void {
    const producto = this.productos().find((p) => p.id === this.productoElegido());
    if (!producto) return;
    const cantidad = this.cantidadElegida();
    this.lineas.update((lineas) => {
      const existente = lineas.find((l) => l.productoId === producto.id);
      if (existente) {
        return lineas.map((l) =>
          l.productoId === producto.id ? { ...l, cantidad: l.cantidad + cantidad } : l,
        );
      }
      return [
        ...lineas,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          precioUnitario: aNumero(producto.precio),
          cantidad,
        },
      ];
    });
    this.productoElegido.set(null);
    this.cantidadElegida.set(1);
    this.error.set('');
  }

  protected cambiarCantidad(productoId: number, delta: number): void {
    this.lineas.update((lineas) =>
      lineas.map((l) =>
        l.productoId === productoId ? { ...l, cantidad: Math.max(1, l.cantidad + delta) } : l,
      ),
    );
  }

  protected quitarProducto(productoId: number): void {
    this.lineas.update((lineas) => lineas.filter((l) => l.productoId !== productoId));
  }

  // ── Envío ──────────────────────────────────────────────────────────────
  /** Devuelve el primer problema del formulario, o '' si está listo para enviar. */
  private validar(): string {
    if (this.modoCliente() === 'existente' && !this.clienteId()) {
      return 'Selecciona el cliente del pedido.';
    }
    if (this.modoCliente() === 'nuevo' && this.formCliente.invalid) {
      this.formCliente.markAllAsTouched();
      return 'Completa los datos del cliente nuevo.';
    }
    if (this.lineas().length === 0) return 'Agrega al menos un producto.';
    if (this.formAbono.invalid) return 'El abono no puede ser negativo.';
    if (this.abono() > this.total()) return 'El abono no puede ser mayor que el total del pedido.';
    return '';
  }

  protected registrar(): void {
    const problema = this.validar();
    this.error.set(problema);
    if (problema) return;

    const datosCliente = this.formCliente.getRawValue();
    const datosAbono = this.formAbono.getRawValue();

    this.enviando.set(true);
    this.crearPedido
      .crear({
        cliente:
          this.modoCliente() === 'existente'
            ? this.clienteId()!
            : {
                documento: datosCliente.documento.trim(),
                nombre: datosCliente.nombre.trim(),
                telefono: datosCliente.telefono.trim(),
                correo: datosCliente.correo.trim(),
                direccion: datosCliente.direccion.trim() || null,
              },
        lineas: this.lineas().map(({ productoId, cantidad, precioUnitario }) => ({
          productoId,
          cantidad,
          precioUnitario,
        })),
        abono:
          this.abono() > 0
            ? {
                monto: this.abono(),
                metodo: datosAbono.metodo,
                comprobante: datosAbono.comprobante.trim() || null,
              }
            : null,
      })
      .pipe(
        finalize(() => this.enviando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (pedido) => this.creado.set(pedido),
        error: (e: AppError) =>
          this.error.set(e.message ?? 'No fue posible registrar el pedido. Intenta de nuevo.'),
      });
  }

  /** Limpia la pantalla para registrar otro pedido. */
  protected nuevoPedido(): void {
    this.creado.set(null);
    this.lineas.set([]);
    this.clienteId.set(null);
    this.busquedaCliente.set('');
    this.modoCliente.set('existente');
    this.formCliente.reset();
    this.formAbono.reset({ monto: 0, metodo: METODOS_PAGO[0], comprobante: '' });
    this.error.set('');
    this.cargarCatalogos(); // incluye el cliente nuevo, si se registró uno
  }
}
