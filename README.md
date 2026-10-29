# ConexBase

![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
[![Documentación](https://img.shields.io/badge/docs-MkDocs-d4af37)](https://julian-gomez-l.github.io/ConexBase/)

Sistema web de **pedidos y producción** para *Basecamas y Colchones El
Dormilón* (Fontibón, Bogotá). Sigue cada pedido desde la venta hasta la
entrega (confirmación, fabricación y tapicería) y calcula las comisiones de
los asesores.

📖 **Documentación completa: <https://julian-gomez-l.github.io/ConexBase/>**
(arquitectura, decisiones, guías para hacer cambios, base de datos y API).

## Inicio rápido

Necesitas [Docker Desktop](https://www.docker.com/products/docker-desktop/) y Git.

```bash
git clone https://github.com/Julian-Gomez-L/ConexBase.git
cd ConexBase
docker compose up --build
```

| Abre | Dirección |
|---|---|
| Aplicación web | <http://localhost:4200> |
| API | <http://localhost:8000/api> |
| Referencia de la API (Scribe) | <http://localhost:8000/docs> |
| phpMyAdmin | <http://localhost:8881> (servidor `db`, usuario `root`, clave `1234`) |

Entra con `admin@conexbase.com` y la contraseña `123456`. Hay un usuario de
prueba por cada rol: [usuarios de prueba](https://julian-gomez-l.github.io/ConexBase/primeros-pasos/usuarios-prueba/).

¿Algo no funciona? [Problemas comunes](https://julian-gomez-l.github.io/ConexBase/primeros-pasos/instalacion/#problemas-comunes).

## Estructura

```text
ConexBase/
├── app/, routes/, database/, config/   API REST (Laravel)
├── client/                             Aplicación web (Angular)
├── docs/                               Documentación (este sitio: mkdocs.yml)
├── docker-compose.yml                  API + MySQL + Angular + phpMyAdmin
└── CONTRIBUTING.md                     Cómo trabajar en el proyecto
```

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md): ramas, commits, Pull Requests y cómo
mantener la documentación al día.

## Equipo

Proyecto académico del **Tecnólogo en Análisis y Desarrollo de Software**
(ficha 3177445), SENA, Centro de Diseño y Metrología, Bogotá.

Duvan Felipe Sanchez Villamil · David Sneyder Rodríguez Pulido ·
Cristian Camilo Páez Guerrero · Julian David Gómez Ladino
