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
import { AppError, Cliente, estaActivo, Pedido } from '@app/models';
import { METODO_ADDI, METODOS_PAGO, RECARGO_ADDI } from '@app/config/pagos';
import { calcularCobro } from '@app/models/cobro.model';
import { codigoPedido } from '@app/models/pedido-vista.model';
import { ClientesService } from '@app/services/api';
import { CrearPedidoService, LineaPedido } from '@app/services/crear-pedido.service';
import { formatearCOP, formatearMiles, leerMiles } from '@app/utils/format';

/** Producto agregado al pedido; `clave` solo sirve para quitarlo o cambiar la cantidad. */
interface LineaVista extends LineaPedido {
  clave: number;
}


/**
 * Crear Pedido (asesor comercial).
 * El pedido nace en "Pendiente" a nombre de quien inició sesión, y luego lo
 * revisa el Confirmador. Ya no hay catálogo: cada producto se describe con
 * diseño, descripción, color y tipo de tela, cantidad y valor; el pedido
 * lleva la localidad de entrega. El total se calcula con esos valores.
 * Con Addi se paga todo por anticipado con un 10 % de recargo (ver config/pagos.ts).
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
  private readonly crearPedido = inject(CrearPedidoService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly metodosPago = METODOS_PAGO;
  protected readonly formatearCOP = formatearCOP;
  protected readonly formatearMilesCampo = formatearMiles;

  // ── Clientes ───────────────────────────────────────────────────────────
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<AppError | null>(null);
  protected readonly clientes = signal<Cliente[]>([]);

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

  // ── Entrega ────────────────────────────────────────────────────────────
  protected readonly localidad = signal('');

  // ── Productos (especificaciones) ───────────────────────────────────────
  protected readonly formProducto = this.fb.nonNullable.group({
    diseno: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: ['', [Validators.maxLength(2000)]],
    tipoTela: ['', [Validators.required, Validators.maxLength(100)]],
    colorTela: ['', [Validators.required, Validators.maxLength(100)]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
  });
  /** Valor unitario del producto que se está agregando (el campo muestra puntos de miles). */
  protected readonly valorProducto = signal(0);
  protected readonly errorProducto = signal('');
  protected readonly lineas = signal<LineaVista[]>([]);
  private siguienteClave = 1;

  // ── Abono ──────────────────────────────────────────────────────────────
  protected readonly formAbono = this.fb.nonNullable.group({
    monto: [0, [Validators.min(0)]],
    metodo: [METODOS_PAGO[0]],
    comprobante: [''],
  });
  private readonly montoAbono = signal(0);
  protected readonly metodoPago = signal(METODOS_PAGO[0]);
  protected readonly porcentajeAddi = Math.round(RECARGO_ADDI * 100);
  /** El monto con puntos de miles ("1.500.000") para mostrarlo en el campo. */
  protected readonly montoTexto = computed(() => formatearMiles(this.montoAbono()));

  /** El campo es de texto para poder mostrar los puntos; el formulario guarda el número. */
  protected alEscribirMonto(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const valor = leerMiles(campo.value);
    this.formAbono.controls.monto.setValue(valor);
    campo.value = formatearMiles(valor);
  }

  // ── Resumen ────────────────────────────────────────────────────────────
  /** Valor de los productos, sin recargos. */
  protected readonly subtotal = computed(() => CrearPedidoService.total(this.lineas()));
  /** Recargo, total, abono y saldo según el método de pago (Addi: 10 % y pago completo). */
  protected readonly cobro = computed(() => calcularCobro(this.subtotal(), this.metodoPago(), this.montoAbono()));
  protected readonly total = computed(() => this.cobro().total);
  protected readonly unidades = computed(() =>
    this.lineas().reduce((suma, l) => suma + l.cantidad, 0),
  );
  protected readonly abono = computed(() => this.cobro().abono);
  protected readonly saldo = computed(() => this.cobro().saldo);

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
    this.formAbono.controls.metodo.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((m) => this.metodoPago.set(m));
    // El aviso de error se borra apenas el usuario corrige algo
    merge(this.formAbono.valueChanges, this.formCliente.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.error.set(''));
  }

  protected cargarCatalogos(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    forkJoin({ clientes: this.clientesApi.listar() })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ clientes }) => {
          this.clientes.set([...clientes].sort((a, b) => a.nombre.localeCompare(b.nombre)));
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

  // ── Entrega ────────────────────────────────────────────────────────────
  protected alEscribirLocalidad(evento: Event): void {
    this.localidad.set((evento.target as HTMLInputElement).value);
    this.error.set('');
  }

  // ── Productos ──────────────────────────────────────────────────────────
  protected productoInvalido(nombre: keyof typeof this.formProducto.controls): boolean {
    const c = this.formProducto.controls[nombre];
    return c.invalid && (c.touched || c.dirty);
  }

  protected alEscribirValor(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const valor = leerMiles(campo.value);
    this.valorProducto.set(valor);
    campo.value = formatearMiles(valor);
  }

  protected agregarProducto(): void {
    if (this.formProducto.invalid) {
      this.formProducto.markAllAsTouched();
      this.errorProducto.set('Completa el diseño, el tipo y el color de la tela, y la cantidad.');
      return;
    }
    if (this.valorProducto() <= 0) {
      this.errorProducto.set('Escribe el valor del producto.');
      return;
    }
    const f = this.formProducto.getRawValue();
    this.lineas.update((lineas) => [
      ...lineas,
      {
        clave: this.siguienteClave++,
        diseno: f.diseno.trim(),
        descripcion: f.descripcion.trim() || null,
        tipoTela: f.tipoTela.trim(),
        colorTela: f.colorTela.trim(),
        cantidad: Math.floor(f.cantidad),
        precioUnitario: this.valorProducto(),
      },
    ]);
    this.formProducto.reset({ diseno: '', descripcion: '', tipoTela: '', colorTela: '', cantidad: 1 });
    this.valorProducto.set(0);
    this.errorProducto.set('');
    this.error.set('');
  }

  protected cambiarCantidad(clave: number, delta: number): void {
    this.lineas.update((lineas) =>
      lineas.map((l) => (l.clave === clave ? { ...l, cantidad: Math.max(1, l.cantidad + delta) } : l)),
    );
  }

  protected quitarProducto(clave: number): void {
    this.lineas.update((lineas) => lineas.filter((l) => l.clave !== clave));
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
    if (!this.localidad().trim()) return 'Escribe la localidad de entrega.';
    if (this.lineas().length === 0) return 'Agrega al menos un producto.';
    if (this.formAbono.invalid) return 'El abono no puede ser negativo.';
    if (this.cobro().pagoAnticipado && !this.formAbono.controls.comprobante.value.trim()) {
      return `Con ${METODO_ADDI} se paga todo por anticipado: escribe el número de la transacción.`;
    }
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
        localidad: this.localidad().trim(),
        recargo: this.cobro().recargo,
        lineas: this.lineas().map(({ clave: _, ...linea }) => linea),
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
    this.localidad.set('');
    this.formProducto.reset({ diseno: '', descripcion: '', tipoTela: '', colorTela: '', cantidad: 1 });
    this.valorProducto.set(0);
    this.errorProducto.set('');
    this.clienteId.set(null);
    this.busquedaCliente.set('');
    this.modoCliente.set('existente');
    this.formCliente.reset();
    this.formAbono.reset({ monto: 0, metodo: METODOS_PAGO[0], comprobante: '' });
    this.metodoPago.set(METODOS_PAGO[0]);
    this.error.set('');
    this.cargarCatalogos(); // incluye el cliente nuevo, si se registró uno
  }
}
