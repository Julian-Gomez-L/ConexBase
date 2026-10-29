# ADR-0005 · Procesos y cálculos de negocio en el frontend, sobre los CRUD

| Estado | Fecha | Autores |
|---|---|---|
| ✅ Aceptada, con revisión pendiente | 2026-10-28 | Equipo ConexBase |

## Contexto

El backend ya tenía un CRUD completo para cada una de las 11 tablas, pero
las pantallas necesitan procesos que tocan varias tablas a la vez (crear un
pedido con su cliente, detalles, abono e historial) y datos combinados
(un pedido con su cliente, productos y pagos). El equipo necesitaba que la
aplicación funcionara pronto para empezar a usarla y probarla.

## Decisión

Construir las pantallas **combinando los CRUD existentes** desde el
frontend, sin crear endpoints nuevos por ahora:

| Necesidad | Dónde se resuelve |
|---|---|
| Procesos de varios pasos | Servicios de Angular: `CrearPedidoService`, `CambioEstadoService` |
| Datos combinados | `PedidosFacadeService`: pide 7 tablas en paralelo y las une |
| Cálculos (comisiones, reportes, tablero de fabricación) | **Funciones puras** en `client/src/app/models/`, cada una con sus pruebas |
| Política de comisión (5 %) | `client/src/app/config/comisiones.ts` |

La seguridad **no** se movió al frontend: los permisos por rol y la
validación siguen en el backend.

## Consecuencias

- ✅ Todas las pantallas por rol quedaron funcionando sin cambiar la API.
- ✅ Los cálculos están aislados en funciones puras, fáciles de probar y de mover al backend después.
- ⚠️ **Sin transacciones**: si un proceso falla a mitad de camino, quedan datos a medias.
- ⚠️ El backend acepta el `total` y el `subtotal` que envía el frontend sin verificarlos.
- ⚠️ Cada pantalla descarga tablas completas; será lento con muchos datos.
- ⚠️ Si se crea otro cliente (por ejemplo, una aplicación móvil), tendría que repetir esta lógica.

Estos puntos están en [Riesgos y deuda técnica](../arquitectura/11-riesgos.md).

## Cuándo revisar esta decisión

Cuando el sistema vaya a producción, o antes si aparecen datos a medias.
El camino es mover, uno por uno, los procesos a endpoints del backend con
`DB::transaction()`, empezando por *Crear Pedido* y el cambio de estado.

## Alternativas consideradas

| Alternativa | Por qué no (por ahora) |
|---|---|
| Endpoints a la medida desde el principio (`POST /pedidos/completo`) | Es lo más robusto, pero retrasaba tener la aplicación funcionando. Es el siguiente paso. |
| Calcular las comisiones en el backend y guardarlas en una tabla | Necesario cuando se registre el **pago** de comisiones (RF018); para mostrarlas basta con calcularlas. |
