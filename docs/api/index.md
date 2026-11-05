# API REST

La API de Laravel responde en `http://localhost:8000/api`. Todas las rutas
están en `routes/api.php`.

## Referencia interactiva (Scribe)

La lista completa de endpoints, con sus campos y ejemplos, la genera
**Scribe** a partir del código (los docblocks `@group` de los controladores
y las reglas de los *Form Requests*):

```bash
docker compose exec app php artisan scribe:generate
```

Luego ábrela en <http://localhost:8000/docs>. Desde ahí puedes probar cada
endpoint con tu token (botón *Try it out*), y descargar la colección de
Postman y la especificación OpenAPI.

!!! tip "Regenera Scribe cuando cambies la API"
    Si agregas o cambias una ruta, un campo o una validación, vuelve a
    ejecutar `scribe:generate` en el mismo commit.

## Autenticación

Todas las rutas, salvo el login, exigen el encabezado
`Authorization: Bearer <token>`. Envía siempre también
`Accept: application/json`, para que los errores lleguen en JSON.

```bash
# 1) Iniciar sesión
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"correo": "admin@conexbase.com", "password": "123456"}'
```

```json
{
  "success": true,
  "message": "Inicio de sesión exitoso.",
  "data": {
    "token": "q3Zx…(64 caracteres)",
    "tipo": "Bearer",
    "expira_en": "2026-10-29T18:00:00-05:00",
    "usuario": {
      "id": 1, "nombre": "Carlos", "apellido": "Rodriguez",
      "correo": "admin@conexbase.com",
      "rol": { "id": 1, "nombre": "Administrador" }
    }
  }
}
```

```bash
# 2) Usar el token
curl http://localhost:8000/api/pedidos \
  -H "Accept: application/json" -H "Authorization: Bearer TU_TOKEN"
```

| Ruta | Descripción |
|---|---|
| `POST /api/auth/login` | Inicia sesión. Máximo 5 intentos por minuto por correo e IP. |
| `GET /api/auth/me` | Datos del usuario dueño del token. |
| `POST /api/auth/logout` | Cierra la sesión (borra el token). |

Cada login **fallido** queda registrado en la tabla `intentos_login`
(correo, nombre, rol, motivo, IP, navegador, fecha y hora). Al usuario se le
responde siempre el mismo mensaje genérico; el motivo solo lo ve el
Administrador.

| Ruta | Descripción | Quién |
|---|---|---|
| `GET /api/intentos-login` | Los 500 intentos fallidos más recientes, del más nuevo al más antiguo. | Super Administrador y Administrador |

Cómo funciona por dentro: [Conceptos transversales → Autenticación](../arquitectura/08-conceptos.md#autenticacion).

## Recuperación de administrador

Código de emergencia para volver a tener un **Super Administrador** cuando
no queda ninguno activo ([ADR-0007](../decisiones/0007-codigo-recuperacion-admin.md),
[ADR-0008](../decisiones/0008-super-administrador.md)).
Guía para el dueño: [¿Qué hacer si nadie puede entrar?](../administracion/recuperar-acceso.md).

| Ruta | Descripción | Quién |
|---|---|---|
| `GET /api/recuperacion-admin` | Si hay un código guardado, cuándo y quién lo generó. Nunca devuelve el código. | Solo Super Administrador |
| `POST /api/recuperacion-admin/codigo` | Genera un código nuevo y reemplaza el anterior. Única vez que se devuelve el código. | Solo Super Administrador |
| `POST /api/auth/recuperar-admin` | Con el código, crea un Super Administrador o reactiva al usuario de ese correo. Máximo 3 intentos por hora por IP. | Pública (sin token) |

```bash
curl -X POST http://localhost:8000/api/auth/recuperar-admin \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{
    "codigo": "K7QM-2XRP-9TWD-H4NB-6CVJ",
    "documento": "1012345678", "nombre": "Carlos", "apellido": "Rodriguez",
    "correo": "admin@conexbase.com",
    "password": "NuevaClave2026", "password_confirmation": "NuevaClave2026"
  }'
```

El código acepta minúsculas, espacios y guiones. Responde **201** si el
acceso se recuperó; el código queda usado.

## Recursos

Los 11 recursos siguen el mismo patrón REST (`apiResource` de Laravel):

| Método | Ruta | Acción |
|---|---|---|
| `GET` | `/api/{recurso}` | Listar todos (sin los eliminados) |
| `POST` | `/api/{recurso}` | Crear |
| `GET` | `/api/{recurso}/{id}` | Ver uno |
| `PUT` / `PATCH` | `/api/{recurso}/{id}` | Actualizar (solo los campos enviados) |
| `DELETE` | `/api/{recurso}/{id}` | Eliminar (borrado lógico) |

Recursos: `roles`, `usuarios`, `clientes`, `categorias`, `productos`,
`pedidos`, `detalle-pedidos`, `pagos`, `producciones`,
`trabajos-tapiceros` e `historial-pedidos`.

Los listados devuelven **toda** la tabla, sin paginación ni filtros, y cada
registro trae solo los ID de sus relaciones (un pedido trae `cliente_id`, no
el cliente).

## Permisos por rol

**Leer** (listar y ver) cualquier recurso: todos los usuarios autenticados.
Para escribir:

| Recurso | Crear | Actualizar | Eliminar |
|---|---|---|---|
| Roles, usuarios | Super | Super | Super |
| Categorías, productos | Admin | Admin | Admin |
| Clientes | Admin, Vendedor | Admin, Vendedor | Admin |
| Pedidos | Admin, Vendedor | Admin, Vendedor, Confirmador, Producción | Admin |
| Detalle de pedidos | Admin, Vendedor | Admin, Vendedor | Admin |
| Pagos | Admin, Vendedor | Admin | Admin |
| Producciones | Admin, Producción | Admin, Producción | Admin |
| Trabajos de tapiceros | Admin, Producción | Admin, Producción, Tapicero | Admin |
| Historial de pedidos | Admin, Vendedor, Confirmador, Producción | Admin | Admin |

*Super* = solo Super Administrador; *Admin* = Administrador **y** Super
Administrador (lo hereda todo); *Producción* = Encargado de Producción.

El último Super Administrador activo no se puede desactivar, eliminar ni
cambiar de rol, y el rol Super Administrador no se puede renombrar,
desactivar ni eliminar: la API responde **422**.

Un rol sin permiso recibe **403**. Para cambiar esta tabla, sigue la guía
[Cambiar permisos o roles](../guias/permisos.md) y actualiza esta página.

## Formato de las respuestas

=== "Éxito"

    ```json
    {
      "success": true,
      "message": "El pago se creó correctamente.",
      "data": { "id": 9, "pedido_id": 1, "monto": "150000.00", "metodo": "Transferencia" }
    }
    ```

    `201` al crear; `200` en lo demás. Al eliminar, `data` es `null`.
    Los decimales llegan como **texto** (`"150000.00"`).

=== "Error de validación"

    ```json
    {
      "success": false,
      "message": "El monto es obligatorio.",
      "error": "VALIDATION_ERROR",
      "status": 422,
      "errors": { "monto": ["El monto es obligatorio."] }
    }
    ```

=== "Otro error"

    ```json
    {
      "success": false,
      "message": "El pago no existe.",
      "error": "PAGO_NOT_FOUND",
      "status": 404
    }
    ```

## Códigos de error

| HTTP | `error` | Cuándo |
|---|---|---|
| 401 | `INVALID_CREDENTIALS` | Correo o contraseña incorrectos, o usuario inactivo. |
| 401 | `UNAUTHENTICATED` | Sin token, token vencido o usuario desactivado. |
| 403 | `FORBIDDEN` | El rol no tiene permiso para esa acción. |
| 404 | `<RECURSO>_NOT_FOUND` | El registro no existe o fue eliminado (ej. `PEDIDO_NOT_FOUND`). |
| 422 | `INVALID_ID` | El ID de la URL no es un entero positivo. |
| 422 | `VALIDATION_ERROR` | Faltan datos o son inválidos; el detalle va en `errors`. |
| 409 | `RECUPERACION_NO_DISPONIBLE` | Se intentó recuperar el acceso, pero todavía hay un Super Administrador activo. |
| 409 | `SIN_CODIGO_RECUPERACION` | No hay un código de recuperación guardado (nunca se generó o ya se usó). |
| 422 | `CODIGO_RECUPERACION_INVALIDO` | El código de recuperación no coincide. Es 422 y no 401 para que el frontend no cierre la sesión. |
| 429 | `TOO_MANY_REQUESTS` | Más de 5 intentos de login en un minuto, o más de 3 recuperaciones en una hora. El mensaje dice cuántos minutos esperar. |

Dónde se definen: `app/Exceptions/` y `bootstrap/app.php`.
