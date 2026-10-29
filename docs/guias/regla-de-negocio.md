# Cambiar una regla de negocio

Las reglas de negocio de ConexBase están reunidas en pocos archivos para que
cambiarlas sea fácil. Esta página dice dónde está cada una.

## Porcentaje de comisión

**Ejemplo:** la gerencia sube la comisión del 5 % al 6 %.

```ts title="client/src/app/config/comisiones.ts"
export const TASA_COMISION = 0.06;   // antes 0.05
```

Es el único cambio de código: *Mis Comisiones*, *Comisiones de Asesores* y
los textos ("6 % sobre el total…") usan esta constante.

Las pruebas de `models/comision.model.spec.ts` reciben el porcentaje como
parámetro, así que no hay que cambiarlas. Sí hay que actualizar el
porcentaje en esta documentación: busca `5 %` en `docs/`.

!!! warning "El cambio aplica hacia atrás"
    Las comisiones no se guardan: se calculan cada vez. Si cambias el
    porcentaje, también cambian las de meses anteriores. Si la empresa
    necesita conservar el porcentaje de cada época, hay que guardar la
    comisión de cada pedido en una tabla ([ADR-0005](../decisiones/0005-procesos-en-el-frontend.md)).

## Otras reglas y dónde están

| Regla | Valor actual | Dónde |
|---|---|---|
| Estado en que la comisión se gana | Entregado | `config/comisiones.ts` → `ESTADO_COMISIONABLE` |
| Estados en que la comisión está "por ganar" | Confirmado, En producción, Finalizado | `config/comisiones.ts` → `ESTADOS_EN_CURSO` |
| Estado inicial de un pedido | Pendiente | `services/crear-pedido.service.ts` → `ESTADO_INICIAL` |
| Largo mínimo del motivo de rechazo | 5 caracteres (`MIN_MOTIVO`) | `pages/confirmacion/confirmacion.component.ts` |
| Cuándo se puede finalizar un pedido | Todas sus producciones terminadas | `models/fabricacion.model.ts` → `listoParaFinalizar` |
| Qué cuenta como venta en el Consolidado | Todo menos Cancelado y Rechazado | `models/reportes.model.ts` |
| Vigencia de la sesión | 8 horas | `app/Services/AuthService.php` → `HORAS_VIGENCIA` |
| Intentos de login por minuto | 5 | `app/Providers/AppServiceProvider.php` → `boot()` |
| Largo mínimo de la contraseña | 8 caracteres | `app/Http/Requests/Usuario/` y `pages/usuarios` |
| Zona horaria | America/Bogota | `APP_TIMEZONE` en `.env` ([ADR-0004](../decisiones/0004-zona-horaria-bogota.md)) |

Las rutas que empiezan por `config/`, `services/`, `models/` o `pages/` están
dentro de `client/src/app/`.

Si cambias una regla, revisa si su archivo tiene un `.spec.ts` al lado y
actualiza la prueba.
