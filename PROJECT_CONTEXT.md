# Contexto del proyecto para asistentes de IA

Este archivo resume ConexBase para asistentes de programación (Claude,
Copilot, Cursor). La fuente completa y actualizada es la documentación en
`docs/` (publicada en <https://julian-gomez-l.github.io/ConexBase/>). Ante
cualquier diferencia, **mandan el código y `docs/`**.

## Qué es

Sistema de pedidos y producción para *Basecamas y Colchones El Dormilón*.
Flujo del pedido: Pendiente → Confirmado → En producción → Finalizado →
Entregado (también Rechazado, con motivo, y Cancelado). Roles:
Administrador, Vendedor, Confirmador, Encargado de Producción, Tapicero.

## Stack

- Backend en la raíz: Laravel 12, PHP 8.3, MySQL. API REST en `routes/api.php`.
- Frontend en `client/`: Angular 21 (standalone, signals, OnPush), Tailwind 4, Vitest.
- Docker Compose: `app` (8000), `client` (4200), `db` (3308), `phpmyadmin` (8881).

## Lee antes de cambiar código

| Para | Archivo |
|---|---|
| Dónde está cada cosa | `docs/arquitectura/05-vista-de-bloques.md` |
| Cómo funcionan los procesos | `docs/arquitectura/06-vista-de-ejecucion.md` |
| Reglas de todo el código | `docs/arquitectura/08-conceptos.md` |
| Recetas de cambios comunes | `docs/guias/` |
| Por qué se decidió cada cosa | `docs/decisiones/` |
| Tablas y campos | `docs/datos/index.md` |
| Permisos por rol | `docs/api/index.md` y `routes/api.php` |
| Problemas conocidos | `docs/arquitectura/11-riesgos.md` |

## Reglas que no se deben romper

1. **Capas en el backend:** Controller (sin lógica) → Service (reglas) → Interface → Repository (únicas consultas) → Model. Reutiliza `BaseService` y `BaseRepository`; registra el `bind` en `AppServiceProvider`.
2. **Validación** con Form Requests (`Store…` y `Update…`) y mensajes en español.
3. **Respuestas** con `$this->ok()` / `$this->creado()`: `{ success, message, data }`. Errores con las excepciones de `app/Exceptions/`.
4. **Permisos** en `routes/api.php` con `Roles::middleware(...)`. Los guards de Angular no son seguridad.
5. **Borrado lógico** (`SoftDeletes`) siempre; nunca `forceDelete`. Los usuarios se desactivan (`estado`).
6. **Base de datos:** nunca editar una migración existente; crear una nueva.
7. **Fechas** en hora de Colombia: en el frontend usa `utils/fecha.ts`, nunca `toISOString()`.
8. **Dinero** `decimal(12,2)`; en el frontend llega como texto, usa `aNumero()`.
9. **Lógica de negocio del frontend** en funciones puras de `client/src/app/models/`, con pruebas `.spec.ts`.
10. **Todo en español**: código, mensajes, commits.
11. **Documentación:** si el cambio altera algo descrito en `docs/`, actualízalo en el mismo commit.

## Comandos

```bash
docker compose up --build                                 # todo el sistema
docker compose exec app php artisan migrate:fresh --seed  # reiniciar la base de datos
docker compose exec app php artisan test                  # pruebas del backend
docker compose exec client npm test                       # pruebas del frontend
docker compose exec app php artisan scribe:generate       # referencia de la API
mkdocs serve -a 127.0.0.1:8001                            # esta documentación
```
