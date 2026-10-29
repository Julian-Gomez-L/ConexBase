# 1. Introducción y objetivos

## El problema

*Basecamas y Colchones El Dormilón* (Fontibón, Bogotá) fabrica y vende
camas, colchones, cabeceros y muebles. Antes de ConexBase manejaba los
pedidos, la producción y los pagos por **WhatsApp y Excel**, lo que causaba:

- Errores de transcripción y datos duplicados o perdidos.
- No se sabía en qué etapa estaba cada pedido.
- Mala comunicación entre ventas, confirmación, producción y administración.
- Cálculo manual de las comisiones de los asesores y del pago por destajo a los tapiceros.

## La solución

ConexBase centraliza la información en una sola base de datos y sigue el
recorrido completo del pedido:

**Venta → Confirmación → Producción → Tapicería → Entrega**

Cada cambio de estado queda registrado con quién lo hizo, cuándo y por qué.

## Requisitos principales

Los requisitos funcionales (RF) vienen de la fase de análisis del proyecto.

| Módulo | Requisitos | Estado |
|---|---|---|
| Usuarios | Registrar usuario (RF001), iniciar sesión (RF002), gestionar usuarios (RF003), asignar rol (RF005) | ✅ Hecho |
| Usuarios | Recuperar contraseña (RF004) | ⏳ Pendiente |
| Ventas | Registrar pedido (RF006), confirmarlo (RF008), historial (RF009), revisar rechazados (RF011) | ✅ Hecho |
| Ventas | Editar pedido pendiente (RF007), cancelarlo (RF010) | ⏳ Pendiente |
| Producción | Recibir confirmados (RF012), iniciar (RF013), registrar avance (RF014), finalizar (RF015), ver estado (RF016) | ✅ Hecho |
| Comisiones | Calcular comisión por venta (RF017) | ✅ Hecho (5 %) |
| Comisiones | Pagar comisiones (RF018), historial de pagos de comisiones (RF019) | ⏳ Pendiente |
| Finanzas | Registrar ingresos (RF020) | ⏳ Pendiente |
| Tapicería | Liquidación por destajo | ⏳ Pendiente (sin requisitos detallados) |

## Objetivos de calidad

Son las tres cualidades más importantes para el proyecto, en orden. Cuando
dos se contradicen, gana la de arriba.

| # | Objetivo | Por qué | Cómo se logra |
|---|---|---|---|
| 1 | **Facilidad de uso** | El personal de la empresa tiene poca experiencia digital. | Cada rol ve solo sus pantallas; mensajes en español; acciones con un clic. |
| 2 | **Trazabilidad** | Saber siempre en qué va un pedido y quién lo movió. | Tabla `historial_pedidos`; borrado lógico, nada se pierde. |
| 3 | **Mantenibilidad** | Lo mantiene un equipo de aprendices que cambia con el tiempo. | Capas con una sola responsabilidad; código en español; esta documentación. |

La **seguridad** también importa: solo entra quien tiene usuario activo, y
cada rol solo puede hacer lo que le corresponde (ver
[Conceptos transversales](08-conceptos.md#autenticacion)).

## Partes interesadas

| Quién | Qué espera del sistema |
|---|---|
| Gerencia de la empresa | Ver el estado del negocio y pagar comisiones sin cálculos a mano. |
| Asesores comerciales | Registrar pedidos rápido y saber cuánto van a ganar. |
| Confirmadores | Revisar los pedidos nuevos en un solo lugar. |
| Producción y tapiceros | Saber qué fabricar, quién lo hace y reportar el avance. |
| Equipo de desarrollo (4 aprendices SENA) | Un código fácil de entender y cambiar. |
| SENA, Centro de Diseño y Metrología | Un proyecto académico bien documentado. |
