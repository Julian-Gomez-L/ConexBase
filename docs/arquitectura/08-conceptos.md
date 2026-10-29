# 8. Conceptos transversales

Reglas que se aplican en **todo** el código. Si escribes código nuevo,
respétalas para que el sistema siga siendo predecible.

## Autenticación

Implementada a mano, sin paquetes externos ([ADR-0002](../decisiones/0002-token-propio.md)).

| Aspecto | Cómo funciona | Dónde |
|---|---|---|
| Login | `POST /api/auth/login` con `correo` y `password`. Devuelve un token aleatorio de 64 caracteres. | `AuthController`, `AuthService` |
| Almacenamiento | En la tabla `tokens_acceso` se guarda **solo el hash sha256** del token, nunca el token. | `AuthService::login()` |
| Vigencia | 8 horas (`AuthService::HORAS_VIGENCIA`). Los tokens vencidos del usuario se borran en su siguiente login. | `TokenAccesoRepository` |
| Cada petición | El middleware `auth.token` busca el hash, revisa que no haya vencido y que el usuario siga **activo**. | `AutenticarConToken` |
| Cierre de sesión | `POST /api/auth/logout` borra el token. | `AuthService::logout()` |
| Fuerza bruta | Máximo 5 intentos de login por minuto por correo e IP (error 429). | `AppServiceProvider::boot()` |
| Correos registrados | El mensaje de error es el mismo exista o no el correo, y se tarda lo mismo en responder. | `AuthService::HASH_RELLENO` |
| Contraseñas | Se guardan con bcrypt automáticamente (cast `'password' => 'hashed'`) y nunca se devuelven (`$hidden`). | `app/Models/Usuario.php` |
| En el frontend | La sesión se guarda en `sessionStorage`: se pierde al cerrar la pestaña. | `AuthService` (Angular) |

## Autorización por rol

Hay dos capas, y solo una de ellas da seguridad:

| Capa | Qué hace | ¿Da seguridad? |
|---|---|---|
| **Backend**: middleware `rol:` en `routes/api.php` | Rechaza con **403** si el rol del usuario no puede usar esa ruta. | ✅ **Sí.** Es la regla real. |
| **Frontend**: `rolesPermitidos()` en `app.routes.ts` y el menú de `navigation.ts` | Oculta pantallas y no descarga su código si el rol no corresponde. | ❌ No. Es comodidad: cualquiera puede llamar a la API directamente. |

Regla general del backend:

- **Leer** (listar y ver): cualquier usuario autenticado.
- **Crear y modificar**: solo los roles que intervienen en ese proceso.
- **Eliminar**: solo el Administrador.

La tabla completa está en [API REST → Permisos](../api/index.md#permisos-por-rol).
Los nombres de los roles están en `app/Support/Roles.php` y deben coincidir
**exactamente** con la columna `roles.nombre`. En el frontend,
`resolverRol()` (`config/roles.ts`) convierte ese nombre en uno de los 5
roles de la aplicación sin depender de tildes ni mayúsculas.

## Formato de las respuestas

Todas las respuestas de la API tienen la misma forma, así el frontend las
lee siempre igual.

=== "Éxito (200 o 201)"

    ```json
    {
      "success": true,
      "message": "El pedido se creó correctamente.",
      "data": { "id": 8, "estado": "Pendiente", "total": "2000000.00" }
    }
    ```

    Los controladores la arman con `$this->ok(...)` o `$this->creado(...)`
    (en `app/Http/Controllers/Controller.php`).

=== "Error"

    ```json
    {
      "success": false,
      "message": "El pedido no existe.",
      "error": "PEDIDO_NOT_FOUND",
      "status": 404
    }
    ```

    Los errores de validación agregan `errors` con los mensajes por campo.
    La conversión de cada excepción a JSON está en `bootstrap/app.php`.

| Código HTTP | `error` | Cuándo |
|---|---|---|
| 401 | `UNAUTHENTICATED` / `INVALID_CREDENTIALS` | Sin token, token vencido, o correo y contraseña incorrectos. |
| 403 | `FORBIDDEN` | El rol no tiene permiso. |
| 404 | `<ENTIDAD>_NOT_FOUND` | El registro no existe (o fue eliminado). |
| 422 | `INVALID_ID` | El ID no es un entero positivo (`abc`, `-5`). |
| 422 | `VALIDATION_ERROR` | Faltan datos o son inválidos. |
| 429 | `TOO_MANY_REQUESTS` | Demasiados intentos de login. |

En el frontend, `errorInterceptor` convierte cualquier error en un
`AppError` (`status`, `message`, `code`, `fieldErrors`). Las pantallas solo
muestran `error.message`.

## Validación

- Los datos que llegan a la API se validan **siempre** con un *Form Request*
  (`app/Http/Requests/<Entidad>/Store…` y `Update…`), con mensajes en español.
- En `Update…` los campos van con `sometimes`: solo se validan si se envían.
- El ID de la URL lo valida `BaseService::validarId()`.
- El frontend también valida los formularios, pero solo para avisar antes;
  la validación que cuenta es la del backend.

## Borrado lógico

Ninguna tabla de negocio pierde registros: todos los modelos usan
`SoftDeletes`. Eliminar llena la columna `deleted_at` y el registro deja de
aparecer en las consultas, pero sigue en la base de datos
([ADR-0003](../decisiones/0003-borrado-logico.md)).

Los usuarios y clientes además tienen el campo `estado` (activo o inactivo).
En la pantalla *Usuarios y Roles* un usuario se **desactiva**, no se borra:
un usuario inactivo no puede iniciar sesión, pero sus pedidos y comisiones
se conservan.

## Fechas y horas

Todo el sistema trabaja en **hora de Colombia** ([ADR-0004](../decisiones/0004-zona-horaria-bogota.md)).

| Tipo de dato | Formato | Función en el frontend (`utils/fecha.ts`) |
|---|---|---|
| Fecha (`DATE`) | `2026-10-28` | `fechaISO()` |
| Fecha y hora (`DATETIME`) | `2026-10-28 14:05:00` | `ahoraMysql()` |
| Leer una fecha sin hora | — | `desdeFechaISO()` (evita que se corra un día) |
| Mostrar | `Martes, 28 de octubre de 2026`, `28/10/2026`, `14:05` | `fechaLarga()`, `fechaCorta()`, `horaCorta()` |

!!! danger "No uses `new Date().toISOString()`"
    Convierte la hora a UTC: un pedido de las 8:00 p. m. quedaría guardado
    al día siguiente.

## Dinero

- En la base de datos: `decimal(12, 2)`. Nunca `float`, porque redondea mal.
- La API devuelve los decimales **como texto** (`"150000.00"`). En el
  frontend conviértelos con `aNumero()` de `utils/format.ts` antes de sumar.
- Para mostrar, usa `formatearCOP()` (`$ 4.500.000`) o `abreviarCOP()` (`$4.5M`) de `utils/format.ts`.

## Estados

Los estados (`pedidos.estado`, `producciones.estado`,
`trabajos_tapiceros.estado`) son **texto libre** de hasta 50 caracteres; la
base de datos no restringe los valores. Los valores válidos están
definidos en el frontend:

| Estados de… | Definidos en |
|---|---|
| Pedido | `services/crear-pedido.service.ts` (`ESTADO_INICIAL`), `pages/confirmacion`, `pages/fabricacion`, `config/comisiones.ts` |
| Producción | `models/fabricacion.model.ts` (`ESTADOS_PRODUCCION`) |
| Trabajo de tapicería | `models/fabricacion.model.ts` (`ESTADOS_TRABAJO`) |
| Color de cada estado | `components/estado-badge/estado-badge.component.ts` |

Para comparar estados sin depender de tildes o mayúsculas usa
`normalizarEstado()`. Agregar un estado nuevo: ver la guía
[Agregar un estado de pedido](../guias/estado-pedido.md).

## Idioma y nombres

- Todo en español: clases, variables, tablas, mensajes y commits.
- Sin tildes ni `ñ` en nombres de código (`Produccion`, `ProduccionService`); con tildes en los textos que ve el usuario.
- Backend: estilo PSR-12 (Laravel Pint). Frontend: Prettier.

## Rendimiento en el frontend

- **Carga perezosa**: cada pantalla se descarga solo cuando se visita
  (`loadComponent` en `app.routes.ts`).
- **Signals y `OnPush`**: los componentes solo se redibujan cuando cambian
  sus datos.
- **Peticiones en paralelo**: con `forkJoin`, no una tras otra.
