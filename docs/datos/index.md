# Base de datos

MySQL, base de datos `ConexBase`, con **13 tablas** del negocio. La estructura la definen
las migraciones de `database/migrations/` (`01_roles.php` a
`15_rol_super_administrador.php`): **ante cualquier diferencia con esta página, mandan
las migraciones**.

Para verla con tus propios ojos: phpMyAdmin en <http://localhost:8881>
(servidor `db`, usuario `root`, clave `1234`).

## Diagrama entidad-relación

```mermaid
erDiagram
    roles ||--o{ usuarios : "tiene"
    usuarios ||--o{ tokens_acceso : "inicia sesión con"
    usuarios |o--o{ intentos_login : "intentos fallidos"
    categorias ||--o{ productos : "agrupa"

    clientes ||--o{ pedidos : "hace"
    usuarios ||--o{ pedidos : "vende (asesor)"
    pedidos ||--|{ detalle_pedidos : "contiene"
    productos ||--o{ detalle_pedidos : "aparece en"
    pedidos ||--o{ pagos : "recibe"
    usuarios ||--o{ pagos : "registra"

    pedidos ||--o{ producciones : "se fabrica en"
    productos ||--o{ producciones : "se fabrica"
    usuarios ||--o{ producciones : "encargado"
    producciones ||--o{ trabajos_tapiceros : "se tapiza en"
    usuarios ||--o{ trabajos_tapiceros : "tapicero"

    pedidos ||--o{ historial_pedidos : "registra cambios en"
    usuarios ||--o{ historial_pedidos : "hizo el cambio"
    clientes ||--o{ historial_pedidos : "del cliente"
```

Se lee así: `pedidos ||--|{ detalle_pedidos` = un pedido tiene **uno o
más** detalles; `||--o{` = **cero o más**.

## Convenciones

| Convención | Detalle |
|---|---|
| Llave primaria | `id`, `BIGINT UNSIGNED` autoincremental. |
| Llaves foráneas | `<tabla en singular>_id`, con `constrained()` y `onDelete('cascade')`. |
| Fechas de control | `created_at` y `updated_at` en todas las tablas. |
| Borrado lógico | `deleted_at` en todas las tablas excepto `tokens_acceso` e `intentos_login` ([ADR-0003](../decisiones/0003-borrado-logico.md)). Un registro con `deleted_at` lleno está eliminado. |
| Dinero | `DECIMAL(12,2)`. |
| `estado` | `BOOLEAN` (activo o inactivo) en roles, usuarios, clientes, categorías y productos. `VARCHAR(50)` (nombre del estado) en pedidos, producciones y trabajos. |

En las tablas de abajo no se repiten `id`, `created_at`, `updated_at` ni
`deleted_at`.

## Diccionario de datos

### Usuarios y acceso

#### `roles`

Roles del sistema. Sus nombres deben coincidir con `app/Support/Roles.php`.

| Campo | Tipo | Nulo | Restricción | Descripción |
|---|---|---|---|---|
| `nombre` | VARCHAR(255) | No | Único | Super Administrador, Administrador, Vendedor, Confirmador, Encargado de Producción o Tapicero. |
| `descripcion` | VARCHAR(255) | Sí | | Para qué sirve el rol. |
| `estado` | BOOLEAN | No | Por defecto `true` | Activo o inactivo. |

#### `usuarios`

Personas que entran al sistema.

| Campo | Tipo | Nulo | Restricción | Descripción |
|---|---|---|---|---|
| `documento` | VARCHAR(20) | No | Único | Documento de identidad. |
| `nombre` | VARCHAR(100) | No | | Nombres. |
| `apellido` | VARCHAR(100) | No | | Apellidos. |
| `correo` | VARCHAR(150) | No | Único | Con este correo inicia sesión. |
| `password` | VARCHAR(255) | No | | Hash bcrypt. Nunca la contraseña en claro. |
| `rol_id` | BIGINT | No | FK → `roles` | Su rol. |
| `estado` | BOOLEAN | No | Por defecto `true` | Si es `false`, no puede iniciar sesión. |

#### `tokens_acceso`

Sesiones abiertas ([ADR-0002](../decisiones/0002-token-propio.md)). No tiene borrado lógico: al cerrar sesión el token se borra.

| Campo | Tipo | Nulo | Restricción | Descripción |
|---|---|---|---|---|
| `usuario_id` | BIGINT | No | FK → `usuarios` | Dueño de la sesión. |
| `token` | CHAR(64) | No | Único | Hash sha256 del token (no el token). |
| `expira_en` | DATETIME | No | | Vencimiento: 8 horas después del login. |
| `ultimo_uso_en` | DATETIME | Sí | | Última petición hecha con el token. |

#### `intentos_login`

Inicios de sesión **fallidos**, para que el Administrador vea quién intenta
entrar, cuándo y desde dónde (pestaña *Seguridad* de *Usuarios y
Roles*). Es un registro de auditoría: no tiene borrado lógico ni se edita.
El nombre y el rol se copian como texto en el momento del intento, para que
el registro no cambie si después se edita el usuario. **La contraseña
escrita nunca se guarda.**

| Campo | Tipo | Nulo | Restricción | Descripción |
|---|---|---|---|---|
| `correo` | VARCHAR(150) | No | | Correo que se escribió. |
| `usuario_id` | BIGINT | Sí | FK → `usuarios` (`SET NULL`) | Dueño del correo; vacío si el correo no existe. |
| `nombre` | VARCHAR(201) | Sí | | Nombre y apellido del usuario en ese momento. |
| `rol` | VARCHAR(100) | Sí | | Rol del usuario en ese momento. |
| `motivo` | VARCHAR(50) | No | | `Contraseña incorrecta`, `El correo no existe`, `Usuario inactivo` o `Código de recuperación inválido`. |
| `ip` | VARCHAR(45) | Sí | | Dirección IP desde donde se intentó. |
| `navegador` | VARCHAR(255) | Sí | | *User-Agent* del navegador. |
| `fecha` | DATETIME | No | Índice | Fecha y hora del intento (hora de Colombia). |

Los intentos bloqueados por el límite de 3 por minuto (error 429) no llegan
a registrarse.

### Catálogo

#### `clientes`

| Campo | Tipo | Nulo | Restricción | Descripción |
|---|---|---|---|---|
| `documento` | VARCHAR(20) | No | Único | Documento de identidad. |
| `nombre` | VARCHAR(150) | No | | Nombre completo. |
| `telefono` | VARCHAR(20) | No | | Teléfono de contacto. |
| `correo` | VARCHAR(150) | No | Único | Correo electrónico. |
| `direccion` | VARCHAR(255) | Sí | | Dirección de entrega. |
| `estado` | BOOLEAN | No | Por defecto `true` | Activo o inactivo. |

#### `categorias`

| Campo | Tipo | Nulo | Restricción | Descripción |
|---|---|---|---|---|
| `nombre` | VARCHAR(100) | No | Único | Ej.: Sala, Sillas, Mesas. |
| `descripcion` | TEXT | Sí | | |
| `estado` | BOOLEAN | No | Por defecto `true` | Activa o inactiva. |

#### `productos`

!!! note "Ya no se usa para vender"
    Desde la migración 18 ya no hay pantalla de Catálogo: cada producto del
    pedido se describe con sus especificaciones en `detalle_pedidos`. La tabla
    se conserva solo para mostrar los pedidos anteriores al cambio.

| Campo | Tipo | Nulo | Restricción | Descripción |
|---|---|---|---|---|
| `nombre` | VARCHAR(150) | No | | Ej.: Base cama tapizada. |
| `medida` | VARCHAR(50) | Sí | | Ej.: Doble 140x190. Cada medida es un producto aparte con su propio precio. Vacía si el producto no tiene medida. |
| `descripcion` | TEXT | Sí | | |
| `precio` | DECIMAL(12,2) | No | | Precio de venta actual. |
| `categoria_id` | BIGINT | No | FK → `categorias` | Su categoría. |
| `estado` | BOOLEAN | No | Por defecto `true` | Si se puede vender. |

### Ventas

#### `pedidos`

La fecha del pedido es `created_at`.

| Campo | Tipo | Nulo | Restricción | Descripción |
|---|---|---|---|---|
| `cliente_id` | BIGINT | No | FK → `clientes` | Cliente que compra. |
| `usuario_id` | BIGINT | No | FK → `usuarios` | Asesor que lo vendió (el de la comisión). |
| `estado` | VARCHAR(50) | No | | Pendiente, Confirmado, En producción, Finalizado, Entregado, Rechazado o Cancelado. |
| `localidad` | VARCHAR(150) | Sí | | Lugar de entrega (texto libre). Obligatoria en pedidos nuevos; NULL en los anteriores a la migración 18. |
| `total` | DECIMAL(12,2) | No | | Suma de los subtotales de sus detalles más el `recargo`. |
| `recargo` | DECIMAL(12,2) | No | Por defecto 0 | Recargo por el método de pago: con **Addi** es el 10 % del valor de los productos y el cliente paga todo por anticipado. La comisión del asesor se calcula sin el recargo. |

#### `detalle_pedidos`

Un renglón por producto del pedido. El asesor describe cada producto con sus
especificaciones en *Crear Pedido* (ya no se elige de un catálogo).

| Campo | Tipo | Nulo | Restricción | Descripción |
|---|---|---|---|---|
| `pedido_id` | BIGINT | No | FK → `pedidos` | |
| `producto_id` | BIGINT | Sí | FK → `productos` | Solo en pedidos anteriores a la migración 18. |
| `diseno` | VARCHAR(150) | Sí | Obligatorio sin `producto_id` | Diseño del producto. |
| `descripcion` | TEXT | Sí | | Detalles: medidas, espaldar, botones… |
| `color_tela` | VARCHAR(100) | Sí | Obligatorio sin `producto_id` | |
| `tipo_tela` | VARCHAR(100) | Sí | Obligatorio sin `producto_id` | |
| `cantidad` | INT UNSIGNED | No | | Unidades. |
| `precio_unitario` | DECIMAL(12,2) | No | | Valor por unidad acordado en la venta. |
| `subtotal` | DECIMAL(12,2) | No | | `cantidad × precio_unitario`. |

#### `pagos`

Abonos del cliente a un pedido.

| Campo | Tipo | Nulo | Restricción | Descripción |
|---|---|---|---|---|
| `pedido_id` | BIGINT | No | FK → `pedidos` | |
| `usuario_id` | BIGINT | No | FK → `usuarios` | Quién registró el pago. |
| `monto` | DECIMAL(12,2) | No | | Valor pagado. |
| `metodo` | VARCHAR(50) | No | | Efectivo, Transferencia, etc. |
| `fecha_pago` | DATE | No | | Día del pago. |
| `comprobante` | VARCHAR(255) | Sí | | Referencia del soporte. |

#### `historial_pedidos`

Un registro por cada cambio de estado de un pedido.

| Campo | Tipo | Nulo | Restricción | Descripción |
|---|---|---|---|---|
| `pedido_id` | BIGINT | No | FK → `pedidos` | |
| `usuario_id` | BIGINT | No | FK → `usuarios` | Quién hizo el cambio. |
| `cliente_id` | BIGINT | No | FK → `clientes` | Cliente del pedido. |
| `estado_anterior` | VARCHAR(50) | Sí | | Vacío cuando el pedido se crea. |
| `estado_nuevo` | VARCHAR(50) | Sí | | Estado al que pasó. |
| `observacion` | TEXT | Sí | | Comentario; en un rechazo, el **motivo**. |
| `fecha` | DATETIME | No | | Fecha y hora del cambio (hora de Colombia). |

### Producción

#### `producciones`

Fabricación de un producto de un pedido. Se crea una por cada producto al iniciar la producción.

| Campo | Tipo | Nulo | Restricción | Descripción |
|---|---|---|---|---|
| `pedido_id` | BIGINT | No | FK → `pedidos` | |
| `detalle_pedido_id` | BIGINT | Sí | FK → `detalle_pedidos` | Qué producto del pedido se fabrica (producciones nuevas). |
| `producto_id` | BIGINT | Sí | FK → `productos` | Solo en producciones anteriores a la migración 18. |
| `usuario_id` | BIGINT | No | FK → `usuarios` | Encargado de producción. |
| `fecha_inicio` | DATE | No | | |
| `fecha_fin` | DATE | Sí | | Se llena al terminar. |
| `estado` | VARCHAR(50) | No | | Pendiente, En proceso o Finalizada. |
| `observaciones` | VARCHAR(255) | Sí | | Notas del avance. |

#### `trabajos_tapiceros`

Trabajo asignado a un tapicero sobre una producción. Una producción de varias
unidades (ej. 6 camas) se puede repartir entre varios tapiceros (ej. 3 + 2 + 1);
la suma de `cantidad` no puede pasar de las unidades del pedido
(`TrabajosTapicerosService`).

| Campo | Tipo | Nulo | Restricción | Descripción |
|---|---|---|---|---|
| `produccion_id` | BIGINT | No | FK → `producciones` | |
| `usuario_id` | BIGINT | No | FK → `usuarios` | Tapicero asignado. |
| `cantidad` | INT UNSIGNED | Sí | ≥ 1 | Unidades que le tocan a este tapicero. NULL = todas (trabajos anteriores al reparto). |
| `descripcion` | TEXT | No | | Qué hay que hacer. |
| `fecha_inicio` | DATE | No | | Fecha de asignación. |
| `fecha_fin` | DATE | Sí | | Se llena al terminar. |
| `estado` | VARCHAR(50) | No | | Pendiente, En proceso o Finalizado. |
| `observaciones` | VARCHAR(255) | Sí | | Notas del tapicero. |
| `valor` | DECIMAL(12,2) | Sí | ≥ 0 | Lo que se le paga al tapicero por el trabajo. Lo ponen Producción o el Administrador en *Pagos a Tapiceros*. |
| `observacion_valor` | VARCHAR(255) | Sí | | Nota opcional de quien puso el valor. |
| `revisado_en` | DATETIME | Sí | | Cuándo el gerente (Administrador) lo marcó *Revisado*. NULL = sin revisar. |
| `revisado_por` | BIGINT | Sí | FK → `usuarios` | Quién lo revisó. |

Reglas (`TrabajosTapicerosService::actualizarComo`): el tapicero solo cambia
estado, fechas y observaciones de **sus** trabajos; `valor` lo ponen
Producción o el Administrador; solo el Administrador marca *Revisado*, y un
trabajo revisado ya no le deja cambiar el valor a Producción. Lo que hizo cada
tapicero se suma por semana (lunes a domingo, según `fecha_fin`).

## Fuera de la base de datos: el código de recuperación

El código de recuperación de administrador **no está en MySQL**: su versión
cifrada vive en el archivo
`storage/app/private/seguridad/codigo-recuperacion-admin.json`, para que
siga sirviendo si la base de datos se daña
([ADR-0007](../decisiones/0007-codigo-recuperacion-admin.md)). Ese archivo no
se sube al repositorio.

## Tablas internas de Laravel

Además de las tablas del negocio, Laravel crea `migrations` (qué migraciones
ya se ejecutaron), `cache` y `cache_locks`. Estas dos últimas solo se usan si
`CACHE_STORE=database` en el `.env`:

| Tabla | Para qué sirve en ConexBase |
|---|---|
| `cache` | Guarda datos temporales. Hoy, solo el contador del límite de 3 intentos de login por minuto: una fila por correo e IP, con un número y su vencimiento. No guarda quién ni a qué hora; para eso está `intentos_login`. |
| `cache_locks` | "Candados" para que dos peticiones no hagan lo mismo al mismo tiempo. ConexBase todavía no los usa, así que está vacía. |

Su contenido se puede borrar en cualquier momento sin perder información
(`php artisan cache:clear`).

## Cambiar la estructura

Nunca edites una migración que ya existe: crea una nueva. Ver
[Agregar un campo](../guias/agregar-campo.md) y
[Crear un recurso nuevo](../guias/nuevo-recurso.md). Después de cambiar la
estructura, actualiza esta página.
