# Arquitectura

Esta sección explica **cómo está construido ConexBase y por qué**. Sigue la
plantilla [arc42](https://arc42.org/), un estándar usado en la industria para
documentar arquitecturas de software. Sus secciones van de lo general a lo
particular:

| Sección | Responde a… |
|---|---|
| [1. Introducción y objetivos](01-introduccion.md) | ¿Qué problema resuelve el sistema y qué se espera de él? |
| [2. Restricciones](02-restricciones.md) | ¿Qué condiciones no podemos cambiar? |
| [3. Contexto y alcance](03-contexto.md) | ¿Quién usa el sistema y qué queda por fuera? |
| [4. Estrategia de solución](04-estrategia.md) | ¿Cuáles son las ideas principales de la solución? |
| [5. Vista de bloques](05-vista-de-bloques.md) | ¿En qué partes se divide el código y dónde está cada una? |
| [6. Vista de ejecución](06-vista-de-ejecucion.md) | ¿Cómo colaboran esas partes en los procesos reales? |
| [7. Despliegue](07-despliegue.md) | ¿Cómo se pone a funcionar? |
| [8. Conceptos transversales](08-conceptos.md) | ¿Qué reglas aplican en todo el código? |
| [9. Decisiones](09-decisiones.md) | ¿Por qué se eligió cada cosa? |
| [10. Calidad y pruebas](10-calidad.md) | ¿Cómo sabemos que funciona? |
| [11. Riesgos y deuda técnica](11-riesgos.md) | ¿Qué problemas conocidos hay? |
| [12. Glosario](12-glosario.md) | ¿Qué significa cada término del negocio? |

Los diagramas siguen el [modelo C4](https://c4model.com/): se ven como un
mapa con zoom, desde el sistema completo (nivel 1, *contexto*) hasta sus
piezas internas (nivel 3, *componentes*). Están escritos con
[Mermaid](https://mermaid.js.org/), así que se editan como texto dentro de
cada archivo `.md`.

!!! tip "¿Eres nuevo en el proyecto?"
    Lee en este orden: [3. Contexto](03-contexto.md) →
    [5. Vista de bloques](05-vista-de-bloques.md) →
    [6. Vista de ejecución](06-vista-de-ejecucion.md). Con eso ya sabes
    dónde está cada cosa. Para hacer un cambio concreto, ve a
    [¿Dónde hago el cambio?](../guias/index.md).
