# 6. Vista de ejecución

Cómo colaboran las partes del sistema en los procesos reales, paso a paso.
Los diagramas de secuencia se leen **de arriba hacia abajo**: cada flecha es
un mensaje entre dos participantes.

## Ciclo de vida del pedido

```mermaid
stateDiagram-v2
    [*] --> Pendiente: Vendedor crea el pedido
    Pendiente --> Confirmado: Confirmador lo aprueba
    Pendiente --> Rechazado: Confirmador lo rechaza (con motivo)
    Confirmado --> EnProduccion: Producción inicia la fabricación
    EnProduccion --> Finalizado: Producción, con todas las producciones terminadas
    Finalizado --> Entregado: Producción lo entrega
    Pendiente --> Cancelado
    Entregado --> [*]
    Rechazado --> [*]
    Cancelado --> [*]

    state "En producción" as EnProduccion
```

| Estado | Quién lo pone | Pantalla |
|---|---|---|
| Pendiente | Vendedor (al crear) | Crear Pedido |
| Confirmado / Rechazado | Confirmador o Administrador | Confirmación |
| En producción | Producción o Administrador | Fabricación → *Iniciar producción* |
| Finalizado | Producción o Administrador | Fabricación → *Marcar finalizado* (solo si todas sus producciones están terminadas) |
| Entregado | Producción o Administrador | Fabricación → *Marcar entregado* |
| Cancelado | Hoy solo existe en los datos de prueba; no hay botón para cancelar | — |

**Cada cambio de estado** crea una fila en `historial_pedidos` con el estado
anterior, el nuevo, quién lo hizo, cuándo y la observación (en un rechazo,
la observación es el motivo). De ahí salen *Pedidos del Día*, las fechas de
entrega de las comisiones y el motivo que ve el vendedor.

## Iniciar sesión y hacer una petición

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant FE as Angular
    participant API as Laravel
    participant DB as MySQL

    U->>FE: correo y contraseña
    FE->>API: POST /api/auth/login
    API->>DB: busca el usuario por correo
    API->>API: compara la contraseña (bcrypt)
    API->>DB: guarda el hash sha256 de un token nuevo (vence en 8 h)
    API-->>FE: token en claro + usuario con su rol
    FE->>FE: guarda la sesión en sessionStorage<br/>y abre el inicio de su rol

    Note over FE,API: Desde aquí, cada petición lleva el token
    FE->>API: GET /api/pedidos<br/>Authorization: Bearer <token>
    API->>API: AutenticarConToken: ¿token vigente y usuario activo?
    API->>API: RequiereRol: ¿su rol puede usar esta ruta? (solo en rutas de escritura)
    API-->>FE: { success: true, message, data }
```

Si el token vence o es inválido, la API responde **401**: el
`errorInterceptor` cierra la sesión y lleva al usuario al login.

## Crear un pedido (Vendedor)

`CrearPedidoService` arma el pedido completo usando los CRUD de la API, en
este orden:

```mermaid
sequenceDiagram
    autonumber
    actor V as Vendedor
    participant P as Pantalla Crear Pedido
    participant S as CrearPedidoService
    participant API as API Laravel

    V->>P: cliente, productos y abono
    P->>S: crear(datos)
    opt El cliente es nuevo
        S->>API: POST /clientes
    end
    S->>API: POST /pedidos (estado Pendiente, a nombre del vendedor de la sesión)
    par Al mismo tiempo
        S->>API: POST /detalle-pedidos (uno por producto)
    and
        S->>API: POST /pagos (si hay abono)
    end
    S->>API: POST /historial-pedidos (∅ → Pendiente, "Pedido creado")
    S-->>P: pedido creado
```

El total lo calcula el frontend con el precio de cada producto
(`CrearPedidoService.total()`).

!!! warning "Sin transacción"
    Son varias peticiones independientes. Si una falla a mitad de camino,
    las anteriores ya quedaron guardadas. Ver
    [Riesgos y deuda técnica](11-riesgos.md).

## Confirmar o rechazar (Confirmador)

Las dos acciones usan `CambioEstadoService.cambiar()`, que siempre hace dos
pasos:

```mermaid
sequenceDiagram
    autonumber
    actor C as Confirmador
    participant P as Pantalla Confirmación
    participant S as CambioEstadoService
    participant API as API Laravel

    alt Confirmar
        C->>P: clic en Confirmar
        P->>S: cambiar(pedido, "Confirmado", "Pedido confirmado")
    else Rechazar
        C->>P: escribe el motivo y clic en Rechazar
        P->>S: cambiar(pedido, "Rechazado", motivo)
    end
    S->>API: PUT /pedidos/{id} { estado }
    S->>API: POST /historial-pedidos { anterior, nuevo, observación, fecha }
    S-->>P: listo
```

El vendedor ve el motivo del rechazo en *Mis Pedidos*: se lee de la última
entrada del historial con estado *Rechazado*.

## Fabricación (Producción y Tapicero)

```mermaid
sequenceDiagram
    autonumber
    actor P as Producción
    actor T as Tapicero
    participant API as API Laravel

    Note over P: Pedido Confirmado
    P->>API: POST /producciones (una por producto, estado Pendiente)
    P->>API: cambiar estado → En producción (+ historial)

    P->>API: POST /trabajos-tapiceros (asigna un tapicero a una producción)
    T->>API: PUT /trabajos-tapiceros/{id} estado En proceso
    T->>API: PUT /trabajos-tapiceros/{id} estado Finalizado (+ observaciones)

    P->>API: PUT /producciones/{id} estado Finalizada
    Note over P: Cuando TODAS las producciones están Finalizadas
    P->>API: cambiar estado → Finalizado (+ historial)
    P->>API: cambiar estado → Entregado (+ historial)
```

Hay tres niveles de estado distintos, cada uno en su tabla:

| Tabla | Estados | Quién los cambia |
|---|---|---|
| `pedidos` | Pendiente, Confirmado, En producción, Finalizado, Entregado, Rechazado, Cancelado | Confirmador y Producción |
| `producciones` (una por producto del pedido) | Pendiente, En proceso, Finalizada | Producción |
| `trabajos_tapiceros` (uno por tapicero asignado) | Pendiente, En proceso, Finalizado | Tapicero |

## Comisiones

No hay una tabla de comisiones: se **calculan** cada vez que se abre la
pantalla, con la función pura `calcularComisiones()` de
`client/src/app/models/comision.model.ts`.

| Situación del pedido | Comisión |
|---|---|
| **Entregado** | **Ganada**: 5 % del total. Cuenta en el mes de la entrega (fecha tomada del historial). |
| Confirmado, En producción o Finalizado | **Por ganar**: se muestra, pero aún no se suma a lo ganado. |
| Pendiente, Rechazado o Cancelado | No genera comisión. |

El porcentaje y los estados están en `client/src/app/config/comisiones.ts`.

## Cargar una pantalla con datos de varias tablas

La API devuelve cada tabla por separado (un pedido trae `cliente_id`, no el
cliente). Por eso `PedidosFacadeService` pide **7 recursos en paralelo** y
los une en el frontend:

```mermaid
sequenceDiagram
    participant P as Pantalla
    participant F as PedidosFacadeService
    participant API as API Laravel

    P->>F: listarVista()
    par 7 peticiones al mismo tiempo (forkJoin)
        F->>API: GET /pedidos
        F->>API: GET /clientes
        F->>API: GET /usuarios
        F->>API: GET /detalle-pedidos
        F->>API: GET /productos
        F->>API: GET /pagos
        F->>API: GET /historial-pedidos
    end
    F->>F: construirVistas(): une todo en PedidoVista
    F-->>P: lista con cliente, asesor, productos, pagado, saldo y rechazo
```
