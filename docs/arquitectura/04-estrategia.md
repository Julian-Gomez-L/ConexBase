# 4. Estrategia de solución

Las ideas principales sobre las que se construyó ConexBase. Cada una tiene su
explicación completa en un [ADR](../decisiones/index.md).

| Problema | Solución elegida | Detalle |
|---|---|---|
| Separar la aplicación web del manejo de datos | **API REST** en Laravel que responde JSON, y una aplicación **Angular** que la consume. | [5. Vista de bloques](05-vista-de-bloques.md) |
| Que el código del backend sea fácil de ubicar y cambiar | **Capas**: Controller → Service → Repository → Model, con una clase base para lo repetido. | [ADR-0001](../decisiones/0001-arquitectura-en-capas.md) |
| Que solo entre quien debe | **Token Bearer propio**, guardado como hash, que vence en 8 horas. | [ADR-0002](../decisiones/0002-token-propio.md) |
| Que cada rol haga solo lo suyo | Permisos por rol en las **rutas** del backend; el frontend solo oculta lo que no corresponde. | [8. Conceptos](08-conceptos.md#autorizacion-por-rol) |
| No perder información | **Borrado lógico** en todas las tablas y **historial** de cada cambio de estado. | [ADR-0003](../decisiones/0003-borrado-logico.md) |
| Horas y días correctos en reportes | Todo el sistema en la **zona horaria de Colombia**. | [ADR-0004](../decisiones/0004-zona-horaria-bogota.md) |
| Construir las pantallas sin esperar endpoints a la medida | Las pantallas **combinan los CRUD** existentes y hacen los cálculos (comisiones, reportes) en el frontend con funciones probadas. | [ADR-0005](../decisiones/0005-procesos-en-el-frontend.md) |
| Que cualquiera del equipo pueda correr el sistema | **Un solo repositorio** y **Docker Compose**. | [ADR-0006](../decisiones/0006-un-repositorio-con-docker.md) |
