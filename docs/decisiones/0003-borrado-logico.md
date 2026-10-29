# ADR-0003 · Borrado lógico y desactivación en lugar de borrar

| Estado | Fecha | Autores |
|---|---|---|
| ✅ Aceptada | Decisión del inicio del proyecto · documentada el 2026-10-29 | Equipo ConexBase |

## Contexto

Los registros están muy relacionados: un pedido apunta a su cliente y a su
asesor; los pagos, producciones e historial apuntan al pedido. Si se borra
de verdad un vendedor, se pierde quién hizo cada venta y ya no se pueden
calcular sus comisiones pasadas. Además, uno de los
[objetivos de calidad](../arquitectura/01-introduccion.md#objetivos-de-calidad)
es la trazabilidad.

## Decisión

1. **Borrado lógico en todas las tablas de negocio.** Los 11 modelos usan
   `SoftDeletes`: eliminar llena `deleted_at` y el registro deja de aparecer,
   pero sigue en la base de datos. Nunca se usa `forceDelete()`.
2. **Solo el Administrador puede eliminar** (rutas `destroy` en `routes/api.php`).
3. **Usuarios: se desactivan, no se eliminan.** En *Usuarios y Roles* no hay
   botón de eliminar; se cambia el campo `estado`. Un usuario inactivo no
   puede iniciar sesión, pero sus pedidos, pagos y comisiones se conservan,
   y se puede reactivar si vuelve a la empresa.

## Consecuencias

- ✅ No se pierde historia: siempre se sabe quién hizo qué.
- ✅ Un borrado por error se puede deshacer desde la base de datos (vaciar `deleted_at`).
- ⚠️ Los registros eliminados ocupan espacio y siguen contando para las restricciones `unique`: no se puede crear un cliente con el documento de uno eliminado.
- ⚠️ Las llaves foráneas tienen `onDelete('cascade')`, que no actúa con el borrado lógico: al eliminar un pedido, sus pagos no se marcan como eliminados.
- ⚠️ Toda consulta escrita a mano (sin Eloquent) debe filtrar `deleted_at IS NULL`.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Borrado físico | Se pierde la trazabilidad y se rompen las relaciones. |
| Solo el campo `estado` (activo/inactivo), sin `SoftDeletes` | Sirve para usuarios y catálogos, pero no tiene sentido "desactivar" un pago o un detalle de pedido. |
