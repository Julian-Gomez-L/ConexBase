# ¿Qué hacer si nadie puede entrar como administrador?

Puede pasar que **ya no quede ningún administrador** que pueda entrar a
ConexBase: alguien los desactivó por error, se perdió la contraseña del
único administrador, o alguien con malas intenciones los bloqueó.

Para eso existe el **código de recuperación**. Con él, el dueño de la
empresa vuelve a tener un administrador **sin llamar a un desarrollador**.

!!! warning "El código funciona como la llave de emergencia de la empresa"
    Quien lo tenga puede crear un administrador si no queda ninguno.
    Guárdalo bajo llave y no se lo envíes a nadie.

## 1. Antes de cualquier problema: guardar el código

Hazlo una vez, el día que empiecen a usar el sistema.

1. Entra con tu usuario de **Administrador**.
2. En el menú, abre **Usuarios y Roles** y luego la pestaña **Seguridad**.
   Si la pestaña tiene un **punto amarillo**, todavía no hay un código.
3. Oprime **Generar código de recuperación**.
4. Aparece un código como este:

    ```text
    K7QM-2XRP-9TWD-H4NB-6CVJ
    ```

5. **Escríbelo o imprímelo** y guárdalo en un lugar seguro, por ejemplo la
   caja fuerte de la empresa. El sistema **no lo vuelve a mostrar**.
6. Oprime **Ya lo guardé, ocultarlo**.

**No lo guardes** en WhatsApp, en el correo ni en una foto del celular: si
alguien entra a esas cuentas, tendría la llave.

### Si pierdes el papel

Entra como administrador y genera un código nuevo. El anterior deja de
servir en ese momento.

## 2. Si nadie puede entrar como administrador

1. Abre ConexBase en el navegador. En la pantalla de inicio de sesión,
   debajo del botón, oprime **Recuperar acceso de administrador**.
2. Escribe el **código de recuperación** tal como está en el papel. No
   importa si lo escribes en minúsculas o sin guiones.
3. Escribe los datos del nuevo administrador: nombre, apellido, documento,
   correo y una contraseña nueva de al menos 8 caracteres, dos veces.
    - Si escribes el **correo de una persona que ya tenía usuario** (por
      ejemplo, el tuyo), ese usuario se reactiva como administrador con la
      contraseña nueva. Sus datos y su historial se conservan.
    - Si el correo es nuevo, se crea un usuario nuevo.
4. Oprime **Recuperar acceso**.
5. Si todo sale bien, verás **"Listo. Ya puedes iniciar sesión"**. Entra
   con el correo y la contraseña nueva.
6. **Muy importante:** el código que usaste **ya no sirve**. Ve a
   **Usuarios y Roles → Seguridad**, genera uno nuevo y guárdalo como en el
   paso 1.
7. Revisa en **Usuarios y Roles** quién tiene cada rol, y desactiva a quien
   no debería tener acceso.

## Mensajes que puedes ver

| Mensaje | Qué significa | Qué hacer |
|---|---|---|
| *La recuperación no está disponible: todavía hay un administrador activo* | Hay al menos un administrador que puede entrar. Por seguridad, el código solo funciona cuando no queda ninguno. | Pídele a ese administrador que te dé acceso desde *Usuarios y Roles*. |
| *El código de recuperación no es válido* | El código está mal escrito o es uno viejo. | Revisa el papel letra por letra. El código no tiene la letra O ni el número 0, ni la I, la L o el 1. |
| *No hay un código de recuperación configurado* | Nunca se generó un código, o ya se usó. | Hay que pedir ayuda al equipo de desarrollo (ver abajo). |
| *Demasiados intentos. Espera 60 minutos…* | Se permiten 3 intentos por hora, para que nadie pueda adivinar el código. | Espera y vuelve a intentarlo con calma. |

## Revisar quién intentó entrar

En **Usuarios y Roles → Seguridad**, debajo del código, está la tabla
**Inicios de sesión fallidos**. Muestra cada vez que alguien no pudo entrar:

- **fecha y hora**,
- **quién**: el correo que escribió, y el nombre y el rol si ese correo es de alguien,
- **por qué falló**: contraseña incorrecta, el correo no existe, usuario inactivo o código de recuperación inválido,
- **desde dónde**: la dirección IP y el navegador.

Fíjate sobre todo en:

- **Muchos intentos seguidos** con el mismo correo: alguien está probando contraseñas.
- **Correos que no existen**: alguien está probando correos al azar.
- **Códigos de recuperación inválidos**: alguien intentó usar la llave de emergencia.

Si ves algo así, cambia la contraseña de ese usuario y avisa al equipo.

## Lo que el código de recuperación **no** resuelve

El código devuelve el **acceso**, pero no recupera **información borrada**
(pedidos, clientes, pagos). Para eso se necesitan **copias de seguridad** de
la base de datos. Pídele al equipo de desarrollo que las configure.

## Si no hay código y nadie puede entrar

Un desarrollador puede crear un administrador desde el servidor. Debe:

1. Guardar el código nuevo, como en el paso 1 de esta guía.
2. Revisar los intentos fallidos para entender qué pasó.

Detalles técnicos para el desarrollador: [ADR-0007](../decisiones/0007-codigo-recuperacion-admin.md)
y [API REST](../api/index.md#recuperacion-de-administrador).
