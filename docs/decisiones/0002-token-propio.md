# ADR-0002 · Token de acceso propio en lugar de un paquete

| Estado | Fecha | Autores |
|---|---|---|
| ✅ Aceptada | Decisión anterior · documentada el 2026-10-29 | Equipo ConexBase |

## Contexto

La API la consume una aplicación Angular separada, así que necesita un
mecanismo de sesión que no dependa de cookies del navegador. Laravel ofrece
paquetes para esto (Sanctum, Passport), pero el equipo prefirió un
mecanismo pequeño y explícito, sin dependencias, que todos pudieran leer y
entender por completo.

## Decisión

Autenticación con **token Bearer propio**:

1. `POST /api/auth/login` verifica la contraseña y genera un token aleatorio de 64 caracteres.
2. En la tabla `tokens_acceso` se guarda **solo su hash sha256**, con la fecha de vencimiento (8 horas).
3. El middleware `AutenticarConToken` (alias `auth.token`) busca el hash en cada petición y revisa que el token no haya vencido y que el usuario siga activo.
4. `POST /api/auth/logout` borra el token.

Protecciones adicionales: límite de 5 intentos de login por minuto, el mismo
mensaje de error exista o no el correo, y el mismo tiempo de respuesta en
los dos casos.

Detalle en [Conceptos transversales](../arquitectura/08-conceptos.md#autenticacion).

## Consecuencias

- ✅ Sin dependencias extra; todo el mecanismo está en 4 archivos.
- ✅ Si alguien roba la base de datos, no obtiene tokens válidos (solo sus hashes).
- ✅ Desactivar un usuario corta su acceso de inmediato, aunque tenga un token vigente.
- ⚠️ Lo mantiene el equipo: cualquier mejora (renovar el token, cerrar todas las sesiones) hay que programarla.
- ⚠️ El token vive en `sessionStorage` del navegador: una vulnerabilidad XSS podría leerlo.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Laravel Sanctum | Hace casi lo mismo con más configuración y conceptos (guards, abilities). Es la opción a considerar si el sistema crece. |
| Laravel Passport (OAuth2) | Pensado para que terceros accedan a la API; demasiado para una aplicación interna. |
| JWT | El token no se puede revocar antes de que venza sin agregar una lista negra. |
| Sesión con cookies | Exige que frontend y API estén en el mismo dominio y protección CSRF. |
