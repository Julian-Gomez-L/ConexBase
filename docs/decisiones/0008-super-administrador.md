# ADR-0008 · Rol Super Administrador

| Estado | Fecha | Autores |
|---|---|---|
| ✅ Aceptada | 2026-11-04 | Equipo ConexBase |

## Contexto

Hasta ahora el **Administrador** podía hacer todo, incluido crear usuarios,
cambiarles el rol y generar el código de recuperación
([ADR-0007](0007-codigo-recuperacion-admin.md)).

La empresa quiere que varias personas administren el negocio (catálogo,
pedidos, reportes) **sin** poder dar o quitar accesos. Si cualquiera de ellas
puede crear usuarios o ver la llave de emergencia, el riesgo crece con cada
administrador nuevo.

## Decisión

Un rol nuevo, **Super Administrador**, por encima del Administrador:

| Qué | Super Administrador | Administrador |
|---|---|---|
| Catálogo, pedidos, reportes, eliminar registros, intentos fallidos | ✅ | ✅ |
| **Ver** usuarios y roles | ✅ | ✅ |
| **Crear, editar o desactivar** usuarios y roles | ✅ | ❌ (403) |
| Generar o consultar el **código de recuperación** | ✅ | ❌ (403) |
| Crear otros Super Administradores | ✅ | ❌ |

Cómo se aplica:

1. **Herencia automática en el backend.** `Roles::middleware()` agrega el
   Super Administrador a toda ruta que permita al Administrador. Así no hay
   que repetirlo en cada grupo de `routes/api.php`.
2. **Un grupo propio** en `routes/api.php` (`Roles::middleware(Roles::SUPERADMIN)`)
   con la escritura de `roles` y `usuarios` y las rutas de
   `recuperacion-admin`.
3. **Herencia en el frontend.** `cumpleRol()` (`config/roles.ts`) deja pasar
   al Super Administrador donde se permite `'administrador'`, y
   `gestionaUsuarios()` decide si *Usuarios y Roles* se muestra en modo
   lectura.
4. **Siempre queda uno.** `UsuarioService` no deja desactivar, eliminar ni
   cambiar de rol al **último** Super Administrador activo (422).
   `RolService` no deja renombrar, desactivar ni eliminar el rol (422); su
   descripción sí se puede cambiar.
5. **La recuperación devuelve un Super Administrador.** El código
   ([ADR-0007](0007-codigo-recuperacion-admin.md)) solo funciona cuando no
   queda **ningún Super Administrador activo**, aunque haya Administradores:
   un Administrador no puede arreglar los usuarios.
6. **Migración `15_rol_super_administrador`.** Crea el rol si no existe,
   **sin** asignárselo a nadie. En una base existente, el Super
   Administrador inicial se asigna a mano o con el código de recuperación.

## Consecuencias

- ✅ Pueden existir varios Administradores sin que ninguno pueda darse más permisos.
- ✅ La llave de emergencia la conoce una sola persona (o pocas).
- ✅ No se puede quedar el sistema sin Super Administrador por un clic equivocado.
- ⚠️ En una base de datos que ya existía, después de migrar **nadie** es Super Administrador hasta que se le asigne el rol (ver *Cómo empezar* en la guía de [recuperación](../administracion/recuperar-acceso.md)).
- ⚠️ El nombre del rol en la tabla `roles` debe ser exactamente `Super Administrador`.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Permisos por acción en una tabla (`permisos`, `rol_permiso`) | Más flexible, pero mucho más trabajo y pantallas; hoy solo se necesita una diferencia. |
| Un indicador `es_super` en `usuarios` | Mezcla dos formas de dar permisos (rol e indicador) y obliga a revisar ambos en cada ruta. |
| Que el Administrador siga gestionando usuarios | Es justo lo que la empresa no quiere. |
| Que el código recupere un Administrador | Ese Administrador no podría arreglar los usuarios: la recuperación no serviría. |
