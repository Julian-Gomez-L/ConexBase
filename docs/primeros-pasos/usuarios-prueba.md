# Usuarios de prueba

El *seeder* (`database/seeders/DatabaseSeeder.php`) crea **solo los roles y
los usuarios**. No crea clientes, productos ni pedidos: así las pruebas se
hacen con datos reales, ingresados desde la aplicación.

!!! danger "Cambia las contraseñas si vas a usar datos reales"
    La contraseña `123456` es pública: está en el repositorio y en esta
    documentación. Si vas a trabajar con información real de la empresa,
    cambia la contraseña de cada usuario en *Usuarios y Roles* apenas entres,
    y genera el [código de recuperación](../administracion/recuperar-acceso.md).

## Roles

Super Administrador, Administrador, Vendedor, Confirmador, Encargado de
Producción y Tapicero.

El **Administrador** hace todo lo del Super Administrador, salvo que en
*Usuarios y Roles* solo puede mirar y no ve el código de recuperación
([ADR-0008](../decisiones/0008-super-administrador.md)).

## Usuarios

Todos tienen la contraseña **`123456`**.

| Rol | Nombre | Correo |
|---|---|---|
| Super Administrador | Diana Moreno | `superadmin@conexbase.com` |
| Administrador | Carlos Rodriguez | `admin@conexbase.com` |
| Vendedor | Juan Perez | `vendedor@conexbase.com` |
| Vendedor | Valentina Suarez | `vendedor2@conexbase.com` |
| Confirmador | Sofia Castro | `confirmador@conexbase.com` |
| Encargado de Producción | Andres Gomez | `produccion@conexbase.com` |
| Tapicero | Miguel Martinez | `tapicero@conexbase.com` |

Hay dos vendedores para comprobar que en *Mis Pedidos* cada uno ve solo los
suyos.

## Antes del primer pedido: categorías y productos

*Crear Pedido* necesita productos. Créalos como **Administrador** en
**Catálogo**:

1. Pestaña **Categorías**: crea las categorías, por ejemplo *Camas*, *Bases* o *Colchones*.
2. Pestaña **Productos**: crea cada producto con su **medida** y su **precio**.
   Cada medida es un producto aparte con su propio precio. Para crear el
   mismo producto en otra medida, usa el botón **+** de la tabla.

## Recorrido sugerido

Para probar el sistema completo, sigue un pedido de principio a fin
cambiando de usuario:

1. **Administrador**: en *Catálogo* crea una categoría y un par de productos con su medida y precio.
2. **Vendedor** (`vendedor@conexbase.com`): en *Crear Pedido* registra un pedido con un cliente nuevo y un abono.
3. **Confirmador**: en *Confirmación* confírmalo. Crea otro y recházalo con un motivo.
4. **Producción**: en *Fabricación* inicia la producción y asigna el producto al tapicero.
5. **Tapicero**: en *Mis Productos* empieza el trabajo y termínalo.
6. **Producción**: marca la producción como *Finalizada*, luego el pedido como *Finalizado* y por último *Entregado*.
7. **Vendedor**: en *Mis Comisiones* aparece la comisión de ese pedido.
8. **Administrador**: revisa *Pedidos del Día* y *Consolidado*. En *Usuarios y Roles* comprueba que solo puede mirar.
9. **Super Administrador**: en *Usuarios y Roles → Seguridad* genera el código de recuperación.

## Volver a empezar

```bash
docker compose exec app php artisan migrate:fresh --seed
```

Esto **borra todo** (pedidos, clientes, productos…) y deja solo los roles y
los usuarios de esta página.
