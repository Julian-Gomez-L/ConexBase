# ¿Dónde hago el cambio?

Recetas paso a paso para los cambios más comunes. Cada una dice **qué
archivos tocar, en qué orden y cómo probar**, con un ejemplo real de
ConexBase.

| Necesito… | Guía | Toca |
|---|---|---|
| Guardar un dato nuevo en una tabla que ya existe (ej. el barrio del cliente) | [Agregar un campo](agregar-campo.md) | Backend + Frontend |
| Una tabla nueva con su CRUD completo (ej. proveedores) | [Crear un recurso nuevo](nuevo-recurso.md) | Backend + Frontend |
| Una operación que no es un CRUD simple (ej. cambiar el estado en una transacción) | [Agregar una operación a la API](nueva-operacion.md) | Backend |
| Una vista nueva para un rol | [Crear una pantalla](nueva-pantalla.md) | Frontend |
| Que un rol pueda (o no) hacer algo, o un rol nuevo | [Cambiar permisos o roles](permisos.md) | Backend + Frontend |
| Un paso nuevo en el flujo del pedido | [Agregar un estado de pedido](estado-pedido.md) | Frontend (y datos) |
| Cambiar el porcentaje de comisión u otra regla de negocio | [Cambiar una regla de negocio](regla-de-negocio.md) | Frontend |

!!! question "¿Tu cambio no está aquí?"
    Mira la [Vista de bloques](../arquitectura/05-vista-de-bloques.md): la
    tabla de capas te dice en qué carpeta va cada tipo de código. Si
    resuelves un cambio que no tenía guía, escribe la guía: el próximo te lo
    agradecerá.

## Reglas para cualquier cambio

1. **Base de datos:** nunca edites una migración que ya existe; crea una nueva.
2. **Backend:** respeta las capas. Sin lógica en el controlador; sin consultas fuera del repositorio.
3. **Permisos:** la seguridad va en `routes/api.php`; esconder un botón en Angular no es seguridad.
4. **Textos:** en español, para el usuario final.
5. **Pruebas:** si cambias un cálculo, cambia o agrega su prueba (`*.spec.ts`).
6. **Documentación:** actualiza la página de `docs/` que describa lo que cambiaste, en el mismo commit.
