# 2. Restricciones

Condiciones que el equipo **no puede cambiar** y que limitan las decisiones
técnicas.

## Técnicas

| Restricción | Consecuencia |
|---|---|
| Backend en **Laravel** (PHP) y frontend en **Angular**, definidos al inicio del proyecto | La API y la aplicación web son dos proyectos separados que se comunican por HTTP. |
| Base de datos relacional **MySQL** | Las relaciones se garantizan con llaves foráneas; los cambios de estructura se hacen con migraciones. |
| Todo debe correr con **Docker** | Cualquier integrante levanta el sistema igual, con un comando, sin instalar PHP ni MySQL. |
| Sin pasarela de pagos ni integraciones externas | El método de pago es solo un texto (Efectivo, Transferencia…); el comprobante es una referencia escrita. |

## Organizacionales

| Restricción | Consecuencia |
|---|---|
| Equipo de 4 aprendices con tiempo y experiencia limitados | Se prefieren soluciones simples y repetibles a soluciones sofisticadas. |
| Proyecto académico, con entregas por fases | Algunas funciones quedan pendientes y están marcadas como tales. |
| El personal de la empresa tiene poca experiencia digital | Las pantallas deben ser simples y los mensajes, claros. |
| Instalar y probar sin interrumpir la operación de la empresa | Todo se prueba con [datos de prueba](../primeros-pasos/usuarios-prueba.md) en entornos locales. |
| Ley colombiana de protección de datos personales (Habeas Data, Ley 1581 de 2012) | Se guardan solo los datos de clientes necesarios para el pedido; el acceso requiere usuario y rol. |

## Convenciones

| Convención | Ejemplo |
|---|---|
| Código, base de datos, mensajes y documentación en **español** | `PedidosService`, `historial_pedidos`, `'El pedido no existe.'` |
| Tablas en plural, modelos en singular | tabla `pedidos`, modelo `Pedido` |
| Rutas de la API en plural, con guiones | `/api/detalle-pedidos`, `/api/trabajos-tapiceros` |
| Llaves foráneas `<entidad>_id` | `cliente_id`, `usuario_id` |
| Dinero como `decimal(12, 2)`, nunca `float` | `total`, `precio`, `monto` |
| Zona horaria de Colombia | Ver [ADR-0004](../decisiones/0004-zona-horaria-bogota.md) |
