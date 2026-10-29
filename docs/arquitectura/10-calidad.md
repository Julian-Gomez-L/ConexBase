# 10. Calidad y pruebas

## Escenarios de calidad

Situaciones concretas que muestran si se cumplen los
[objetivos de calidad](01-introduccion.md#objetivos-de-calidad).

| Objetivo | Escenario | Cómo se cumple hoy |
|---|---|---|
| Facilidad de uso | Un vendedor nuevo registra un pedido sin capacitación larga. | Un solo formulario en *Crear Pedido*; el total y el saldo se calculan solos. |
| Facilidad de uso | Un error de la API se le muestra al usuario en español y entendible. | Mensajes en español en los *Form Requests*; `errorInterceptor` muestra el primero. |
| Trazabilidad | La gerencia pregunta quién confirmó un pedido y cuándo. | Fila en `historial_pedidos`; se ve en *Pedidos del Día*. |
| Trazabilidad | Se elimina un registro por error. | Borrado lógico: se puede recuperar desde la base de datos. |
| Mantenibilidad | Un integrante nuevo agrega un campo a una tabla. | Sigue la guía [Agregar un campo](../guias/agregar-campo.md). |
| Seguridad | Un tapicero intenta confirmar un pedido llamando a la API directamente. | La ruta responde 403: su rol no puede modificar pedidos. |
| Seguridad | Alguien prueba contraseñas en el login. | Después de 5 intentos en un minuto, la API responde 429. |

## Pruebas automáticas

### Frontend (Vitest)

```bash
docker compose exec client npm test
# o, sin Docker:
cd client && npm test
```

Las pruebas están junto al archivo que prueban, con el sufijo `.spec.ts`.
Se concentran en la lógica de negocio, que está en **funciones puras**
(reciben datos y devuelven un resultado, sin llamar a la API), por eso son
fáciles de probar:

| Archivo de prueba | Qué comprueba |
|---|---|
| `models/comision.model.spec.ts` | 5 % solo sobre entregados; por ganar; agrupación por mes de entrega. |
| `models/reportes.model.spec.ts` | Pedidos del Día; Consolidado sin cancelados ni rechazados; exportación CSV. |
| `models/fabricacion.model.spec.ts` | Tablero de Fabricación; solo se finaliza con todas las producciones terminadas. |
| `models/mis-trabajos.model.spec.ts` | Trabajos del tapicero y sus contadores. |
| `models/pedido-vista.model.spec.ts` | Unión de pedido, cliente, asesor, productos, pagos y motivo de rechazo. |
| `services/crear-pedido.service.spec.ts` | Orden de las peticiones al crear un pedido; cálculo del total. |
| `services/cambio-estado.service.spec.ts` | Cambio de estado más su entrada en el historial. |
| `services/auth.service.spec.ts` | Login, roles desconocidos, sesión vencida y cierre de sesión. |
| `config/roles.spec.ts` | Conversión del nombre del rol del backend. |
| `pages/pedidos/pedidos.component.spec.ts` | La pantalla de pedidos con la API simulada. |

Los datos de ejemplo para las pruebas están en `client/src/app/testing/datos-prueba.ts`.

### Backend (PHPUnit)

```bash
docker compose exec app php artisan test
```

Las pruebas usan SQLite en memoria (`phpunit.xml`), así que no tocan tu base
de datos. Hoy **solo existen las pruebas de ejemplo de Laravel**: es una
deuda pendiente (ver [Riesgos](11-riesgos.md)). Las pruebas nuevas van en
`tests/Feature/`.

## Prueba manual del ciclo completo

Antes de entregar un cambio grande, recorre el
[recorrido sugerido](../primeros-pasos/usuarios-prueba.md#recorrido-sugerido)
con los 5 roles. Toma unos minutos y cubre todo el flujo del pedido.

## Antes de cada commit

- [ ] Pruebas del frontend en verde.
- [ ] Si tocaste el backend, `php artisan test` en verde.
- [ ] Si cambiaste rutas o validaciones, `php artisan scribe:generate`.
- [ ] Si cambiaste cómo funciona algo, actualizaste la página de `docs/` que lo explica.
