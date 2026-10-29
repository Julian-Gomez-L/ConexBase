# Instalar con Docker

Con Docker todo el sistema (API, base de datos y aplicación web) se levanta
con **un solo comando**. No necesitas instalar PHP, MySQL ni Node.js en tu
computador.

## 1. Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/), que ya trae Docker Compose.
- [Git](https://git-scm.com/).
- Estos puertos libres en tu computador:

| Puerto | Servicio |
|---|---|
| 4200 | Aplicación web (Angular) |
| 8000 | API (Laravel) |
| 3308 | MySQL |
| 8881 | phpMyAdmin |

## 2. Clonar el repositorio

```bash
git clone https://github.com/Julian-Gomez-L/ConexBase.git
cd ConexBase
```

## 3. Levantar todo

Abre **Docker Desktop** primero y espera a que diga que está corriendo.
Luego, desde la carpeta del proyecto:

```bash
docker compose up --build
```

La primera vez tarda varios minutos. Docker hace solo esto, en orden
(lo hace el archivo `docker/entrypoint.sh`):

1. Crea el `.env` copiando `.env.example`, si no existe.
2. Genera la clave de Laravel (`APP_KEY`).
3. Espera a que MySQL esté listo y crea las tablas (migraciones).
4. Carga los [datos de prueba](usuarios-prueba.md), solo si la base de datos está vacía.
5. Arranca la API, y el contenedor `client` instala las dependencias de Angular y arranca la aplicación web.

Está listo cuando en la terminal aparecen `API lista en http://localhost:8000/api`
y `Local: http://localhost:4200/`.

| Abre | Dirección |
|---|---|
| **Aplicación web** | <http://localhost:4200> |
| API | <http://localhost:8000/api> |
| Documentación de la API (Scribe) | <http://localhost:8000/docs> |
| phpMyAdmin | <http://localhost:8881> (servidor `db`, usuario `root`, clave `1234`) |

Entra con uno de los [usuarios de prueba](usuarios-prueba.md), por ejemplo
`admin@conexbase.com` con la contraseña `123456`.

## Comandos del día a día

```bash
docker compose up -d                 # arrancar en segundo plano
docker compose logs -f app           # ver el log de la API
docker compose logs -f client        # ver el log de Angular
docker compose down                  # apagar (los datos se conservan)
docker compose down -v               # apagar y BORRAR la base de datos
docker compose up --build            # volver a construir (después de cambiar el Dockerfile o composer.json)
```

Comandos dentro de los contenedores:

```bash
docker compose exec app php artisan migrate               # aplicar migraciones nuevas
docker compose exec app php artisan migrate:fresh --seed  # recrear la base de datos con datos de prueba
docker compose exec app php artisan route:list --path=api # ver todas las rutas de la API
docker compose exec app php artisan scribe:generate       # regenerar la documentación de la API
docker compose exec app php artisan test                  # pruebas del backend
docker compose exec client npm test                       # pruebas del frontend
```

## Problemas comunes

??? failure "El navegador dice «No se puede acceder a este sitio» en localhost:4200"
    - Revisa que Docker Desktop esté abierto y que `docker compose up` siga corriendo.
    - La primera vez Angular tarda en instalar dependencias. Espera a ver `Local: http://localhost:4200/` en el log (`docker compose logs -f client`).

??? failure "Los datos de prueba no cambian, o falta un rol o un usuario nuevo"
    El *seeder* solo carga datos si la base de datos está vacía, para no
    borrar lo que ya tienes. Para recrearla desde cero:

    ```bash
    docker compose down -v
    docker compose up --build
    ```

??? failure "Cambié .env.example y no se aplica"
    El `.env` solo se crea la primera vez. Si `.env.example` cambia (por
    ejemplo, se agrega `APP_TIMEZONE`), copia la línea nueva a tu `.env` a
    mano, o borra tu `.env` y reinicia el contenedor `app`.

??? failure "Un puerto ya está en uso (port is already allocated)"
    Otro programa usa ese puerto, por ejemplo un MySQL instalado en tu
    computador. Ciérralo, o cambia el número de la izquierda en
    `docker-compose.yml` (por ejemplo `"3309:3306"`). No subas ese cambio
    al repositorio.

??? failure "VS Code marca error en los imports: Cannot find module '@angular/core'"
    La aplicación funciona, pero el editor no encuentra las librerías: en
    Docker, `node_modules` vive dentro del contenedor y no en tu carpeta
    `client/`. Para que el editor las vea, instálalas también en tu computador
    (necesitas Node.js 22):

    ```bash
    cd client
    npm install
    ```

## Arrancar sin Docker

Solo si no puedes usar Docker. Necesitas PHP 8.3 con Composer, MySQL y
Node.js 22.

=== "Backend"

    ```bash
    cp .env.example .env
    # En .env: DB_HOST=127.0.0.1, y el usuario y la clave de tu MySQL
    composer install
    php artisan key:generate
    php artisan migrate --seed
    php artisan serve                 # http://localhost:8000
    ```

=== "Frontend"

    ```bash
    cd client
    npm install
    npm start                         # http://localhost:4200
    ```

    En desarrollo Angular reenvía todo lo que empieza por `/api` hacia
    `http://localhost:8000` (archivo `client/proxy.conf.js`).

## Ver esta documentación en tu computador

Necesitas Python 3.

```bash
pip install -r requirements-docs.txt
mkdocs serve -a 127.0.0.1:8001       # http://127.0.0.1:8001
```

Se usa el puerto 8001 porque el 8000 lo ocupa la API. La página se recarga
sola cada vez que guardas un archivo de `docs/`.
