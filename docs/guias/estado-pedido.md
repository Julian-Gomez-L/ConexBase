# Agregar un estado de pedido

**Ejemplo:** después de *Finalizado* la empresa quiere un estado
**En despacho** (el pedido salió en el camión, pero el cliente aún no lo
recibe).

## Cómo funcionan hoy los estados

- `pedidos.estado` es **texto libre** (hasta 50 caracteres). La base de
  datos y la API aceptan cualquier valor, así que **no hace falta una
  migración**.
- Los valores válidos y sus transiciones están en el **frontend**.
- Cada cambio pasa por `CambioEstadoService.cambiar()`, que también escribe
  el historial.

Ver el [ciclo de vida del pedido](../arquitectura/06-vista-de-ejecucion.md#ciclo-de-vida-del-pedido).

## Archivos que hay que revisar

| # | Archivo (`client/src/app/…`) | Qué cambiar |
|---|---|---|
| 1 | `pages/fabricacion/fabricacion.component.ts` y `.html` | La acción que pasa el pedido al estado nuevo (`this.cambioEstado.cambiar(p.pedido, 'En despacho', '…')`) y su botón. La de *Entregado* debe partir ahora de *En despacho*. |
| 2 | `models/fabricacion.model.ts` | `construirTablero()` reparte los pedidos en columnas por estado: agregar la columna o incluirlo en una existente. Y su prueba en `fabricacion.model.spec.ts`. |
| 3 | `components/estado-badge/estado-badge.component.ts` | Su color en `ESTILOS`, con la clave en minúsculas y sin tildes: `'en despacho': 'bg-violet-500/20 text-violet-300 border-violet-500/30'`. |
| 4 | `config/comisiones.ts` | ¿La comisión sigue "por ganar" en este estado? Agrégalo a `ESTADOS_EN_CURSO`. |
| 5 | `app.routes.ts` | *Ventas Confirmadas* filtra por `estadosIncluidos`: agrégalo a la lista. |
| 6 | `pages/consolidado/consolidado.component.ts` | El color de su barra en el gráfico por estado. |
| 7 | `models/pedido.model.ts` | Agregarlo al comentario que lista los valores. |

!!! tip "Para no olvidar ninguno"
    Busca dónde aparece el estado vecino:
    `grep -rn "'Finalizado'" client/src/app`.

## Si el estado necesita un dato nuevo

Por ejemplo, la **placa del camión**. Guárdala en la `observacion` del
historial (como se hace con el motivo del rechazo), o, si se va a consultar
o filtrar, agrega un campo con la guía [Agregar un campo](agregar-campo.md).

## Si la API debe validar el estado

Hoy no lo hace (ver [Riesgos](../arquitectura/11-riesgos.md#permisos-por-rol-no-por-registro)).
Cuando exista el endpoint de cambio de estado
([Agregar una operación](nueva-operacion.md)), agrega el estado nuevo a su
regla `in:`.

## Probar

1. `npm test`: las pruebas de `fabricacion.model` y `comision.model` deben pasar.
2. Con el usuario de Producción, lleva el pedido RM-00002 hasta *En despacho* y luego *Entregado*.
3. Revisa *Pedidos del Día*: el cambio aparece con quién lo hizo.
4. Actualiza el diagrama del [ciclo de vida](../arquitectura/06-vista-de-ejecucion.md#ciclo-de-vida-del-pedido).
