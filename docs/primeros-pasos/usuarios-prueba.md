# Usuarios de prueba

El *seeder* (`database/seeders/DatabaseSeeder.php`) llena la base de datos
con información de ejemplo para que cada rol tenga algo que probar.

!!! danger "Solo para desarrollo"
    Estas contraseñas son públicas. Nunca uses estos datos en un servidor real.

## Usuarios

Todos tienen la contraseña **`123456`**.

| Rol | Nombre | Correo |
|---|---|---|
| Administrador | Carlos Rodriguez | `admin@conexbase.com` |
| Vendedor | Juan Perez | `vendedor@conexbase.com` |
| Vendedor | Valentina Suarez | `vendedor2@conexbase.com` |
| Confirmador | Sofia Castro | `confirmador@conexbase.com` |
| Encargado de Producción | Andres Gomez | `produccion@conexbase.com` |
| Tapicero | Miguel Martinez | `tapicero@conexbase.com` |

## Pedidos

Hay un pedido en cada estado. El total de cada uno se calcula con los precios
de sus productos, y el historial recorre los estados por los que pasó.

| Pedido | Asesor | Estado | Total | Pagado | Sirve para probar |
|---|---|---|---|---|---|
| RM-00001 | Juan | Pendiente | $2.000.000 | $1.000.000 | Confirmación |
| RM-00002 | Juan | En producción | $1.300.000 | $650.000 | Fabricación y Tapicero |
| RM-00003 | Juan | Entregado | $1.550.000 | $1.550.000 | Ciclo completo y comisiones |
| RM-00004 | Valentina | Confirmado | $1.800.000 | $900.000 | Iniciar producción |
| RM-00005 | Valentina | Cancelado | $1.100.000 | $0 | Filtros y estados finales |
| RM-00006 | Juan | Rechazado | $900.000 | $0 | Ver el motivo del rechazo |
| RM-00007 | Valentina | Pendiente | $1.500.000 | $500.000 | Confirmación |

Como hay dos vendedores, en *Mis Pedidos* Juan ve 4 pedidos y Valentina 3.

También se crean 5 clientes, 3 categorías (Sala, Sillas, Mesas) y 5 productos.

## Recorrido sugerido

Para ver el sistema completo en unos minutos, sigue un pedido de principio a
fin cambiando de usuario:

1. **Vendedor** (`vendedor@conexbase.com`): en *Crear Pedido* registra un pedido con un abono.
2. **Confirmador**: en *Confirmación* confírmalo. También puedes rechazar otro con un motivo.
3. **Producción**: en *Fabricación* inícialo y asigna el producto al tapicero.
4. **Tapicero**: en *Mis Productos* empieza el trabajo y termínalo.
5. **Producción**: marca la producción como *Finalizada*, luego el pedido como *Finalizado* y por último *Entregado*.
6. **Vendedor**: en *Mis Comisiones* aparece la comisión de ese pedido.

## Volver a los datos originales

```bash
docker compose exec app php artisan migrate:fresh --seed
```

Esto borra **todo** lo que hayas creado y vuelve a cargar los datos de prueba.
