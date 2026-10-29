# ADR-0006 · Un solo repositorio para backend y frontend, con Docker Compose

| Estado | Fecha | Autores |
|---|---|---|
| ✅ Aceptada | 2026-10-27 | Equipo ConexBase |

## Contexto

Al principio el backend y el frontend estaban en repositorios separados
(`ConexBase-back` y el del frontend). Para probar algo había que clonar dos
proyectos, instalar PHP, MySQL y Node.js, y mantener sincronizados los
cambios de la API con los de las pantallas. Cada integrante tenía un
computador distinto y versiones distintas.

## Decisión

1. **Un solo repositorio**, `ConexBase`: la API Laravel en la raíz y la aplicación Angular en `client/`.
2. **Docker Compose** como entorno oficial: `docker compose up --build` levanta la API, MySQL, phpMyAdmin y Angular.
3. `docker/entrypoint.sh` deja todo listo solo: crea el `.env`, genera la clave, migra y carga los datos de prueba (sin borrar datos existentes).
4. La documentación también vive en el repositorio, en `docs/`.

## Consecuencias

- ✅ Un cambio que toca API y pantallas va en un solo commit o Pull Request.
- ✅ Todos usan las mismas versiones de PHP, MySQL y Node.js.
- ✅ Un integrante nuevo tiene el sistema funcionando con dos comandos.
- ⚠️ Docker Desktop consume bastante memoria en computadores con poca RAM.
- ⚠️ `node_modules` vive dentro del contenedor, así que el editor no encuentra las librerías de Angular hasta que se ejecuta `npm install` en `client/` (ver [Problemas comunes](../primeros-pasos/instalacion.md#problemas-comunes)).

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Dos repositorios | Cambios de API y pantallas desincronizados; dos lugares para revisar. |
| Instalar todo localmente (XAMPP, Node.js) | Versiones distintas en cada computador; "en el mío sí funciona". |
