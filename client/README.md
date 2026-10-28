# ConexBase — Frontend (Angular)

Aplicación web de ConexBase. Vive en `client/` dentro del proyecto único `ConexBase/` y consume la API Laravel de la raíz. El arranque completo (API + base de datos + web) se explica en el `README.md` de la raíz; aquí solo lo propio del frontend.

## Ejecución sin Docker

```bash
cd client
npm install
npm start          # http://localhost:4200   (necesita la API en http://localhost:8000)
npm test           # pruebas unitarias (Vitest)
npm run build      # compilación de producción en dist/
```

Requiere Node.js 22.12 o superior. En desarrollo, `proxy.conf.js` reenvía `/api` al backend (`API_PROXY_TARGET`, por defecto `http://localhost:8000`).

## Estructura

```text
src/app/
├── components/     # Piezas de interfaz reutilizables (stat-card, estado-badge, page-header…)
├── config/         # roles.ts (roles) y navigation.ts (menú por rol)
├── guards/         # authGuard, guestGuard, rolesPermitidos(), inicioPorRolGuard
├── interceptors/   # api-headers (JSON + HTTPS), auth (Bearer), error (AppError)
├── layouts/        # main-layout: menú lateral + encabezado
├── models/         # Interfaces de las 11 entidades, auth y modelo de vista del pedido
├── pages/          # login, dashboard (Panel General), pedidos
├── services/       # crud.service (genérico), api/*.service (11 entidades), auth, pedidos-facade
├── utils/          # format.ts (moneda COP, conversiones)
├── testing/        # Datos de ejemplo para pruebas
├── app.config.ts   # HttpClient, interceptores y router
└── app.routes.ts   # Rutas lazy y roles permitidos
```

Alias de importación: `@app/*` → `src/app/*` y `@env/*` → `src/environments/*`.

## Roles

| Rol en la app | Nombre en la tabla `roles` | Pantalla de inicio |
|---|---|---|
| Administración | Administrador | `/dashboard` |
| Asesor Comercial | Vendedor | `/dashboard/crear-pedido` |
| Confirmación | Confirmador | `/dashboard/confirmacion` |
| Fabricación | Encargado de Producción | `/dashboard/fabricacion` |
| Tapicero | Tapicero | `/dashboard/tapicero` |

## Cómo agregar una pantalla

1. Crea `src/app/pages/<nombre>/<nombre>.component.ts` (standalone, `OnPush`).
2. Usa el servicio de `services/api/` que necesites (`listar`, `obtener`, `crear`, `actualizar`, `eliminar`).
3. Registra la ruta en `app.routes.ts` con `loadComponent` y `canMatch: [rolesPermitidos(...)]`.
4. Si debe aparecer en el menú, agrégala en `config/navigation.ts`.

## Producción

Cambia `apiUrl` en `src/environments/environment.ts` por tu dominio HTTPS. En producción el interceptor rechaza llamadas a la API que no usen HTTPS.
