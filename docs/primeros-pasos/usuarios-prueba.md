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

## Recorrido sugerido

Para probar el sistema completo, sigue un pedido de principio a fin
cambiando de usuario:

1. **Vendedor** (`vendedor@conexbase.com`): en *Crear Pedido* registra un pedido con un cliente nuevo, la localidad de entrega, uno o dos productos (diseño, descripción, tipo y color de tela, cantidad y valor) y un abono.
2. **Confirmador**: en *Confirmación* confírmalo. Crea otro y recházalo con un motivo.
3. **Producción**: en *Fabricación* inicia la producción y asigna el producto al tapicero.
4. **Tapicero**: en *Mis Productos* empieza el trabajo y termínalo.
5. **Producción**: marca la producción como *Finalizada*, y luego el pedido como *Finalizado*.
6. **Administrador**: en *Pedidos del Día* → *Entregas*, marca el pedido como *Entregado*. Desde ese momento el asesor ve la comisión en *Mis Comisiones* y en *Comisiones de Asesores*.
7. **Vendedor**: en *Mis Comisiones* aparece la comisión de ese pedido.
8. **Administrador**: revisa *Pedidos del Día* y *Consolidado*. En *Usuarios y Roles* comprueba que solo puede mirar.
9. **Super Administrador**: en *Usuarios y Roles → Seguridad* genera el código de recuperación.

## Volver a empezar

```bash
docker compose exec app php artisan migrate:fresh --seed
```

Esto **borra todo** (pedidos, clientes, productos…) y deja solo los roles y
los usuarios de esta página.
