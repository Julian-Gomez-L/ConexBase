# Agregar una operación a la API

Para cuando el CRUD (`listar`, `ver`, `crear`, `actualizar`, `eliminar`) no
alcanza: una operación con reglas propias o que toca varias tablas a la vez.

**Ejemplo:** cambiar el estado de un pedido y registrar su historial **en
una sola transacción**: si falla el historial, tampoco se cambia el estado.
Hoy eso lo hace el frontend en dos peticiones
([Riesgos](../arquitectura/11-riesgos.md#procesos-de-varios-pasos-sin-transaccion)),
así que este ejemplo es también la mejora propuesta.

!!! info "Esta guía muestra cómo hacerlo; el endpoint todavía no existe"

```text
POST /api/pedidos/{id}/estado
{ "estado": "Confirmado", "observacion": "Datos y abono verificados" }
```

## 1. Validación

```php title="app/Http/Requests/Pedido/CambiarEstadoPedidoRequest.php"
<?php

namespace App\Http\Requests\Pedido;

use Illuminate\Foundation\Http\FormRequest;

class CambiarEstadoPedidoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;   // el permiso por rol lo decide la ruta
    }

    public function rules(): array
    {
        return [
            'estado'      => ['required', 'string', 'in:Confirmado,Rechazado,En producción,Finalizado,Entregado,Cancelado'],
            'observacion' => ['nullable', 'string', 'required_if:estado,Rechazado'],
        ];
    }

    public function messages(): array
    {
        return [
            'estado.in'               => 'El estado no es válido.',
            'observacion.required_if' => 'Escribe el motivo del rechazo.',
        ];
    }
}
```

## 2. Regla de negocio en el servicio

La lógica va en el **servicio**, no en el controlador. Como toca dos tablas,
el servicio recibe los dos repositorios por su interfaz.

```php title="app/Services/PedidosService.php"
use App\Interfaces\HistorialPedidosInterface;
use App\Interfaces\PedidosInterface;
use Illuminate\Support\Facades\DB;

class PedidosService extends BaseService
{
    public function __construct(
        PedidosInterface $repository,
        private HistorialPedidosInterface $historial
    ) {
        parent::__construct($repository);
    }

    // … codigo() y sustantivo() como antes …

    public function cambiarEstado(int $id, string $nuevo, ?string $observacion, int $usuarioId)
    {
        $pedido = $this->show($id);   // valida el ID y lanza 404 si no existe

        return DB::transaction(function () use ($pedido, $nuevo, $observacion, $usuarioId) {
            $this->historial->create([
                'pedido_id'       => $pedido->id,
                'cliente_id'      => $pedido->cliente_id,
                'usuario_id'      => $usuarioId,
                'estado_anterior' => $pedido->estado,
                'estado_nuevo'    => $nuevo,
                'observacion'     => $observacion,
                'fecha'           => now(),
            ]);

            return $this->repository->update(['estado' => $nuevo], $pedido->id);
        });
    }
}
```

`DB::transaction()` deshace **todo** lo que hay dentro si algo lanza un
error. Aquí también podrías validar que la transición tenga sentido (por
ejemplo, que solo un pedido *Pendiente* se pueda confirmar) y lanzar un
error 422.

## 3. Método en el controlador

```php title="app/Http/Controllers/PedidoController.php"
use App\Http\Requests\Pedido\CambiarEstadoPedidoRequest;

/**
 * Cambiar el estado
 *
 * Cambia el estado del pedido y lo registra en el historial, en una sola transacción.
 */
public function cambiarEstado(CambiarEstadoPedidoRequest $request, int $id)
{
    $datos = $request->validated();

    $pedido = $this->pedidosService->cambiarEstado(
        $id,
        $datos['estado'],
        $datos['observacion'] ?? null,
        $request->user()->id,          // quién hizo el cambio: el dueño del token
    );

    return $this->ok($pedido, 'El estado del pedido se actualizó correctamente.');
}
```

`$request->user()` es el usuario autenticado (lo deja listo el middleware
`auth.token`), así nadie puede registrar un cambio a nombre de otro.

## 4. Ruta con permisos

```php title="routes/api.php — dentro del grupo de Confirmador y Producción"
Route::post('pedidos/{id}/estado', [PedidoController::class, 'cambiarEstado']);
```

Las rutas con nombre propio van **antes** de un `apiResource` del mismo
recurso si pudieran confundirse (`pedidos/{id}` no se confunde con
`pedidos/{id}/estado`, así que aquí no importa).

## 5. Usarla desde el frontend

Agrega el método al servicio de la API, sin cambiar `CrudService`:

```ts title="client/src/app/services/api/pedidos.service.ts"
cambiarEstado(id: number, estado: string, observacion: string | null): Observable<Pedido> {
  return this.http
    .post<ApiResponse<Pedido>>(`${this.url}/${id}/estado`, { estado, observacion })
    .pipe(map((r) => r.data));
}
```

Luego `CambioEstadoService` puede llamar solo a este método en lugar de las
dos peticiones actuales.

## Checklist

- [ ] Form Request con mensajes en español
- [ ] Lógica en el servicio, con `DB::transaction()` si toca varias tablas
- [ ] Controlador corto, con docblock para Scribe
- [ ] Ruta en el grupo de roles correcto
- [ ] `php artisan scribe:generate`
- [ ] Prueba en `tests/Feature/` (al menos: funciona, y un rol sin permiso recibe 403)
- [ ] Si resuelve un punto de [Riesgos](../arquitectura/11-riesgos.md), bórralo de allí
