# 12. Glosario

## Términos del negocio

Abono
:   Pago parcial que hace el cliente sobre el total del pedido. Se guarda en la tabla `pagos`.

Asesor comercial
:   Vendedor. Registra los pedidos y gana comisión por ellos. En la base de datos su rol se llama *Vendedor*.

Comisión
:   Lo que gana el asesor por cada pedido **entregado**: hoy el 5 % del total.

Comisión por ganar
:   Comisión de un pedido que ya fue confirmado pero aún no se ha entregado.

Comprobante
:   Referencia del soporte de un pago (número de transferencia, recibo). Hoy es solo un texto.

Confirmación
:   Revisión que hace el Confirmador de un pedido nuevo (datos del cliente, productos, abono) antes de que pase a fabricación.

Consolidado
:   Reporte de un periodo: valor vendido, recaudado, saldo, pedidos por estado, ventas por asesor y productos más vendidos.

Destajo
:   Forma de pago a los tapiceros por cada trabajo terminado, no por horas. Aún no está en el sistema.

Esqueletería
:   Fabricación de la estructura de madera de las camas y muebles, antes de tapizarlos.

Pedido
:   Venta a un cliente, con uno o varios productos. Su código se muestra como `RM-00001`.

Producción
:   Fabricación de **un producto** de un pedido. Un pedido con tres productos distintos tiene tres producciones.

Saldo
:   Lo que falta por pagar de un pedido: total menos la suma de los abonos.

Tapicería
:   Forrado de la estructura con espuma y tela. Lo hace el tapicero.

Trabajo de tapicería
:   Tarea asignada a un tapicero sobre una producción. Tabla `trabajos_tapiceros`.

## Términos técnicos

ADR
:   *Architecture Decision Record*. Ficha corta que explica por qué se tomó una decisión. Ver [Decisiones](../decisiones/index.md).

API REST
:   Programa que recibe peticiones HTTP (`GET`, `POST`, `PUT`, `DELETE`) y responde con datos en JSON. En ConexBase es el backend Laravel.

Borrado lógico
:   Marcar un registro como eliminado (columna `deleted_at`) en lugar de borrarlo de la base de datos. En Laravel se llama *SoftDeletes*.

CRUD
:   Las cuatro operaciones básicas: crear (*Create*), leer (*Read*), actualizar (*Update*) y eliminar (*Delete*).

Eloquent
:   La herramienta de Laravel para trabajar con la base de datos usando clases (modelos) en lugar de escribir SQL.

Form Request
:   Clase de Laravel que valida los datos de una petición antes de que lleguen al controlador.

Función pura
:   Función que con los mismos datos de entrada siempre devuelve el mismo resultado y no hace nada más (no llama a la API ni cambia nada). Son las más fáciles de probar.

Guard
:   En Angular, función que decide si un usuario puede entrar a una ruta.

Interceptor
:   En Angular, función que se ejecuta en **todas** las peticiones HTTP; por ejemplo, para agregar el token.

Middleware
:   En Laravel, código que se ejecuta antes del controlador; por ejemplo, para revisar el token o el rol.

Migración
:   Archivo de Laravel que crea o modifica una tabla. Permite que todos tengan la misma estructura de base de datos.

Seeder
:   Archivo de Laravel que llena la base de datos con datos de prueba.

Signal
:   En Angular, una variable que avisa automáticamente a la pantalla cuando cambia su valor.

Token Bearer
:   Texto secreto que recibe el usuario al iniciar sesión y que envía en cada petición (`Authorization: Bearer <token>`) para demostrar quién es.
