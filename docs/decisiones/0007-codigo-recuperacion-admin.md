# ADR-0007 · Código de recuperación de administrador

| Estado | Fecha | Autores |
|---|---|---|
| ✅ Aceptada | 2026-11-03 | Equipo ConexBase |

## Contexto

Si un día no queda ningún administrador activo (alguien los desactivó,
se perdió la única contraseña o un atacante los bloqueó), nadie puede
gestionar usuarios. La empresa pidió poder recuperarse **sin depender de un
desarrollador**: el dueño no sabe usar una terminal.

Se propuso primero un botón de registro con un **token fijo por rol**. Se
descartó: un token fijo se comparte o se filtra, no se sabe quién lo usó, no
se puede revocar para una sola persona, y uno de Administrador daría
control total a quien lo consiga.

## Decisión

Un **código de recuperación** de un solo uso, como los códigos de respaldo
de Gmail o Instagram:

1. El Administrador lo genera en *Usuarios y Roles → Seguridad*. Se muestra
   una sola vez; se guarda solo su hash (bcrypt).
2. El hash vive en un **archivo del servidor**
   (`storage/app/private/seguridad/codigo-recuperacion-admin.json`), **no en
   MySQL**, para que siga sirviendo si la base de datos se daña.
3. En el login, *Recuperar acceso de administrador* (`POST /api/auth/recuperar-admin`)
   crea un Administrador, o reactiva al usuario de ese correo; si el rol
   Administrador fue borrado, lo restaura.

Protecciones:

| Protección | Dónde |
|---|---|
| Solo funciona si **no hay ningún administrador activo** (409) | `UsuarioRepository::hayAdministradorActivo()` |
| Código de 20 caracteres aleatorios (≈ 99 bits): no se puede adivinar | `RecuperacionAdminService::codigoAleatorio()` |
| Un solo uso: se borra al usarlo | `RecuperacionAdminService::recuperar()` |
| 3 intentos por hora por IP (429) | `throttle:recuperacion` en `AppServiceProvider` |
| Cada código equivocado queda en `intentos_login` | `IntentosLoginService::registrarFallido()` |
| Creación del usuario en una transacción | `DB::transaction()` |

Código en: `RecuperacionAdminController`, `RecuperacionAdminService`,
`CodigoRecuperacionRepository`; frontend en `pages/recuperar-acceso` y
`pages/usuarios/codigo-recuperacion`.

## Consecuencias

- ✅ El dueño recupera el acceso solo, desde el navegador.
- ✅ Mientras exista un administrador, el código no sirve aunque se filtre.
- ✅ Todo intento con un código equivocado queda registrado.
- ⚠️ Quien tenga el papel con el código y logre que no quede ningún administrador, podría usarlo: el papel debe guardarse bajo llave.
- ⚠️ El archivo del código está en `storage/`. En un servidor real esa carpeta debe conservarse entre despliegues y entrar en las copias de seguridad.
- ⚠️ El código devuelve el acceso, no los datos: siguen haciendo falta copias de seguridad de la base de datos.
- ⚠️ Si nunca se generó un código y se pierde el acceso, se necesita a un desarrollador.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Token fijo por rol en el registro | Se filtra, no se puede revocar a una sola persona, no se sabe quién lo usó. |
| Comando en el servidor (`php artisan …`) | Seguro, pero exige a un desarrollador. Puede agregarse como respaldo. |
| Recuperación por correo electrónico | El proyecto no tiene correo configurado, y si el atacante controla el correo del administrador, también controla la recuperación. |
| Guardar el hash en la base de datos | Si la base de datos se daña o se borra, el código se perdería justo cuando más se necesita. |
