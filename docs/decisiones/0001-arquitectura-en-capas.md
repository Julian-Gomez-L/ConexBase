# ADR-0001 · Arquitectura en capas en el backend

| Estado | Fecha | Autores |
|---|---|---|
| ✅ Aceptada | Decisión del inicio del proyecto · documentada el 2026-10-29 | Equipo ConexBase |

## Contexto

El backend maneja 11 entidades y lo desarrollan 4 personas al mismo tiempo,
repartidas por entidades. En Laravel es común poner todo en el controlador
(validar, consultar, aplicar reglas), pero así cada controlador termina
haciendo las cosas a su manera y un cambio pequeño obliga a leer archivos
largos.

## Decisión

Cada petición pasa por las mismas capas, cada una con **una sola
responsabilidad**:

```text
Ruta → Middleware → Form Request → Controller → Service → Interface → Repository → Model
```

- **Controller**: recibe y responde. Sin lógica.
- **Service**: reglas de negocio y errores. Depende de la **interfaz** del repositorio, no del repositorio concreto.
- **Repository**: el único lugar con consultas a la base de datos.
- La interfaz se une a su repositorio en `AppServiceProvider` (`$this->app->bind(...)`).

El código común está una sola vez en `BaseService`, `BaseRepository` y
`Controller` (ver [Vista de bloques](../arquitectura/05-vista-de-bloques.md#clases-base-el-codigo-que-no-se-repite)).

## Consecuencias

- ✅ Todas las entidades se ven iguales: quien entiende una, entiende las 11.
- ✅ Se sabe dónde va cada cambio (validación, regla, consulta).
- ✅ Cada integrante trabaja en sus archivos sin pisar los de otros.
- ✅ Las reglas de negocio se pueden probar reemplazando el repositorio por uno falso.
- ⚠️ Más archivos por entidad (7 u 8). Para una entidad nueva hay que seguir la [guía](../guias/nuevo-recurso.md) para no olvidar ninguno.
- ⚠️ Para entidades simples, algunas capas solo pasan los datos a la siguiente.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Todo en el controlador (estilo por defecto de Laravel) | Controladores largos y distintos entre sí; difícil de repartir entre 4 personas. |
| Service sin Repository (Eloquent directo en el servicio) | Mezcla reglas y consultas; más difícil de probar. Es una opción válida si el equipo quisiera simplificar. |
