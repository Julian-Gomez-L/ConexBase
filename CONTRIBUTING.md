# Cómo contribuir a ConexBase

Guía para el equipo: cómo trabajar en ramas, escribir commits, abrir un
Pull Request y mantener la documentación al día.

## Antes de empezar

1. Ten el proyecto funcionando: [Instalar con Docker](https://julian-gomez-l.github.io/ConexBase/primeros-pasos/instalacion/).
2. Lee la [Vista de bloques](https://julian-gomez-l.github.io/ConexBase/arquitectura/05-vista-de-bloques/) para saber dónde está cada cosa.
3. Si tu cambio tiene una guía en [¿Dónde hago el cambio?](https://julian-gomez-l.github.io/ConexBase/guias/), síguela.

## Flujo de trabajo

```bash
git checkout main
git pull                                   # trae lo último
git checkout -b feat/registrar-abonos      # una rama por cambio
# … programas y pruebas …
git add <archivos>
git commit                                 # ver formato abajo
git push -u origin feat/registrar-abonos   # y abres el Pull Request en GitHub
```

Nombres de rama, según el tipo de cambio:

| Prefijo | Para | Ejemplo |
|---|---|---|
| `feat/` | Función nueva | `feat/cancelar-pedido` |
| `fix/` | Corregir un error | `fix/total-con-decimales` |
| `docs/` | Solo documentación | `docs/guia-proveedores` |
| `refactor/` | Reorganizar código sin cambiar lo que hace | `refactor/transaccion-crear-pedido` |

## Commits

Formato: `tipo(alcance): descripción en español, en minúscula`

```text
feat(confirmador): pantalla Confirmación
fix(comisiones): contar la comisión en el mes de entrega
docs: guía para agregar un estado de pedido
refactor: extraer el CRUD común de los services a BaseService
```

- **Un commit, un cambio.** Si para describirlo necesitas un "y además", probablemente son dos commits.
- En el cuerpo del mensaje explica **por qué** hiciste el cambio, no solo qué cambiaste.
- Nunca subas el archivo `.env`, contraseñas ni tokens.

## Pull Requests

1. Ábrelo hacia `main`, con un título igual al de un commit.
2. En la descripción: qué cambia, por qué, y cómo probarlo (con qué usuario y en qué pantalla).
3. Pide revisión a otro integrante del equipo. No unas tu propio PR sin revisión.
4. Si el PR cambia la documentación, GitHub la construye para comprobarla. Si falla, revisa el registro de la acción *Documentación*: casi siempre es un enlace roto.

### Lista de revisión

Quien revisa (y quien escribe, antes de pedir revisión) comprueba:

- [ ] Respeta las capas: sin lógica en el controlador y sin consultas fuera del repositorio.
- [ ] Los permisos nuevos están en `routes/api.php`, no solo en el frontend.
- [ ] Cambios en la base de datos con una migración **nueva**.
- [ ] Mensajes para el usuario en español.
- [ ] Pruebas en verde: `docker compose exec client npm test` y `docker compose exec app php artisan test`.
- [ ] Si cambió la API: `php artisan scribe:generate`.
- [ ] **La documentación está al día** (ver abajo).

## La documentación es parte del cambio

La documentación vive en `docs/`, junto al código, y se actualiza **en el
mismo Pull Request** que el cambio que describe.

| Si cambiaste… | Actualiza |
|---|---|
| Una tabla o un campo | `docs/datos/index.md` |
| Una ruta o un permiso | `docs/api/index.md` |
| Cómo funciona un proceso | `docs/arquitectura/06-vista-de-ejecucion.md` |
| Una decisión técnica importante | Un ADR nuevo en `docs/decisiones/` |
| Arreglaste un problema conocido | Bórralo de `docs/arquitectura/11-riesgos.md` |
| Hiciste un cambio que no tenía guía | Escribe la guía en `docs/guias/` |

Para ver la documentación mientras la editas:

```bash
pip install -r requirements-docs.txt
mkdocs serve -a 127.0.0.1:8001             # http://127.0.0.1:8001
```

Cada página tiene un botón de lápiz (*Editar esta página*) que abre el
archivo en GitHub.

### Publicación

Al unir un Pull Request a `main`, GitHub Actions publica la documentación
en <https://julian-gomez-l.github.io/ConexBase/> en uno o dos minutos
(archivo `.github/workflows/docs.yml`).

Para que funcione, el dueño del repositorio debe activarlo **una sola vez**:

1. En GitHub, abre el repositorio → **Settings** → **Pages**.
2. En **Build and deployment → Source**, elige **GitHub Actions**.
3. Ve a la pestaña **Actions**, abre *Documentación* y usa **Run workflow** para la primera publicación.

## Estilo de código

| Parte | Estilo | Formatear |
|---|---|---|
| PHP | PSR-12 | `docker compose exec app ./vendor/bin/pint` |
| TypeScript y HTML | Prettier (`client/.prettierrc`) | `cd client && npx prettier --write src` |

Todo en español: nombres de clases, variables, tablas y mensajes.
