# Decisiones de arquitectura (ADR)

Un **ADR** (*Architecture Decision Record*, registro de decisión de
arquitectura) es una ficha corta que explica **por qué** se tomó una
decisión técnica importante.

!!! tip "Antes de «arreglar» algo que te parece raro"
    Busca aquí si hay una razón. Si la decisión ya no tiene sentido, no la
    cambies en silencio: escribe un ADR nuevo que la reemplace.

## Listado

| N.º | Decisión | Estado |
|---|---|---|
| [0001](0001-arquitectura-en-capas.md) | Arquitectura en capas en el backend | ✅ Aceptada |
| [0002](0002-token-propio.md) | Token de acceso propio en lugar de un paquete | ✅ Aceptada |
| [0003](0003-borrado-logico.md) | Borrado lógico y desactivación en lugar de borrar | ✅ Aceptada |
| [0004](0004-zona-horaria-bogota.md) | Usar la zona horaria de Colombia | ✅ Aceptada |
| [0005](0005-procesos-en-el-frontend.md) | Procesos y cálculos de negocio en el frontend, sobre los CRUD | ✅ Aceptada, con revisión pendiente |
| [0006](0006-un-repositorio-con-docker.md) | Un solo repositorio para backend y frontend, con Docker Compose | ✅ Aceptada |

Las decisiones 0001, 0002, 0003 y 0005 se tomaron antes de existir esta
documentación; su contexto se reconstruyó a partir del código. Si
participaste en alguna y recuerdas otra razón, corrígela.

## Estados posibles

| Estado | Significado |
|---|---|
| 💬 Propuesta | Se está discutiendo; aún no se aplica. |
| ✅ Aceptada | Es la regla vigente. |
| ⛔ Rechazada | Se discutió y se decidió no hacerlo (se conserva para no repetir la discusión). |
| ♻️ Reemplazada por ADR-00XX | Ya no aplica; otra decisión ocupó su lugar. |

## Cómo escribir uno nuevo

1. Copia la [plantilla](plantilla.md) a un archivo nuevo con el siguiente
   número: `docs/decisiones/0007-titulo-corto.md`.
2. Llena las secciones: **Contexto → Decisión → Consecuencias → Alternativas**.
3. Agrégalo a la tabla de esta página y al menú en `mkdocs.yml`.
4. Súbelo en el mismo Pull Request del cambio de código que lo motiva.

Los ADR **no se borran**. Si una decisión cambia, el ADR viejo se marca como
*Reemplazada por ADR-00XX* y se escribe uno nuevo.
