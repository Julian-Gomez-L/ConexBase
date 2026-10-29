# ADR-0004 · Usar la zona horaria de Colombia

| Estado | Fecha | Autores |
|---|---|---|
| ✅ Aceptada | 2026-10-28 | Equipo ConexBase |

## Contexto

Laravel trae por defecto la zona horaria **UTC**. El frontend guarda las
fechas con la hora local de Colombia (UTC−5), pero el backend las
interpretaba como UTC.

El resultado: un pedido creado a las **10:00** aparecía a las **05:00**, y
los cambios hechos después de las 7:00 p. m. aparecían **en el día
siguiente** en *Pedidos del Día*, en el *Consolidado* y en las comisiones
del mes.

## Decisión

Toda la aplicación trabaja en la zona horaria **`America/Bogota`**:

- **Backend:** `config/app.php` lee `APP_TIMEZONE`, con `America/Bogota`
  como valor por defecto, y la variable está en `.env.example`.
- **Frontend:** las fechas se arman con las funciones de
  `client/src/app/utils/fecha.ts` (`fechaISO`, `ahoraMysql`,
  `desdeFechaISO`), **nunca** con `new Date().toISOString()`, que convierte
  a UTC.

## Consecuencias

- ✅ Las horas y los días coinciden en todas las pantallas y reportes.
- ✅ Una sola regla para todo el equipo.
- ⚠️ Quien escriba código nuevo con fechas debe usar `utils/fecha.ts`.
- ⚠️ Si la empresa llegara a operar en otro país, habría que revisar esta decisión.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Guardar todo en UTC y convertir al mostrar | Es lo correcto en sistemas de varios países, pero obliga a convertir en cada pantalla y en cada consulta por día. Innecesario para una empresa en un solo país. |
| Dejarlo como estaba | Los reportes por día y las comisiones mensuales salían mal. |
