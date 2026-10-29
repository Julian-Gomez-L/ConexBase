# 3. Contexto y alcance

## Diagrama de contexto (C4 · nivel 1)

ConexBase visto desde afuera: una sola caja, con las personas que lo usan.

```mermaid
flowchart TB
    V(["👤 <b>Vendedor</b><br/>Asesor comercial"])
    C(["👤 <b>Confirmador</b>"])
    P(["👤 <b>Encargado de Producción</b>"])
    T(["👤 <b>Tapicero</b>"])
    A(["👤 <b>Administrador</b>"])

    S["<b>ConexBase</b><br/>Sistema web de pedidos<br/>y producción"]

    V -->|"Registra pedidos y abonos,<br/>consulta sus comisiones"| S
    C -->|"Confirma o rechaza<br/>pedidos nuevos"| S
    P -->|"Inicia la fabricación, asigna<br/>tapiceros y entrega"| S
    T -->|"Reporta el avance<br/>de sus trabajos"| S
    A -->|"Supervisa todo y<br/>gestiona usuarios"| S
```

No hay sistemas externos: ConexBase no se conecta con bancos, pasarelas de
pago, correo ni otros programas.

## Alcance

| Dentro del alcance | Fuera del alcance |
|---|---|
| Registro de clientes y pedidos con sus productos | Inventario de materiales |
| Abonos (pagos parciales) del cliente | Pasarela de pagos en línea |
| Confirmación o rechazo del pedido | Facturación electrónica |
| Producción por producto y trabajos de tapicería | Nómina general de la empresa |
| Historial de cambios de estado | Tienda en línea para clientes |
| Comisiones de los asesores | Otros negocios distintos a camas y muebles |
| Reportes del día y por periodo | Aplicación móvil nativa |

## Lo que reemplaza

| Antes | Ahora en ConexBase |
|---|---|
| Pedido enviado por WhatsApp | *Crear Pedido* |
| Confirmación por chat con el asesor | *Confirmación*, con motivo si se rechaza |
| Planilla de producción en Excel | *Fabricación* y *Mis Productos* |
| Cálculo de comisiones a mano | *Mis Comisiones* y *Comisiones de Asesores* |
| Resumen del día armado a mano | *Pedidos del Día* y *Consolidado* |
