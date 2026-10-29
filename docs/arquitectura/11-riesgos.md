# 11. Riesgos y deuda técnica

Problemas conocidos del sistema. Están aquí para que nadie los descubra por
sorpresa y para que se puedan priorizar. **Si arreglas uno, bórralo de esta
página en el mismo commit.**

Prioridad: 🔴 alta · 🟠 media · 🟢 baja.

## Riesgos técnicos

### 🔴 Procesos de varios pasos sin transacción

**Qué pasa:** *Crear Pedido*, *Iniciar producción* y cualquier cambio de
estado se hacen con **varias peticiones independientes** desde el frontend
(ver [Vista de ejecución](06-vista-de-ejecucion.md#crear-un-pedido-vendedor)).
Si la conexión falla a mitad de camino, lo que ya se guardó queda guardado.
Por ejemplo: un pedido sin detalles, o un estado cambiado sin su entrada en
el historial.

**Solución propuesta:** endpoints a la medida en el backend
(`POST /api/pedidos/completo`, `POST /api/pedidos/{id}/estado`) que hagan
todos los pasos dentro de `DB::transaction()`. Si uno falla, no se guarda
nada.

### 🔴 El backend confía en los cálculos del frontend

**Qué pasa:** el `total` del pedido y el `subtotal` de cada detalle los
calcula y envía el frontend. La API solo valida que sean números positivos,
no que cuadren con los precios.

**Solución propuesta:** que el backend calcule `subtotal` y `total` con el
precio del producto, junto con el punto anterior.

### 🟠 Permisos por rol, no por registro

**Qué pasa:** un vendedor puede modificar el pedido de **otro** vendedor si
llama a la API directamente: la ruta solo revisa el rol. Tampoco se revisa
que el cambio de estado sea válido (por ejemplo, pasar de *Pendiente* a
*Entregado*).

**Solución propuesta:** *Policies* de Laravel (`app/Policies/`) para las
reglas por registro, y validar las transiciones de estado en el backend.

### 🟠 Las pantallas descargan tablas completas

**Qué pasa:** `PedidosFacadeService` pide 7 tablas completas cada vez que se
abre una pantalla de pedidos. Con pocos datos es rápido; con miles de
pedidos será lento.

**Solución propuesta:** que la API devuelva los pedidos con sus relaciones
(`with()` de Eloquent) y con filtros (por fecha, estado o asesor) y
paginación.

### 🟠 Sin pruebas en el backend

**Qué pasa:** solo existen las pruebas de ejemplo de Laravel. Un cambio en
una validación o un permiso puede romper algo sin que nadie lo note.

**Solución propuesta:** pruebas en `tests/Feature/` empezando por el login y
los permisos por rol.

## Funciones pendientes

| Función | Estado actual |
|---|---|
| Recuperación de contraseña (RF004) | No existe. El administrador puede cambiar la contraseña en *Usuarios y Roles*. |
| Cancelar un pedido (RF010) | El estado *Cancelado* existe, pero no hay botón para ponerlo. |
| Editar un pedido pendiente (RF007) | No hay pantalla. |
| Registrar abonos después de crear el pedido | Solo se registra el abono inicial en *Crear Pedido*. |
| Pagar comisiones (RF018, RF019) | Las comisiones se calculan, pero no se registra su pago. |
| Liquidación por destajo de tapiceros | No existe. |
| Finanzas (RF020) | No existe. |

## Detalles menores del código

🟢 Cosas pequeñas que conviene corregir cuando alguien toque ese archivo:

| Dónde | Qué |
|---|---|
| `app/Models/Pago.php` | La relación `cliente()` en realidad devuelve el **pedido**; debería llamarse `pedido()`. |
| `app/Http/Requests/Pedido/StorePedidoRequest.php` | Importa `Ramsey\Uuid\Type\Integer` sin usarlo. |
| `app/Http/Requests/Cliente/StoreClienteRequest.php` | Tiene mensajes para `apellido` y `fecha_nacimiento`, campos que los clientes no tienen. |
| `client/src/app/config/roles.ts` | El comentario dice que el rol Confirmador no existe en el seeder, pero ya existe. |
| `client/src/app/models/pedido.model.ts` | El comentario de `estado` no menciona *Rechazado*. |
| Migraciones | Las llaves foráneas tienen `onDelete('cascade')`, que solo actúa en un borrado físico; con el borrado lógico no tiene efecto. |
| Seeder | Los usuarios de prueba tienen contraseña de 6 caracteres, pero un usuario nuevo exige mínimo 8. |

## Riesgos del proyecto

| Riesgo | Mitigación |
|---|---|
| Accesos no autorizados | Token con vencimiento, permisos por rol en el backend, límite de intentos de login. |
| Datos inconsistentes al migrar desde WhatsApp y Excel | Migración asistida y limpieza previa de los datos (pendiente). |
| Retrasos del desarrollo | Funciones priorizadas; lo pendiente está documentado en esta página. |
| Conocimiento concentrado en una persona | Esta documentación y las [guías](../guias/index.md). |
