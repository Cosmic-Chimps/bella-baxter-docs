# Gestionar aplicaciones conectadas

> 🌐 **English version**: [Manage connected apps](/features/connected-apps-manage)

Una aplicación conectada es una aplicación de terceros a la que dejas leer los secretos de un entorno. Esta página es para dos lectores: una persona a la que una aplicación pidió conectarse, y un propietario o administrador de una organización. Si construyes aplicaciones, lee [Conectar con Bella Baxter](/es/features/connected-apps).

## Qué puede y qué no puede hacer una aplicación conectada

- **Puede leer.** Puede leer los valores de los secretos del único entorno que elijas.
- **No puede cambiar nada.** No puede crear, cambiar ni eliminar un secreto.
- **Ve un solo entorno.** Puedes acotarlo aún más a una etiqueta de ámbito. Una etiqueta de ámbito es una etiqueta que lleva un secreto. Con una etiqueta de ámbito, la aplicación ve solo los secretos que llevan esa etiqueta.
- **Nunca recibe una API key.** Lee a través de una conexión que puedes revocar en cualquier momento.

## Aprobar o rechazar una conexión

Una aplicación inicia una conexión enviándote a una página de Bella con el título **Conectar con Bella Baxter**. Tienes que haber iniciado sesión en Bella. No se comparte nada hasta que eliges **Permitir**.

### Comprueba la aplicación antes de permitirla

La página muestra tres datos de la aplicación:

- **El nombre de la aplicación.**
- **El dominio al que pertenece.** Bella comprobó que quien desarrolla la aplicación controla este dominio.
- **La organización que registró la aplicación.**

Lee el dominio, no solo el nombre. Un nombre es solo texto que eligió el desarrollador. El dominio es lo que Bella verificó. Si el dominio no es el que esperas, elige **Rechazar**.

### Elige qué compartir

1. **Organización.** Elige la organización. Solo ves las organizaciones a las que perteneces.
2. **Proyecto.** Elige el proyecto.
3. **Entorno.** Elige el entorno. Solo aparecen los entornos que puedes leer.
4. **Etiqueta de alcance (opcional).** Escribe una etiqueta para limitar la aplicación a los secretos que la llevan. Déjala vacía para compartir todos los secretos del entorno. Usa solo letras minúsculas, dígitos, guiones y guiones bajos.
5. **El acceso dura.** Elige cuánto tiempo puede leer la aplicación. Después de ese tiempo la aplicación ya no puede leer. Aun así puedes revocarlo antes. Las opciones son:
   - **Hasta que lo revoque**
   - **30 días**
   - **90 días**
   - **1 año**
6. Elige **Permitir** para conectar la aplicación, o **Rechazar** para negarla.

Si eliges **Rechazar**, o cierras la página, no se comparte nada. Después Bella devuelve tu navegador a la aplicación.

### Cuando una organización aparece atenuada

Una organización puede aparecer atenuada, con un motivo. No puedes elegirla. Los motivos son:

- **Las aplicaciones conectadas están desactivadas.** Un propietario o administrador desactivó las aplicaciones conectadas en esa organización.
- **Se exigen dispositivos registrados.** La organización exige dispositivos registrados y una aplicación conectada no tiene ninguno, así que las aplicaciones no pueden leer sus secretos.
- **La organización no está activa.**

Si ninguna organización está disponible, o ninguna tiene un entorno que puedas leer, la página dice que no hay ningún entorno que puedas compartir. Desde esa página no se puede conectar nada.

### Mensajes de la página de aprobación

- **"Este enlace venció, ya se usó o pertenece a otra persona. Empieza de nuevo desde la aplicación."** El enlace funciona una sola vez, dura 10 minutos y es para la persona que había iniciado sesión en la aplicación. Vuelve a la aplicación y empieza de nuevo.
- **"Esta aplicación no puede aceptar conexiones nuevas en este momento. Consulta con quien la desarrolla."** La aplicación no está aprobada (por ejemplo, está suspendida), o Bella ya no puede verificar el dominio de su desarrollador. Consulta con quien la desarrolla.
- **"No se compartió nada. Empieza de nuevo desde la aplicación."** La página terminó sin una conexión. Empieza de nuevo desde la aplicación.

## Ver y revocar tus conexiones

Abre **Mi Perfil** y después la pestaña **Aplicaciones conectadas**. La pestaña lista todas las conexiones que hiciste, en todas tus organizaciones.

| Columna | Qué muestra |
|---|---|
| **Aplicación** | El nombre de la aplicación, su dominio y la organización que la registró |
| **Organización** | La organización de la que lee la conexión |
| **Proyecto / entorno** | Lo que lee la aplicación, con la etiqueta de ámbito si hay una |
| **Conectada** | La fecha en que la conectaste |
| **Último uso** | Cuándo leyó la aplicación por última vez, o **Nunca** |
| **Vence** | La fecha de vencimiento, o **Sin vencimiento** |
| **Estado** | **Activa**, **Detenida** o **Revocada** |

Una conexión tiene uno de tres estados:

- **Activa.** La aplicación puede leer ahora.
- **Detenida.** La conexión existe, pero Bella rechaza por ahora las lecturas de la aplicación. La fila dice por qué. Una conexión detenida puede volver a atender lecturas cuando termine su causa. Los motivos son:
  - El operador de la plataforma suspendió la aplicación.
  - La organización ahora exige dispositivos registrados.
  - Las aplicaciones conectadas están desactivadas en la organización.
  - La persona que la conectó está suspendida.
  - La conexión venció.
  - La organización está suspendida.
  - La persona que la conectó ya no puede leer este entorno.
  - El entorno ya no está disponible.
- **Revocada.** La conexión se terminó. La fila dice quién la terminó y cuándo. Una conexión revocada permanece en la lista 30 días, para que veas lo que se cortó. No puede volver a atender lecturas.

Para revocar una conexión, elige el botón de revocar al final de su fila y confirma con **Revocar**. Una revocación surte efecto en la siguiente lectura de la aplicación. Para volver a conectarla, la aplicación tiene que pedirlo de nuevo y una persona tiene que aprobarlo.

## Para propietarios y administradores

Abre **Configuración** y después la pestaña **Aplicaciones conectadas**. Solo un propietario o administrador de la organización puede usar esta pestaña.

### El interruptor

El interruptor **Permitir aplicaciones conectadas en esta organización** está activado por defecto.

- **Mientras está desactivado,** nadie puede conectar una aplicación y se rechaza toda lectura por una conexión existente.
- **Cuando lo vuelves a activar,** las conexiones existentes se reanudan sin pedir permiso de nuevo.

### Todas las conexiones de la organización

Debajo del interruptor, la pestaña lista todas las conexiones que hicieron los miembros de la organización. Tiene las mismas columnas que la lista personal, con **Conectada por** en lugar de **Organización**. Ves quién conectó cada aplicación. Puedes revocar cualquier conexión, también cuando el interruptor está desactivado. La fila muestra entonces "Revocada por un administrador de la organización".

### Cuando un miembro es eliminado, se va o es suspendido

- **Un miembro es eliminado, o se va de la organización.** Bella revoca todas las conexiones que hizo ese miembro.
- **Un miembro es suspendido.** Bella rechaza las lecturas por sus conexiones mientras dure la suspensión. Las conexiones aparecen como **Detenida**, con el motivo "La persona que la conectó está suspendida". No se revoca nada, así que las conexiones vuelven a funcionar cuando se restaura al miembro.

## Organizaciones que exigen dispositivos registrados

Una organización que exige dispositivos registrados no puede aceptar aplicaciones conectadas. Una aplicación conectada no tiene dispositivo registrado, así que no puede leer secretos que solo puede leer un dispositivo registrado. Los miembros no pueden conectar una aplicación a esa organización, y sus conexiones existentes aparecen como **Detenida**.

## Quién paga

Paga el dueño de la aplicación por cada lectura. Las lecturas cuentan contra la cuota de API de la organización que registró la aplicación. Nunca cuentan contra ti, contra tu organización, contra tu asignación ni contra tus API keys.

## En el log de auditoría

Cada lectura de una aplicación conectada es una fila en el log de auditoría de tu organización. El actor aparece como `aplicación: <nombre de la aplicación>`, con `Conectada por <persona>` debajo. La acción es `export_all`, igual que cuando una persona lee todos los secretos de un entorno.

Una lectura que Bella rechaza, a través de una conexión que existe, aparece como **Lectura de aplicación conectada rechazada**. El detalle de la fila dice por qué.

Estos eventos no escriben una fila de auditoría hoy:

- Conectar una aplicación.
- Revocar una conexión.
- Activar o desactivar las aplicaciones conectadas en la organización.
- Registrar o cambiar una aplicación de desarrollador.

Si un control tuyo depende de evidencia de estos eventos, guárdala fuera de Bella por ahora. Consulta [Logs de auditoría](/es/audit/) para ver los campos de una fila.

## Véase también

- [Conectar con Bella Baxter](/es/features/connected-apps), para desarrolladores
- [Logs de auditoría](/es/audit/)
- [Miembros del equipo](/es/features/team-members)
