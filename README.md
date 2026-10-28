# ConexBase

![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![Docs](https://img.shields.io/badge/Docs-Scribe-6C47FF)
![Estado](https://img.shields.io/badge/estado-en%20desarrollo-orange)

Sistema de información integrado para **Basecamas y Colchones El Dormilón** (Fontibón, Bogotá). Este repositorio contiene **todo el sistema en una sola carpeta**: la API REST (Laravel, en la raíz) y la aplicación web (Angular, en `client/`).

Proyecto académico del **Tecnólogo en Análisis y Desarrollo de Software** (ficha 3177445), SENA — Centro de Diseño y Metrología, Bogotá, 2025.

## Tabla de contenido

1. [Descripción](#descripción-qué-problema-resuelve)
2. [Qué incluye hoy y qué falta](#qué-incluye-hoy-y-qué-falta)
3. [Tecnologías usadas](#tecnologías-usadas)
4. [Requisitos previos](#requisitos-previos)
5. [Instalación y arranque](#instalación-y-arranque)
6. [Configuración](#configuración)
7. [Uso](#uso)
8. [Estructura del proyecto](#estructura-del-proyecto)
9. [Cómo contribuir](#cómo-contribuir)
10. [Licencia](#licencia)
11. [Contacto o autores](#contacto-o-autores)
12. [Diccionario de datos](#diccionario-de-datos--sistema-de-pedidos-y-producción-laravel)

---

## Descripción: ¿qué problema resuelve?

Hoy la empresa maneja pedidos, producción y pagos por **WhatsApp y Excel**. Eso causa errores de transcripción, información duplicada o perdida, y no hay forma de saber en qué etapa va cada pedido.

ConexBase centraliza todo en una sola base de datos y sigue el recorrido completo de un pedido:

**Ventas → Confirmación → Producción → Tapicería / Esqueletería → Control de calidad → Entrega**

Objetivos principales:

- Eliminar errores de digitación al tener una única fuente de datos.
- Calcular automáticamente la liquidación por destajo de los tapiceros y las comisiones de los asesores.
- Dar trazabilidad al pedido y mejorar la comunicación entre áreas.
- Entregar reportes para que la gerencia tome decisiones.
- Mantener un diseño modular para adaptarlo en el futuro a otras empresas del mismo sector en Bogotá.

## Qué incluye hoy y qué falta

| Módulo (según la documentación) | Estado |
|---|---|
| Inicio y cierre de sesión con token, bloqueo por intentos y control de acceso por rol (API) | Listo |
| Datos base: roles, usuarios, clientes, categorías, productos | CRUD listo |
| Ventas: pedidos, detalle de pedido, historial de pedidos | CRUD listo |
| Pagos, producción y trabajos de tapicería | CRUD listo |
| Aplicación web: login, menú por rol, Panel General, Ventas y Mis Pedidos | Listo, con datos reales |
| Aplicación web: crear pedido, confirmación, fabricación, tapicero, comisiones, usuarios | Pantalla "en construcción" |
| Recuperación de contraseña | Pendiente |
| Cálculo de comisiones y liquidación de tapiceros | Pendiente |
| Finanzas (ingresos y reportes) | Pendiente |

Cada entidad de la API ofrece listar, crear, ver, actualizar y eliminar. La eliminación es **lógica** (el registro se marca como borrado, no se pierde).

## Tecnologías usadas

- **Backend:** PHP 8.3 y Laravel 12, con patrón por capas (Controlador → Servicio → Repositorio → Modelo)
- **Frontend:** Angular 21 (componentes standalone, signals), TypeScript estricto, RxJS y Tailwind CSS 4
- **Base de datos:** MySQL (`ConexBase`) y phpMyAdmin para consultarla
- **Docker y Docker Compose** para levantar todo con un solo comando
- **Scribe** para la documentación de la API, **PHPUnit** y **Vitest** para pruebas

## Requisitos previos

Lo más simple es con Docker:

- [Docker Desktop](https://www.docker.com/) (incluye Docker Compose)
- [Git](https://git-scm.com/)

Puertos libres en tu equipo: **4200** (aplicación web), **8000** (API), **3308** (MySQL) y **8881** (phpMyAdmin).

Sin Docker necesitas PHP 8.3 + Composer, MySQL y Node.js 22.12 o superior (ver "Arranque sin Docker").

## Instalación y arranque

### Con Docker (recomendado): un solo comando

Desde la raíz del proyecto (donde está `docker-compose.yml`):

```bash
docker compose up --build
```

La primera vez tarda unos minutos: descarga imágenes, instala dependencias, crea el `.env`, genera la clave, crea las tablas y carga los datos de prueba. Cuando veas `API lista` y `Local: http://localhost:4200/` ya puedes entrar.

| Servicio | Dirección |
|---|---|
| **Aplicación web** | <http://localhost:4200> |
| API | <http://localhost:8000/api> |
| Documentación de la API | <http://localhost:8000/docs> (tras `php artisan scribe:generate`) |
| phpMyAdmin | <http://localhost:8881> (servidor `db`, usuario `root`, clave `1234`) |

Entra a la aplicación con un usuario de la tabla de [datos de prueba](#datos-de-prueba) (por ejemplo `admin@conexbase.com` y `123456`).

Comandos habituales:

```bash
docker compose up -d          # arrancar en segundo plano
docker compose logs -f app    # ver el log de la API
docker compose down           # apagar (conserva los datos)
docker compose down -v        # apagar y BORRAR la base de datos (se recrea con datos de prueba)
```

> Si ya tenías una base de datos de una versión anterior, no tendrá el rol **Confirmador**. Ejecuta `docker compose down -v` y vuelve a levantar para recrearla.

### Arranque sin Docker

1. Backend: copia `.env.example` a `.env`, ajusta `DB_HOST=127.0.0.1` y los datos de tu MySQL, y ejecuta:

   ```bash
   composer install
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve            # http://localhost:8000
   ```

2. Frontend, en otra terminal:

   ```bash
   cd client
   npm install
   npm start                    # http://localhost:4200  (proxy /api → localhost:8000)
   ```

## Configuración

### Backend (`.env`)

Se crea solo desde `.env.example` al levantar con Docker. Variables principales:

| Variable | Para qué sirve |
|---|---|
| `APP_KEY` | Clave de cifrado de Laravel (se genera sola) |
| `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Conexión a MySQL; coinciden con `docker-compose.yml` (`db`, `ConexBase`, `root`, `1234`) |
| `CORS_ALLOWED_ORIGINS` | Orígenes del frontend que pueden llamar a la API desde el navegador (por defecto `http://localhost:4200`) |
| `SESSION_DRIVER`, `CACHE_STORE` | `file`: la API no usa sesiones de navegador |

> Los valores son solo para desarrollo. Nunca subas el `.env` al repositorio.

### Frontend (`client/src/environments/`)

- `environment.development.ts`: `apiUrl: '/api'`. El servidor de desarrollo reenvía `/api` al backend mediante `client/proxy.conf.js` (en Docker apunta a `http://app:8000`).
- `environment.ts` (producción): `apiUrl: 'https://api.tu-dominio.com/api'`. Cámbiala por tu dominio real; en producción el frontend rechaza llamadas que no usen HTTPS.

### Otros archivos de ajustes

| Archivo | Qué configura |
|---|---|
| `docker-compose.yml` | Servicios `app` (API), `client` (Angular), `db` (MySQL) y `phpmyadmin` |
| `docker/entrypoint.sh` | Arranque de la API: `.env`, clave, migraciones, datos de prueba y servidor |
| `config/cors.php` | Orígenes permitidos (CORS) |
| `config/scribe.php` | Documentación automática de la API |
| `phpunit.xml` | Pruebas del backend con SQLite en memoria |

## Uso

### Autenticación

Todas las rutas, salvo el login, exigen el encabezado `Authorization: Bearer <token>`.

```bash
# 1) Iniciar sesión → devuelve el token (válido 8 horas) y el usuario con su rol
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"correo": "admin@conexbase.com", "password": "123456"}'

# 2) Usar el token
curl http://localhost:8000/api/pedidos -H "Accept: application/json" -H "Authorization: Bearer TU_TOKEN"
```

| Ruta | Descripción |
|---|---|
| `POST /api/auth/login` | Inicia sesión. Máximo 5 intentos por minuto por correo e IP |
| `GET /api/auth/me` | Datos del usuario del token |
| `POST /api/auth/logout` | Revoca el token |

Permisos por rol: cualquier usuario autenticado puede consultar `roles` y `usuarios`, pero solo el **Administrador** puede crearlos, modificarlos o eliminarlos. El resto de recursos están abiertos a todo usuario autenticado.

### Endpoints

Todos siguen el mismo formato (`GET` listar, `POST` crear, `GET /{id}` ver, `PUT/PATCH /{id}` actualizar, `DELETE /{id}` eliminar):

| Recurso | Ruta |
|---|---|
| Roles | `/api/roles` |
| Usuarios | `/api/usuarios` |
| Clientes | `/api/clientes` |
| Categorías | `/api/categorias` |
| Productos | `/api/productos` |
| Pedidos | `/api/pedidos` |
| Detalle de pedidos | `/api/detalle-pedidos` |
| Pagos | `/api/pagos` |
| Producciones | `/api/producciones` |
| Trabajos de tapiceros | `/api/trabajos-tapiceros` |
| Historial de pedidos | `/api/historial-pedidos` |

### Ejemplo: registrar un pago

```bash
curl -X POST http://localhost:8000/api/pagos \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "pedido_id": 1,
    "usuario_id": 2,
    "monto": 150000,
    "metodo": "Transferencia",
    "fecha_pago": "2026-10-21",
    "comprobante": "comp-001.jpg"
  }'
```

Respuesta correcta:

```json
{
  "success": "El pago se creó correctamente",
  "data": { "id": 2, "pedido_id": 1, "monto": "150000.00" }
}
```

### Errores

| Situación | Código | Ejemplo de respuesta |
|---|---|---|
| El registro no existe | 404 | `{"success": false, "message": "El pago no existe.", "error": "PAGO_NOT_FOUND", "status": 404}` |
| El ID no es válido | 422 | `{"success": false, "message": "El identificador del pago no es válido.", "error": "INVALID_ID", "status": 422}` |
| Faltan datos o son inválidos | 422 | Laravel devuelve el detalle por campo |
| Sin token, token vencido o credenciales incorrectas | 401 | `{"success": false, "message": "Debes iniciar sesión para continuar.", "error": "UNAUTHENTICATED", "status": 401}` |
| Rol sin permiso | 403 | `{"success": false, "message": "No tienes permisos para realizar esta acción.", "error": "FORBIDDEN", "status": 403}` |
| Demasiados intentos de login | 429 | `{"success": false, "error": "TOO_MANY_REQUESTS", "status": 429}` |

Envía siempre el encabezado `Accept: application/json` para recibir los errores de validación en JSON.

### Datos de prueba

El *seeder* crea 5 roles, 5 usuarios (uno por rol), 3 clientes, 3 categorías, 5 productos y varios pedidos, pagos, producciones y trabajos de tapicería.

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@conexbase.com` | `123456` |
| Vendedor | `vendedor@conexbase.com` | `123456` |
| Encargado de Producción | `produccion@conexbase.com` | `123456` |
| Tapicero | `tapicero@conexbase.com` | `123456` |
| Confirmador | `confirmador@conexbase.com` | `123456` |

Son solo para desarrollo; no los uses en producción. En la aplicación web, cada rol ve su propio menú: Administración (Panel General, Ventas…), Asesor Comercial (Mis Pedidos…), Confirmación, Fabricación y Tapicero.

### Comandos útiles

```bash
# Regenerar la documentación de la API (Scribe)
docker compose exec app php artisan scribe:generate

# Reiniciar la base de datos con los datos de prueba
docker compose exec app php artisan migrate:fresh --seed

# Ejecutar las pruebas
docker compose exec app php artisan test

# Pruebas del frontend
docker compose exec client npm test

# Ver los logs del contenedor
docker compose logs -f app

# Apagar todo
docker compose down
```

## Estructura del proyecto

```text
ConexBase/
├── app/                    # BACKEND (Laravel)
│   ├── Http/Controllers/   #   Reciben la petición y devuelven JSON
│   ├── Http/Middleware/    #   AutenticarConToken y RequiereRol
│   ├── Http/Requests/      #   Validaciones (Store y Update por entidad)
│   ├── Services/           #   Reglas de negocio
│   ├── Repositories/       #   Acceso a datos
│   ├── Interfaces/         #   Contratos de los repositorios
│   ├── Models/             #   Modelos Eloquent con borrado lógico
│   └── Exceptions/         #   Errores propios (404, 422, 401, 403)
├── config/  database/  routes/  bootstrap/  ...
├── docker/entrypoint.sh    # Arranque automático de la API en Docker
├── docker-compose.yml      # API + MySQL + phpMyAdmin + frontend
├── client/                 # FRONTEND (Angular)
│   └── src/app/
│       ├── components/     #   Piezas de interfaz reutilizables
│       ├── config/         #   Roles y menú por rol
│       ├── guards/         #   Protección de rutas
│       ├── interceptors/   #   Cabeceras, token y manejo de errores
│       ├── layouts/        #   Marco con menú lateral
│       ├── models/         #   Interfaces TypeScript de las 11 entidades
│       ├── pages/          #   Pantallas (login, dashboard, pedidos)
│       ├── services/       #   Conexión con la API
│       └── utils/          #   Funciones de apoyo
└── README.md
```

El recorrido de una petición en el backend es siempre el mismo:

```text
Ruta → Middleware (token y rol) → Controlador → Servicio → Repositorio → Modelo → Base de datos
```

## Cómo contribuir

1. Trabaja desde la rama `develop` y crea una rama propia: `feat/nombre-de-la-funcionalidad`.
2. Respeta el patrón por capas: no pongas lógica de negocio en el controlador ni consultas en el servicio.
3. Si agregas una entidad nueva, crea su modelo, migración, interfaz, repositorio, servicio, controlador, *requests* y registra el enlace en `AppServiceProvider`.
4. Usa nombres en español y en el mismo estilo del resto del proyecto.
5. Antes de subir, corre `php artisan test`, `npm test` (en `client/`) y, si cambiaste endpoints, `php artisan scribe:generate`.
6. Abre un *Pull Request* hacia `develop` con una descripción clara de qué cambió.

## Licencia

El `composer.json` declara licencia **MIT** (la del esqueleto de Laravel). El repositorio no incluye un archivo `LICENSE`; conviene agregarlo cuando el equipo defina cómo se compartirá el proyecto.

## Contacto o autores

Proyecto desarrollado por aprendices del **Tecnólogo en Análisis y Desarrollo de Software** (ficha 3177445), SENA — Centro de Diseño y Metrología, Bogotá.

- Duvan Felipe Sanchez Villamil
- David Sneyder Rodríguez Pulido
- Cristian Camilo Páez Guerrero
- Julian David Gómez Ladino

Para dudas, errores o sugerencias, abre un *issue* en <https://github.com/Julian-Gomez-L/ConexBase-back/issues> o escribe a cualquiera de los autores.

---

## Diccionario de Datos — Sistema de Pedidos y Producción (Laravel)

**Proyecto:** ConexBase
**Framework:** Laravel (migraciones Eloquent)
**Cantidad de entidades:** 11 version 1
**Fecha:** 22 de Agosto de 2026

> Las entidades están numeradas en el **orden de creación de migraciones** (padre → hija) para evitar errores de foreign key.

> **Nota:** este diccionario es la versión 1 y se conserva tal cual. Las migraciones actuales agregan además la columna `deleted_at` (borrado lógico) en todas las tablas, y las tablas reales se llaman `detalle_pedidos` y `trabajos_tapiceros`. Ante cualquier diferencia, mandan las migraciones de `database/migrations/`.

---

### Resumen (orden de creación)

| # | Entidad | Tabla | Depende de | Encargado |
|---|---------|-------|------------|-----------|
| 1 | Rol | `roles` | — | Dev 1 |
| 2 | Usuario | `usuarios` | `roles` | Dev 1 |
| 3 | Cliente | `clientes` | — | Dev 2 |
| 4 | Categoría | `categorias` | — | Dev 2 |
| 5 | Producto | `productos` | `categorias` | Dev 2 |
| 6 | Pedido | `pedidos` | `clientes`, `usuarios` | Dev 3 |
| 7 | Detalle de pedido | `detalle_pedido` | `pedidos`, `productos` | Dev 3 |
| 8 | Pago | `pagos` | `pedidos`, `usuarios` | Dev 3 |
| 9 | Producción | `producciones` | `pedidos`, `productos`, `usuarios` | Dev 4 |
| 10 | Trabajo de tapicero | `trabajos_tapicero` | `producciones`, `usuarios` | Dev 4 |
| 11 | Historial de pedido | `historial_pedidos` | `pedidos`, `usuarios` | Dev 4 |

---

### 1. Rol — `roles`

**Encargado:** Dev 1
**Descripción:** Define los roles que determinan las funciones y permisos que puede realizar un usuario dentro del sistema.
**Depende de:** ninguna

| Campo | Tipo Laravel | Tipo BD | Longitud | PK | FK | Único | Nulo | Descripción |
|-------|--------------|---------|----------|----|----|-------|------|-------------|
| id | bigIncrements | BIGINT | — | Sí | No | Sí | No | Identificador único del rol |
| nombre | string | VARCHAR | 50 | No | No | Sí | No | Nombre del rol |
| descripcion | text | TEXT | — | No | No | No | Sí | Descripción del rol |
| estado | boolean | TINYINT | 1 | No | No | No | No | Indica si el rol está activo |
| created_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de creación |
| updated_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de actualización |

**Relaciones:** Un rol tiene muchos usuarios (`hasMany`).

---

### 2. Usuario — `usuarios`

**Encargado:** Dev 1
**Descripción:** Almacena los usuarios que pueden ingresar y operar en el sistema, asociados a un rol.
**Depende de:** `roles`

| Campo | Tipo Laravel | Tipo BD | Longitud | PK | FK | Único | Nulo | Descripción |
|-------|--------------|---------|----------|----|----|-------|------|-------------|
| id | bigIncrements | BIGINT | — | Sí | No | Sí | No | Identificador único del usuario |
| documento | string | VARCHAR | 20 | No | No | Sí | No | Documento de identidad |
| nombre | string | VARCHAR | 100 | No | No | No | No | Nombre del usuario |
| apellido | string | VARCHAR | 100 | No | No | No | No | Apellido del usuario |
| correo | string | VARCHAR | 150 | No | No | Sí | No | Correo electrónico |
| password | string | VARCHAR | 255 | No | No | No | No | Contraseña cifrada |
| rol_id | foreignId | BIGINT | — | No | Sí | No | No | Rol asignado al usuario |
| estado | boolean | TINYINT | 1 | No | No | No | No | Indica si el usuario está activo |
| created_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de creación |
| updated_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de actualización |

**Relaciones:**
- Un usuario pertenece a un rol (`belongsTo`).
- Un usuario puede registrar muchos pedidos (`hasMany`).
- Un usuario puede registrar muchos pagos (`hasMany`).
- Un usuario puede estar encargado de muchas producciones (`hasMany`).
- Un usuario puede realizar muchos trabajos de tapicería (`hasMany`).
- Un usuario puede registrar muchos historiales de pedidos (`hasMany`).

---

### 3. Cliente — `clientes`

**Encargado:** Dev 2
**Descripción:** Almacena la información de los clientes que realizan pedidos a la empresa.
**Depende de:** ninguna

| Campo | Tipo Laravel | Tipo BD | Longitud | PK | FK | Único | Nulo | Descripción |
|-------|--------------|---------|----------|----|----|-------|------|-------------|
| id | bigIncrements | BIGINT | — | Sí | No | Sí | No | Identificador único del cliente |
| documento | string | VARCHAR | 20 | No | No | Sí | No | Documento de identidad del cliente |
| nombre | string | VARCHAR | 150 | No | No | No | No | Nombre completo del cliente |
| telefono | string | VARCHAR | 20 | No | No | No | No | Número telefónico |
| correo | string | VARCHAR | 150 | No | No | Sí | No | Correo electrónico |
| direccion | string | VARCHAR | 255 | No | No | No | Sí | Dirección del cliente |
| estado | boolean | TINYINT | 1 | No | No | No | No | Indica si el cliente está activo |
| created_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de creación |
| updated_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de actualización |

**Relaciones:** Un cliente tiene muchos pedidos (`hasMany`).

---

### 4. Categoría — `categorias`

**Encargado:** Dev 2
**Descripción:** Clasifica los productos disponibles en diferentes categorías para facilitar su organización y consulta.
**Depende de:** ninguna

| Campo | Tipo Laravel | Tipo BD | Longitud | PK | FK | Único | Nulo | Descripción |
|-------|--------------|---------|----------|----|----|-------|------|-------------|
| id | bigIncrements | BIGINT | — | Sí | No | Sí | No | Identificador único de la categoría |
| nombre | string | VARCHAR | 100 | No | No | Sí | No | Nombre de la categoría |
| descripcion | text | TEXT | — | No | No | No | Sí | Descripción de la categoría |
| estado | boolean | TINYINT | 1 | No | No | No | No | Indica si la categoría está activa |
| created_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de creación |
| updated_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de actualización |

**Relaciones:** Una categoría tiene muchos productos (`hasMany`).

---

### 5. Producto — `productos`

**Encargado:** Dev 2
**Descripción:** Contiene los productos que pueden ser incluidos en los pedidos de los clientes.
**Depende de:** `categorias`

| Campo | Tipo Laravel | Tipo BD | Longitud | PK | FK | Único | Nulo | Descripción |
|-------|--------------|---------|----------|----|----|-------|------|-------------|
| id | bigIncrements | BIGINT | — | Sí | No | Sí | No | Identificador único del producto |
| nombre | string | VARCHAR | 150 | No | No | No | No | Nombre del producto |
| descripcion | text | TEXT | — | No | No | No | Sí | Descripción del producto |
| precio | decimal | DECIMAL | 12,2 | No | No | No | No | Precio del producto |
| categoria_id | foreignId | BIGINT | — | No | Sí | No | No | Categoría a la que pertenece |
| estado | boolean | TINYINT | 1 | No | No | No | No | Indica si el producto está activo/disponible |
| created_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de creación |
| updated_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de actualización |

**Relaciones:**
- Un producto pertenece a una categoría (`belongsTo`).
- Un producto tiene muchos detalles de pedido (`hasMany`).
- Un producto tiene muchas producciones (`hasMany`).

---

### 6. Pedido — `pedidos`

**Encargado:** Dev 3
**Descripción:** Representa la solicitud de compra realizada por un cliente y gestionada por un usuario, desde su creación hasta su entrega.
**Depende de:** `clientes`, `usuarios`

| Campo | Tipo Laravel | Tipo BD | Longitud | PK | FK | Único | Nulo | Descripción |
|-------|--------------|---------|----------|----|----|-------|------|-------------|
| id | bigIncrements | BIGINT | — | Sí | No | Sí | No | Identificador único del pedido |
| cliente_id | foreignId | BIGINT | — | No | Sí | No | No | Cliente que realiza el pedido |
| usuario_id | foreignId | BIGINT | — | No | Sí | No | No | Usuario que registra el pedido |
| fecha | date | DATE | — | No | No | No | No | Fecha de creación del pedido |
| metodo_pago | string | VARCHAR | 50 | No | No | No | No | Método de pago seleccionado |
| estado | string | VARCHAR | 50 | No | No | No | No | Estado actual del pedido |
| total | decimal | DECIMAL | 12,2 | No | No | No | No | Valor total del pedido |
| created_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de creación del registro |
| updated_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de actualización |

**Relaciones:**
- Un pedido pertenece a un cliente (`belongsTo`).
- Un pedido pertenece al usuario que lo registró (`belongsTo`).
- Un pedido tiene muchos detalles de pedido (`hasMany`).
- Un pedido tiene muchos pagos (`hasMany`).
- Un pedido tiene muchas producciones (`hasMany`).
- Un pedido tiene muchos registros de historial (`hasMany`).

---

### 7. Detalle de pedido — `detalle_pedido`

**Encargado:** Dev 3
**Descripción:** Almacena los productos incluidos dentro de cada pedido, junto con sus cantidades y valores.
**Depende de:** `pedidos`, `productos`

| Campo | Tipo Laravel | Tipo BD | Longitud | PK | FK | Único | Nulo | Descripción |
|-------|--------------|---------|----------|----|----|-------|------|-------------|
| id | bigIncrements | BIGINT | — | Sí | No | Sí | No | Identificador único del detalle |
| pedido_id | foreignId | BIGINT | — | No | Sí | No | No | Pedido al que pertenece |
| producto_id | foreignId | BIGINT | — | No | Sí | No | No | Producto incluido |
| cantidad | unsignedInteger | INT UNSIGNED | — | No | No | No | No | Cantidad de unidades |
| precio_unitario | decimal | DECIMAL | 12,2 | No | No | No | No | Precio del producto al momento de la venta |
| subtotal | decimal | DECIMAL | 12,2 | No | No | No | No | Cantidad multiplicada por precio unitario |
| created_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de creación |
| updated_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de actualización |

**Relaciones:**
- Un detalle de pedido pertenece a un pedido (`belongsTo`).
- Un detalle de pedido pertenece a un producto (`belongsTo`).

---

### 8. Pago — `pagos`

**Encargado:** Dev 3
**Descripción:** Registra los pagos realizados por los clientes asociados a un pedido.
**Depende de:** `pedidos`, `usuarios`

| Campo | Tipo Laravel | Tipo BD | Longitud | PK | FK | Único | Nulo | Descripción |
|-------|--------------|---------|----------|----|----|-------|------|-------------|
| id | bigIncrements | BIGINT | — | Sí | No | Sí | No | Identificador único del pago |
| pedido_id | foreignId | BIGINT | — | No | Sí | No | No | Pedido asociado al pago |
| usuario_id | foreignId | BIGINT | — | No | Sí | No | No | Usuario que registra el pago |
| monto | decimal | DECIMAL | 12,2 | No | No | No | No | Valor del pago |
| metodo | string | VARCHAR | 50 | No | No | No | No | Método utilizado para realizar el pago |
| fecha_pago | date | DATE | — | No | No | No | No | Fecha en que se realizó el pago |
| comprobante | string | VARCHAR | 255 | No | No | No | Sí | Referencia o ruta del comprobante |
| created_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de creación |
| updated_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de actualización |

**Relaciones:**
- Un pago pertenece a un pedido (`belongsTo`).
- Un pago pertenece al usuario que registró el pago (`belongsTo`).

---

### 9. Producción — `producciones`

**Encargado:** Dev 4
**Descripción:** Representa el proceso de fabricación de los productos asociados a un pedido y permite asignar un usuario encargado de la producción.
**Depende de:** `pedidos`, `productos`, `usuarios`

| Campo | Tipo Laravel | Tipo BD | Longitud | PK | FK | Único | Nulo | Descripción |
|-------|--------------|---------|----------|----|----|-------|------|-------------|
| id | bigIncrements | BIGINT | — | Sí | No | Sí | No | Identificador único de la producción |
| pedido_id | foreignId | BIGINT | — | No | Sí | No | No | Pedido al que pertenece |
| producto_id | foreignId | BIGINT | — | No | Sí | No | No | Producto que se fabricará |
| usuario_id | foreignId | BIGINT | — | No | Sí | No | No | Usuario encargado de la producción |
| fecha_inicio | date | DATE | — | No | No | No | No | Fecha de inicio de producción |
| fecha_fin | date | DATE | — | No | No | No | Sí | Fecha de finalización |
| estado | string | VARCHAR | 50 | No | No | No | No | Estado actual de la producción |
| observaciones | text | TEXT | — | No | No | No | Sí | Observaciones del proceso |
| created_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de creación |
| updated_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de actualización |

**Relaciones:**
- Una producción pertenece a un pedido (`belongsTo`).
- Una producción pertenece a un producto (`belongsTo`).
- Una producción pertenece al usuario encargado (`belongsTo`).
- Una producción tiene muchos trabajos de tapicería (`hasMany`).

---

### 10. Trabajo de tapicero — `trabajos_tapicero`

**Encargado:** Dev 4
**Descripción:** Registra las actividades de tapicería realizadas sobre una producción y el usuario encargado de ejecutarlas.
**Depende de:** `producciones`, `usuarios`

| Campo | Tipo Laravel | Tipo BD | Longitud | PK | FK | Único | Nulo | Descripción |
|-------|--------------|---------|----------|----|----|-------|------|-------------|
| id | bigIncrements | BIGINT | — | Sí | No | Sí | No | Identificador único del trabajo |
| produccion_id | foreignId | BIGINT | — | No | Sí | No | No | Producción a la que pertenece |
| usuario_id | foreignId | BIGINT | — | No | Sí | No | No | Usuario/tapicero asignado |
| descripcion | text | TEXT | — | No | No | No | No | Descripción del trabajo |
| fecha_inicio | date | DATE | — | No | No | No | No | Fecha de inicio |
| fecha_fin | date | DATE | — | No | No | No | Sí | Fecha de finalización |
| estado | string | VARCHAR | 50 | No | No | No | No | Estado del trabajo |
| observaciones | text | TEXT | — | No | No | No | Sí | Observaciones del trabajo |
| created_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de creación |
| updated_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de actualización |

**Relaciones:**
- Un trabajo de tapicería pertenece a una producción (`belongsTo`).
- Un trabajo de tapicería pertenece al usuario/tapicero (`belongsTo`).

---

### 11. Historial de pedido — `historial_pedidos`

**Encargado:** Dev 4
**Descripción:** Registra los cambios de estado realizados sobre un pedido, indicando qué usuario realizó el cambio y cuándo ocurrió.
**Depende de:** `pedidos`, `usuarios`

| Campo | Tipo Laravel | Tipo BD | Longitud | PK | FK | Único | Nulo | Descripción |
|-------|--------------|---------|----------|----|----|-------|------|-------------|
| id | bigIncrements | BIGINT | — | Sí | No | Sí | No | Identificador único del historial |
| pedido_id | foreignId | BIGINT | — | No | Sí | No | No | Pedido cuyo estado cambió |
| usuario_id | foreignId | BIGINT | — | No | Sí | No | No | Usuario que realizó el cambio |
| estado_anterior | string | VARCHAR | 50 | No | No | No | Sí | Estado que tenía el pedido anteriormente |
| estado_nuevo | string | VARCHAR | 50 | No | No | No | No | Nuevo estado del pedido |
| observacion | text | TEXT | — | No | No | No | Sí | Motivo u observación del cambio |
| fecha | dateTime | DATETIME | — | No | No | No | No | Fecha y hora del cambio |
| created_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de creación |
| updated_at | timestamp | TIMESTAMP | — | No | No | No | Sí | Fecha de actualización |

**Relaciones:**
- Un registro del historial pertenece a un pedido (`belongsTo`).
- Un registro del historial pertenece al usuario que realizó el cambio (`belongsTo`).
