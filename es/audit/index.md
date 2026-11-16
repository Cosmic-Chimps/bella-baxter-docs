# Auditoría

> 🌐 **English version**: [Audit Logs](/audit/)

Traducción próximamente. Consulta la [versión en inglés](/audit/) para documentación completa.

## Envío a un SIEM: lo que CEF no puede llevar

Los destinos JSON (HTTPS genérico, Splunk HEC, Datadog, Azure Monitor) reciben cada evento como un sobre JSON cuyo
miembro `raw` contiene la fila de auditoría completa, incluidos `raw.scopeNarrowing` (cuántas claves ocultó un listado
limitado por alcance), `raw.trustDomainId`, `raw.presentedAudiences` y `raw.audienceMatched`. Las audiencias
presentadas las aporta quien llama y Bella no las verifica: como máximo 8 valores de 256 caracteres, con los
caracteres de control reemplazados. Trátalas como entrada no confiable al mostrarlas.

**El destino CEF (syslog sobre TLS) lleva solo los campos promovidos y no incluye `raw`.** Por eso no distingue un
listado recortado por alcance de una lectura rechazada, ni lleva el dominio de confianza ni las audiencias presentadas.
Si una regla depende de ellos, usa un destino JSON.


## Dónde ver el log de auditoría

En la aplicación web, elige **Auditoría** en el menú de navegación. La página se titula **Registros de Auditoría**. Lista toda la organización. Para ver un solo proyecto, usa el control **Filtrar por proyecto**.

## Aplicaciones conectadas en el log

Una aplicación conectada es una aplicación de terceros a la que una persona dejó leer un entorno. Consulta [Gestionar aplicaciones conectadas](/es/features/connected-apps-manage) para el lado de la persona y [Conectar con Bella Baxter](/es/features/connected-apps) para el del desarrollador. Bella escribe estas filas en la organización que concedió el acceso.

En una fila cuyo `actorType` es `application`:

- `appId`, `appName` y `grantId` nombran la aplicación y la conexión. Solo las filas escritas para una aplicación conectada los tienen.
- `userId` y `userName` son la persona que conectó la aplicación, no una persona que actuó.
- `bellaClient` es `connected-app`. Lo fija Bella, no lo informa quien llama. El valor `mcp`, que marca las filas de la superficie del asistente de IA, también lo fija Bella.
- `apiKeyId` está vacío.

La consola muestra el actor como `aplicación: <nombre>`, con `Conectada por <persona>` debajo.

Dos acciones importan aquí:

| Acción | Se registra cuando |
|--------|--------------------|
| `export_all` | Una aplicación conectada leyó todos los secretos de su entorno. Es la misma acción que cuando lo lee una persona, y el actor `application` las distingue |
| `connected_app_read_denied` | Se rechazó la lectura de una aplicación conectada a través de una conexión que existe, por ejemplo porque se revocó, venció o se desactivó. El motivo está en `detail`. Una petición que no coincide con ninguna conexión no se registra |

`connected_app_read_denied` se envía al SIEM con `outcome` igual a `denied`.

### Lo que no se registra

Conectar una aplicación, revocar una conexión, activar o desactivar las aplicaciones conectadas en la organización, y registrar o cambiar una aplicación de desarrollador no escriben ninguna fila. Si un control tuyo depende de evidencia de estos eventos, guárdala fuera de Bella por ahora.
