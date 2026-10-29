# Cambiar permisos o roles

Los permisos viven en **dos lugares** y casi siempre hay que tocar los dos:

| Lugar | Archivo | Para qué |
|---|---|---|
| Backend | `routes/api.php` | **Seguridad real**: qué rol puede llamar a cada endpoint. |
| Frontend | `client/src/app/app.routes.ts` y `config/navigation.ts` | Qué pantallas y opciones del menú ve cada rol. |

La tabla actual de permisos está en [API REST → Permisos](../api/index.md#permisos-por-rol).

## Caso 1: darle a un rol un permiso que no tiene

**Ejemplo:** que el **Confirmador** también pueda registrar abonos
(`POST /api/pagos`).

### Backend

En `routes/api.php` las rutas de escritura están agrupadas por los roles que
las pueden usar. Hoy `pagos.store` está en el grupo de ventas:

```php title="routes/api.php"
// ── Ventas: registrar clientes, pedidos, sus detalles y el pago inicial ──
Route::middleware(Roles::middleware(Roles::ADMIN, Roles::VENDEDOR))->group(function () {
    Route::apiResource('clientes', ClienteController::class)->only(['store', 'update']);
    Route::apiResource('detalle-pedidos', DetallePedidoController::class)->only(['store', 'update']);
    Route::apiResource('pagos', PagoController::class)->only(['store']);
    Route::apiResource('pedidos', PedidoController::class)->only(['store']);
});
```

Saca la ruta a un grupo con los roles nuevos (no agregues el rol al grupo
completo, o también podría crear clientes y pedidos):

```php title="routes/api.php"
// ── Abonos: los registra ventas y también confirmación ──
Route::middleware(Roles::middleware(Roles::ADMIN, Roles::VENDEDOR, Roles::CONFIRMADOR))->group(function () {
    Route::apiResource('pagos', PagoController::class)->only(['store']);
});
```

Verifica con `php artisan route:list --path=api/pagos -v`: la columna de
middleware muestra los roles.

!!! warning "Una misma ruta en dos grupos"
    Si `pagos.store` queda en dos grupos, Laravel usa la **última** que se
    registró. Bórrala del grupo viejo.

### Frontend

Muestra la acción en la pantalla del Confirmador (`pages/confirmacion`).
Si es una pantalla entera, agrega el rol en su ruta:

```ts title="client/src/app/app.routes.ts"
canMatch: [rolesPermitidos('administrador', 'confirmador')],
```

y en el menú del rol en `config/navigation.ts` (`NAV_BY_ROLE.confirmador`).

## Caso 2: quitarle un permiso a un rol

El mismo proceso al revés: quita el rol del grupo en `routes/api.php`, de
`rolesPermitidos(...)` y del menú. Prueba que la API responde **403** con
ese rol.

## Caso 3: crear un rol nuevo

**Ejemplo:** un rol **Contador** que solo ve reportes.

| # | Dónde | Qué |
|---|---|---|
| 1 | Base de datos | Insertar el rol en la tabla `roles` (desde *Usuarios y Roles* no se crean roles). Agrégalo también al seeder (`database/seeders/DatabaseSeeder.php`) para que exista en una base nueva. |
| 2 | `app/Support/Roles.php` | `public const CONTADOR = 'Contador';` El texto debe ser **idéntico** a `roles.nombre`. |
| 3 | `routes/api.php` | Agregar `Roles::CONTADOR` a los grupos que correspondan. Para solo leer, no hace falta nada: la lectura es para todos los autenticados. |
| 4 | `client/src/app/config/roles.ts` | Agregar `'contador'` al tipo `AppRole`, a `ROLE_LABEL` y a `resolverRol()`. |
| 5 | `client/src/app/config/navigation.ts` | Su menú en `NAV_BY_ROLE` y su pantalla de inicio en `ROLE_HOME`. |
| 6 | `client/src/app/app.routes.ts` | Agregar `'contador'` en `rolesPermitidos(...)` de sus pantallas. |
| 7 | `client/src/app/config/roles.spec.ts` | Una prueba de que `resolverRol('Contador')` lo reconoce. |

Si olvidas el paso 4, el usuario recibe *"El rol … no tiene acceso a esta
aplicación"* al iniciar sesión. Como `AppRole` es un tipo, TypeScript te
marcará en rojo los objetos (`ROLE_LABEL`, `NAV_BY_ROLE`, `ROLE_HOME`) a los
que les falta el rol nuevo.

## Probar los permisos

Con un usuario de cada rol involucrado:

1. En la aplicación: el menú muestra (o no) la opción.
2. En la API: la acción responde 200/201 al rol con permiso y **403** al rol sin permiso. Puedes probarlo desde <http://localhost:8000/docs> con el token de cada usuario.
3. Actualiza la tabla de [permisos de la API](../api/index.md#permisos-por-rol).
