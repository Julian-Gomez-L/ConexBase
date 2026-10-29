# Crear una pantalla

**Ejemplo:** el Administrador necesita una pantalla de **Proveedores**.

Una pantalla toca 3 lugares: el **componente**, la **ruta** (con los roles
que pueden verla) y el **menú lateral**.

## 1. Crear el componente

Crea la carpeta `client/src/app/pages/proveedores/` con dos archivos:
`proveedores.component.ts` y `proveedores.component.html`. Es más fácil
copiar los de una pantalla parecida que usar `ng generate`, porque el
proyecto usa el sufijo `.component` y no usa archivos de estilos por
pantalla (los estilos son clases de Tailwind en el HTML).

Sigue el estilo de las demás pantallas: componente *standalone*,
`ChangeDetectionStrategy.OnPush` y estado con *signals*.

```ts title="client/src/app/pages/proveedores/proveedores.component.ts"
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { AppError, Proveedor } from '@app/models';
import { ProveedoresService } from '@app/services/api';

@Component({
  selector: 'app-proveedores',
  imports: [PageHeaderComponent],
  templateUrl: './proveedores.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProveedoresComponent implements OnInit {
  private readonly api = inject(ProveedoresService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly error = signal<AppError | null>(null);
  protected readonly proveedores = signal<Proveedor[]>([]);

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
        next: (datos) => this.proveedores.set(datos),
        error: (e: AppError) => this.error.set(e),
      });
  }
}
```

```html title="client/src/app/pages/proveedores/proveedores.component.html"
<div class="space-y-6">
  <app-page-header titulo="Proveedores" subtitulo="Proveedores de telas, espumas y materiales" />

  @if (cargando()) {
    <div class="bg-card border border-border rounded-lg h-64 animate-pulse" aria-hidden="true"></div>
  } @else if (error(); as e) {
    <div class="bg-card border border-border rounded-lg p-12 text-center" role="alert">
      <p>{{ e.message }}</p>
      <button type="button" (click)="cargar()">Reintentar</button>
    </div>
  } @else {
    <!-- tabla con proveedores() -->
  }
</div>
```

!!! tip "Copia una pantalla parecida"
    Para una tabla con filtros, mira `pages/usuarios`. Para tarjetas de
    resumen, `pages/mis-comisiones` (usa `app-stat-card`). Para estados de
    colores, usa `<app-estado-badge [estado]="…" />`.

**Dónde va cada cosa dentro de la pantalla:**

| Si necesitas… | Ponlo en |
|---|---|
| Llamar a una tabla de la API | El servicio de `services/api/` |
| Un proceso de varios pasos | Un servicio nuevo en `services/` (como `CambioEstadoService`) |
| Datos de pedidos con cliente, productos y pagos | `PedidosFacadeService.listarVista()` |
| Un cálculo (totales, agrupaciones) | Una **función pura** en `models/`, con su `.spec.ts` |
| Mostrar dinero o fechas | `utils/format.ts` y `utils/fecha.ts` |

## 2. Registrar la ruta con sus roles

```ts title="client/src/app/app.routes.ts — dentro de children de 'dashboard'"
{
  path: 'proveedores',
  canMatch: [rolesPermitidos('administrador')],
  title: 'Proveedores · ConexBase',
  loadComponent: () =>
    import('@app/pages/proveedores/proveedores.component').then((m) => m.ProveedoresComponent),
},
```

- `canMatch` impide entrar (y hasta descargar el código) a otros roles.
- `loadComponent` hace que la pantalla se descargue solo cuando se visita.
- Si una pantalla aún no está lista, usa temporalmente
  `components/en-construccion` (el comentario al inicio de `app.routes.ts`
  muestra cómo).

## 3. Agregarla al menú

```ts title="client/src/app/config/navigation.ts"
import { LucideTruck } from '@lucide/angular';

// dentro de NAV_BY_ROLE.administrador
{ path: '/dashboard/proveedores', label: 'Proveedores', icon: LucideTruck.icon },
```

Los íconos son de [Lucide](https://lucide.dev/icons/): busca el nombre y
antepón `Lucide` (por ejemplo, `truck` → `LucideTruck`).

!!! warning "El menú y la ruta no son seguridad"
    Ocultar la pantalla no impide que otro rol llame a la API directamente.
    El permiso real va en `routes/api.php` (ver [Permisos](permisos.md)).

## 4. Probar

1. `docker compose up` y entra como Administrador: la opción aparece en el menú.
2. Entra con otro rol y escribe la dirección a mano (`/dashboard/proveedores`): debe llevarte a tu inicio.
3. Si tiene cálculos, `npm test`.
