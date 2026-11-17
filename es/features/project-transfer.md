# Transferir un proyecto a otra organización

> 🌐 **English version**: [Transfer a project to another organisation](/features/project-transfer)

Una transferencia mueve un proyecto de una organización a otra. Bella lo hace en dos pasos. Primero copia el proyecto en la organización que lo recibe, como un proyecto nuevo. Después elimina el proyecto en la organización de la que sale.

Lee esto antes de empezar:

- **Una transferencia completada no se puede deshacer.** El proyecto original se elimina.
- **La confianza se reinicia.** Las autoridades de certificación, las claves de firma de tokens y las identidades de carga de trabajo del proyecto se crean de nuevo en la organización que lo recibe. Todo lo que confiaba en las anteriores debe actualizarse.
- **Se revocan todas las API keys.** Los servicios que leen los secretos del proyecto necesitan claves nuevas.
- **El historial de versiones no se lleva.** Solo se mueve el valor actual de cada secreto. Lee cualquier versión anterior que necesites antes de transferir.
- **Los entornos archivados no se llevan.** Se eliminan junto con el proyecto original.

En esta página, el **origen** es la organización de la que sale el proyecto. El **destino** es la organización que lo recibe. Una **ejecución** es un intento de transferencia.

## Quién puede transferir un proyecto

Debes ser el **propietario (Owner) de las dos organizaciones**, el origen y el destino. Un administrador (Admin) no puede transferir un proyecto. Una persona suspendida en cualquiera de las dos organizaciones no cuenta como su propietaria, así que no puede iniciar, reanudar ni abandonar una transferencia.

El destino no aprueba la transferencia en un paso aparte, porque la misma persona es propietaria de ambas.

Solo una persona puede transferir un proyecto. Se rechaza cualquier API key, incluidas las personales. También se rechaza una sesión en la que un operador actúa en tu nombre.

## Antes de empezar

Comprueba cada punto. Bella rechaza la transferencia hasta que se quiten los elementos que la bloquean.

**Quita lo que bloquea una transferencia.** La vista previa lista cada elemento por entorno y nombre:

- **Claves TOTP.** Bella no puede leer de vuelta una semilla TOTP, así que no puede copiarla. Elimina las claves y vuelve a registrarlas en el destino después.
- **Leases activos.** Son los leases de secretos que Bella registra, que puedes ver y revocar. Espera a que caduquen o revócalos.
- **Destinos de despliegue de certificados** en los entornos del proyecto.
- **Delegaciones DNS** en los entornos del proyecto.
- **Ámbitos de escaneo de Scout y dominios reclamados** en los entornos del proyecto.

Bella lo comprueba de nuevo al empezar la ejecución y justo antes de eliminar el origen. Un lease o un destino creado mientras la ejecución trabaja la detiene.

**Prepara los proveedores:**

- **El proveedor predeterminado no necesita nada.** Sus valores pasan al proveedor predeterminado del destino.
- **Asigna cada proveedor propio que guarde valores.** Para cada uno, elige un proveedor del mismo tipo en el destino. La vista previa lista los proveedores del destino. El proveedor debe existir, no estar eliminado y poder guardar secretos. Sin una asignación para cada uno, la transferencia se rechaza. Bella nunca descarta valores en silencio.
- **Un proveedor propio que se eliminó en Bella pero sigue guardando valores no se puede asignar.** Mantiene rechazada la transferencia.
- **No asignes al mismo almacenamiento.** Si el proveedor que eliges en el destino llega al mismo almacenamiento que el proveedor del origen, con el mismo slug, la ejecución se detiene al empezar. Elige otro proveedor o dale al proyecto un slug nuevo.
- **Concede primero el acceso al destino en tu nube.** Un proveedor de AWS o de GCP está ligado a la identidad de la organización. Antes de la transferencia, concede acceso a la identidad del destino en tu cuenta de la nube y crea el proveedor en el destino. Consulta [Proveedores](/es/features/providers).

**Comprueba el slug.** El proyecto conserva su slug si el destino nunca lo ha usado. Un slug que tuvo un proyecto eliminado cuenta como usado. Si está en uso, elige un slug nuevo. Un slug tiene de 2 a 63 caracteres: letras minúsculas y dígitos, con guiones simples entre ellos, y sin guion al principio ni al final.

**Comprueba los límites del plan del destino.** Bella comprueba que el destino pueda guardar un proyecto más y que su plan permita tantos entornos por proyecto como tiene el proyecto. La vista previa también muestra los límites de proveedores propios y de miembros del equipo. Una transferencia no puede aumentarlos, así que nunca bloquean.

**Planifica el reinicio de la confianza.** Haz una lista de los hosts que confían en la autoridad de certificación SSH o PKI del proyecto, de las cargas de trabajo que usan identidades SPIFFE y de cualquier configuración de CI o Kubernetes que contenga un ID de entorno. Todos cambian.

**Avisa a las personas afectadas.** Los miembros que no están activos en el destino pierden el acceso. Los servicios pierden sus API keys. Mientras la transferencia se ejecuta, nadie puede cambiar el proyecto.

## Qué se mueve, qué se queda y qué debes rehacer

| Elemento | Qué pasa | Qué haces |
|---|---|---|
| Nombre, descripción y etiquetas del proyecto | Se copian | Nada |
| Entornos | Se copian al destino. Cada uno recibe un ID nuevo. Se copian su nombre, su descripción, su política de leases y su configuración SPIFFE | Actualiza cualquier configuración de CI o Kubernetes que contenga un ID de entorno |
| Secretos | El valor actual de cada secreto se copia y se cifra de nuevo para el destino. Se copian su descripción, sus etiquetas, su tipo, su caducidad y los datos del certificado | Nada |
| Historial de versiones de los secretos | No se copia. Se elimina junto con el proyecto de origen | Lee cualquier versión anterior que necesites antes de empezar |
| Secretos del proyecto (globales) | Se copian | Nada |
| Etiquetas de ámbito | Se copian con cada secreto | Nada |
| Políticas de rotación | Se copian. La fecha de la próxima rotación cuenta desde el momento de la copia. Una rotación en curso no se lleva | Nada |
| Webhooks | Se crean de nuevo en el destino, con el mismo secreto de firma, así que un receptor que comprueba la firma sigue funcionando. Un webhook que replica su secreto de firma en un proveedor conserva ese vínculo solo si la persona que lo creó es miembro activo del destino. Si no, el vínculo se descarta y aparece en **No movido** | Nada, o crea el vínculo de nuevo en el destino |
| Canales de notificación | Se crean de nuevo en el destino, con su configuración | Nada |
| Los valores del proveedor predeterminado | Se copian al proveedor predeterminado del destino | Nada |
| Proveedores propios | Los valores van al proveedor que asignaste en el destino. Los proveedores que no guardan ningún valor del proyecto no se asignan en el destino | Asigna cada uno antes de la transferencia |
| Miembros | Un miembro llega con su rol solo si es miembro activo del destino. Todos los demás se descartan. La vista previa los lista. La persona que inicia la ejecución pasa a ser la propietaria del proyecto nuevo y de cada entorno nuevo | Agrega a las personas descartadas al destino y luego al proyecto |
| Grupos | Se descartan. Un grupo existe solo en su propia organización. La vista previa los lista | Asigna al proyecto grupos del destino |
| API keys | Se revocan cuando se elimina el origen. Esto abarca toda clave limitada al proyecto o a uno de sus entornos. La vista previa las lista | Crea claves nuevas en el destino y entrégalas a tus servicios |
| Aplicaciones conectadas | Las conexiones se revocan antes de eliminar el origen. La vista previa las lista por el nombre de la aplicación | La persona vuelve a conectar la aplicación en el destino |
| Autoridad de certificación PKI | Se crea una autoridad nueva en el destino, con una clave nueva y direcciones nuevas. El vínculo con el almacén de secretos que la guarda no se copia | Haz que cada parte que confía confíe en la autoridad nueva y emite los certificados de nuevo |
| Autoridad de certificación SSH | Se crea una autoridad nueva en el destino, con una clave nueva | Haz que cada host confíe en la autoridad nueva |
| Identidades de carga de trabajo | Se crean de nuevo con un SPIFFE ID nuevo. El dominio de confianza SPIFFE es el slug de la organización, así que todos los SPIFFE ID cambian. Una identidad revocada no se crea de nuevo. Una desactivada sigue desactivada. No se llevan los vínculos con nodos, los vínculos con instancias de AWS, las identidades emitidas (SVID) ni los leases | Actualiza cada carga de trabajo y política que nombre un SPIFFE ID |
| Dominios de confianza (los emisores OIDC que un entorno acepta para el acceso sin claves) | Se crean de nuevo con el mismo emisor, las mismas reglas de claims y las mismas audiencias. Uno desactivado sigue desactivado | Nada |
| Claves de firma de tokens del entorno | Se crean claves nuevas | Actualiza todo lo que verifique tokens con las claves anteriores |
| Claves TOTP | Bloquean la transferencia | Elimínalas primero y vuelve a registrarlas en el destino |
| Leases activos | Bloquean la transferencia | Espera a que caduquen o revócalos |
| Destinos de despliegue de certificados, delegaciones DNS, ámbitos de escaneo de Scout y dominios reclamados | Bloquean la transferencia | Quítalos primero y vuelve a configurarlos en el destino |
| Credenciales dinámicas de bases de datos | Bella no guarda registro de ellas, así que no bloquean. Sus leases caducan en tu motor de base de datos | Nada |
| Entornos archivados | No se llevan. La vista previa los lista, con su número de secretos, y se eliminan junto con el origen | Nada |
| Hallazgos de seguridad | No se copian. El destino vuelve a escanear el proyecto | Nada |
| Historial de auditoría | Se queda en el origen como registro | Lee el historial anterior del proyecto en el origen |
| Historial de uso y de facturación | Se queda en el origen | Nada |
| El slug del proyecto | Se conserva si el destino nunca lo ha usado. Si no, eliges uno nuevo | Actualiza todo lo que nombre el slug, si cambió |
| IDs del proyecto y de los entornos | Nuevos | Actualiza todo lo que guarde un ID |

## Ejecuta la transferencia

Una transferencia tiene tres etapas: una vista previa, una confirmación y una ejecución que trabaja en segundo plano.

### La vista previa

La vista previa no cambia nada. No se escribe ningún registro y todas las API keys siguen funcionando. Muestra:

- qué se mueve, con el número de secretos de cada entorno y proveedor (`moves`);
- qué se crea de nuevo, en cada entorno (`recreated`);
- qué API keys y aplicaciones conectadas se revocan (`revoked`);
- qué miembros y grupos se descartan, qué entornos archivados no se llevan y qué tipos de historial se quedan atrás (`dropped`);
- qué bloquea la transferencia (`blocks`);
- qué proveedores todavía necesitan una asignación y qué asignaciones no se pueden usar (`providersNeedingMapping`, `invalidMappings`);
- las asignaciones en vigor (`mappedProviders`);
- los proveedores del destino que puedes asignar, cada uno con su id, nombre y tipo (`targetProviders`). Usa esos ids en `providerMappings`;
- el slug que tendría el proyecto en el destino y si está libre (`targetSlug`, `targetSlugAvailable`);
- si al destino le falta una clave de organización que el proyecto necesita (`targetUnencrypted`);
- los límites del plan del destino, antes y después (`planLimits`);
- qué destruye eliminar el proyecto de origen, con los mismos recuentos que la [vista previa de eliminación de un proyecto](/features/projects#delete-a-project) (`deletionPreview`);
- advertencias (`warnings`);
- un digest que envías de vuelta al iniciar (`previewDigest`).

Las advertencias son:

| Advertencia | Qué significa |
|---|---|
| `trust-reset` | Los hosts, las partes que confían y las cargas de trabajo deben confiar en las autoridades e identidades nuevas. Los ID de entorno cambian. Se muestra cuando el proyecto tiene al menos un entorno |
| `ca-store-binding-required` | Un entorno que llega tendría más de un almacén de tipo Vault. Un administrador del destino debe elegir cuál guarda las autoridades de certificación nuevas |
| `dynamic-credentials-untracked` | Las credenciales dinámicas de bases de datos no dejan registro en Bella, así que sus leases no se comprueban. Se muestra siempre |
| `same-storage-checked-at-start` | Un proveedor que asignaste se comprueba cuando empieza la transferencia, para asegurar que no llega al almacenamiento del origen. Se muestra cuando asignaste al menos un proveedor propio |

Cada entrada de `planLimits` tiene un `resource`, un `limit` (`-1` significa sin límite), `current`, `after`, `exceeded` y una `note`. En proveedores propios y miembros del equipo, `current` y `after` van vacíos y `exceeded` es siempre falso.

Si Bella no puede contar algo, la vista previa se rechaza. Nunca muestra un cero del que no esté segura.

### En la consola

Debes ser propietario de la organización del proyecto y ser propietario de al menos otra organización. Nadie más ve la acción.

1. Abre el proyecto y elige **Configuración**.
2. En la sección **Organización**, elige **Transferir a otra organización**. El diálogo se titula «Transferir *nombre del proyecto* a otra organización».
3. **1. Organización de destino.** Elige la organización. Solo aparecen las organizaciones de las que eres propietario.
4. **2. Proveedores.** Este paso aparece solo cuando un proveedor propio guarda valores del proyecto. Para cada proveedor, elige en la lista un proveedor del destino. La lista muestra solo los proveedores del destino del mismo tipo, con su nombre y su tipo. El almacén predeterminado no está en la lista, porque se asigna solo. Si el destino no tiene ningún proveedor de ese tipo, el paso lo dice y no puedes iniciar: agrega uno en la organización de destino y abre de nuevo el diálogo.
5. **3. Slug del proyecto.** El campo empieza con el slug del proyecto. Conserva el slug o escribe uno nuevo. La consola te dice si el slug está libre en el destino.
6. **4. Qué va a pasar.** Lee la vista previa. Empieza con una advertencia titulada **Todo lo que confía en este proyecto debe volver a confiar en él**. Debajo aparecen qué se mueve, qué se crea de nuevo, qué deja de funcionar, qué no se lleva y qué se elimina aquí.
7. **5. Confirmar.** Escribe el slug del proyecto.
8. Elige **Iniciar la transferencia**.

El botón sigue desactivado hasta que nada lo impide. El diálogo lista cada motivo debajo del botón, por ejemplo un proveedor que necesita un destino, algo que bloquea la transferencia, un slug en uso, un límite del plan o una confirmación que no coincide.

Después la consola abre la página de la ejecución, en `/project-transfers/` seguido del id de la ejecución. La página muestra el estado, la fase y el progreso. También muestra **No movido** cuando algo no se movió. Cuando la transferencia termina, muestra un botón para abrir el proyecto en el destino.

Mientras hay una transferencia en curso, la página **Configuración** del proyecto muestra **Hay una transferencia en curso** en la sección **Organización**, con un enlace, **Ver la transferencia**, a la página de la ejecución.

### Con la API

Todas las rutas necesitan la sesión de una persona. Los ejemplos usan la dirección alojada. `{projectRef}` es el id o el slug del proyecto.

**1. Vista previa.**

```http
POST https://api.bella-baxter.io/api/v1/projects/{projectRef}/transfer/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetTenantId": "<id de la organización de destino>",
  "providerMappings": [
    { "sourceProviderId": "<proveedor en el origen>", "targetProviderId": "<proveedor en el destino>" }
  ],
  "targetSlug": "my-api"
}
```

`providerMappings` tiene una entrada por cada proveedor propio que guarda valores del proyecto. Puede estar vacío. Omite `targetSlug` para conservar el slug del proyecto. La respuesta incluye `previewDigest`, que envías de vuelta en el paso siguiente.

**2. Iniciar.** Envía el mismo cuerpo, más el slug del proyecto y el digest:

```http
POST https://api.bella-baxter.io/api/v1/projects/{projectRef}/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetTenantId": "<id de la organización de destino>",
  "providerMappings": [
    { "sourceProviderId": "<proveedor en el origen>", "targetProviderId": "<proveedor en el destino>" }
  ],
  "targetSlug": "my-api",
  "confirmProjectSlug": "my-api",
  "previewDigest": "<digest de la vista previa>"
}
```

Bella construye la vista previa de nuevo con el estado actual y compara su digest con el tuyo. Si el proyecto cambió desde tu vista previa, el inicio se rechaza con `project-transfer-preview-stale`. La respuesta es `202`, con la ejecución en el cuerpo y su dirección en la cabecera `Location`: `/api/v1/project-transfers/{runId}`.

Un proyecto tiene un solo registro de ejecución. Su id sale del proyecto, así que no cambia si abandonas una ejecución y empiezas de nuevo.

**3. Sigue la ejecución.**

```http
GET https://api.bella-baxter.io/api/v1/project-transfers/{runId}
Authorization: Bearer <token>
```

| Campo | Qué contiene |
|---|---|
| `id` | El id de la ejecución |
| `state` | `queued`, `running`, `stopped`, `completed` o `abandoned` |
| `phase` | El paso en que está la ejecución, o el paso en que se detuvo: `check`, `createtarget`, `copyvalues`, `copyconfiguration`, `verify` o `retiresource` |
| `failureCode` | Por qué se detuvo una ejecución detenida. Consulta [Si una transferencia se detiene](#si-una-transferencia-se-detiene) |
| `source`, `target` | La organización y el proyecto de cada lado: `tenantId`, `tenantSlug`, `projectId`, `projectSlug` |
| `startedBy`, `startedByName` | El propietario que inició la ejecución |
| `requestedAt`, `heartbeatAt`, `completedAt` | Cuándo se pidió la ejecución, cuándo dio señales de vida por última vez y cuándo se completó |
| `progress` | Contadores de entornos, secretos de entorno, secretos globales, webhooks, canales de notificación, identidades de carga de trabajo y dominios de confianza. Cada uno tiene `created`, `copied` y `verified` |
| `notMoved` | Cada elemento que la ejecución no pudo mover, con su `subject`, `name`, `reason`, `count` y dónde está |

`GET /api/v1/projects/{projectRef}/transfer` devuelve la ejecución actual del proyecto. Responde `404` cuando no hay ninguna. Es para el propietario de la organización del proyecto.

Puedes leer una ejecución por su id si eres propietario del origen o del destino. Cualquier otra persona recibe `404`, así que una ejecución no revela que existe.

Ninguna respuesta de estas rutas contiene un valor de secreto, una clave ni el nombre de un secreto. Llevan recuentos y nombres de cosas como proveedores y entornos.

No hay ningún comando de la CLI para una transferencia.

## Mientras una transferencia se ejecuta

Una ejecución pasa por estas fases, en este orden:

| Fase | Qué hace Bella |
|---|---|
| `check` | Comprueba todo de nuevo con el estado actual: que sigues siendo propietario de las dos organizaciones, que el destino está activo, que nada bloquea, el cifrado, el slug, los límites del plan del destino y que ningún proveedor asignado llegue al almacenamiento del origen. No escribe nada |
| `createtarget` | Crea el proyecto, su clave de datos, sus entornos, sus asignaciones de proveedores y los miembros que llegan |
| `copyvalues` | Copia los valores de los secretos, cifrados de nuevo para el destino |
| `copyconfiguration` | Crea los webhooks, los canales de notificación, las identidades de carga de trabajo y los dominios de confianza |
| `verify` | Lee cada valor en el origen y en el destino y los compara. Espera hasta que la ejecución tenga 30 segundos, para que todos los servidores hayan visto que el proyecto es de solo lectura. No se elimina nada hasta que esto pasa |
| `retiresource` | Comprueba de nuevo que eres propietario de las dos organizaciones y que nada bloquea. Después termina las conexiones de las aplicaciones conectadas, elimina el proyecto de origen, revoca sus API keys y escribe las filas de auditoría |

Mientras trabaja:

- **El proyecto es de solo lectura en ambos lados.** Las lecturas funcionan. Los cambios en el proyecto de origen, o en el proyecto que llega al destino, se rechazan con `project-transfer-in-progress`.
- **El trabajo programado se pausa para el proyecto.** Las rotaciones de secretos, las rotaciones de secretos de webhooks y los avisos de caducidad esperan hasta que termine la ejecución. Después se ejecutan de nuevo.
- **Una ejecución a la vez.** Se rechaza una segunda transferencia del mismo proyecto.
- **El origen se elimina al final.** Bella elimina el proyecto de origen solo después de comprobar cada valor en el destino.

Una ejecución que no da señales de vida durante 30 minutos se muestra como `stopped` con el código de fallo `abandoned`. Puedes reanudarla o abandonarla.

## Si una transferencia se detiene

Una ejecución que falla a medias se detiene. El proyecto de origen queda intacto y de solo lectura. La ejecución muestra por qué se detuvo y qué no se movió. Entonces eliges una de dos acciones. Las dos exigen que seas propietario de **las dos** organizaciones. Las dos responden `202` con la ejecución. Solo puedes usarlas mientras la ejecución está `stopped`.

- **Reanudar.** La ejecución continúa en el paso en que se detuvo. Un valor que ya llegó no se copia de nuevo. Si la ejecución se detuvo porque algunos valores del destino no coincidían con el origen, al reanudar se copian de nuevo solo esos valores y se verifica otra vez. El botón de la consola es **Reanudar**.

  ```http
  POST https://api.bella-baxter.io/api/v1/project-transfers/{runId}/resume
  Authorization: Bearer <token>
  Content-Type: application/json

  { "acceptNotMoved": true }
  ```

  El cuerpo es obligatorio. Envía `{}` para reanudar sin aceptar nada. Envía `{"acceptNotMoved": true}` solo si aceptas perder los elementos listados en `notMoved`. La consola lo muestra como la casilla **Aceptar los elementos no movidos**. Aparece solo cuando hay elementos.

  Tu aceptación cubre exactamente la lista que viste. Si la lista es distinta cuando Bella está a punto de eliminar el origen, la ejecución se detiene de nuevo con `not-moved`, olvida tu aceptación y no elimina nada. Entonces ves la lista nueva y decides otra vez. Una reanudación sin `acceptNotMoved` borra cualquier aceptación anterior.
- **Abandonar.** Bella elimina el proyecto creado a medias en el destino, con los valores copiados en él, y vuelve a permitir escribir en el proyecto de origen. El botón de la consola es **Abandonar**, y te pide confirmación.

  ```http
  POST https://api.bella-baxter.io/api/v1/project-transfers/{runId}/abandon
  Authorization: Bearer <token>
  ```

Si eres propietario de solo una de las dos organizaciones, reanudar y abandonar responden `403` con `project-transfer-owner-required`. Si no eres propietario de ninguna, responden `404`.

### Códigos de fallo

| `failureCode` | Qué significa | Qué hacer |
|---|---|---|
| `blocked` | Apareció algo que bloquea una transferencia mientras la ejecución trabajaba: una clave TOTP, un lease, un destino de despliegue de certificados, una delegación DNS, o un ámbito o dominio reclamado de Scout | Quítalo y reanuda |
| `owner-lost` | La persona que inició la ejecución ya no es propietaria activa de las dos organizaciones. Un propietario suspendido en cualquiera de las dos no cuenta | Restaura el rol de propietario de esa persona y reanuda. O abandona |
| `target-inactive` | La organización de destino ya no está activa | Espera a que vuelva a estar activa y reanuda. O abandona |
| `provider-shares-storage` | Un proveedor que asignaste llega al mismo almacenamiento que el proveedor al que reemplaza. Copiar sobrescribiría el original | Abandona y empieza de nuevo con otro proveedor o un slug nuevo |
| `provider-unavailable` | Un proveedor asignado ya no existe, no se puede usar o no se pudo alcanzar para comprobar o copiar valores | Arregla el proveedor y reanuda. Si se eliminó, abandona y empieza de nuevo, porque las asignaciones se fijan cuando empieza la ejecución |
| `store-unavailable` | No se pudo leer o escribir un almacén de secretos, un almacén de claves o la base de datos. Bella no adivina | Comprueba que los almacenes estén accesibles y reanuda |
| `not-moved` | Algunos elementos no se movieron y no lo has aceptado. O los valores del origen y del destino no coincidían cuando Bella los verificó. El origen no se eliminó | Lee **No movido**. Reanuda para copiar de nuevo los valores que no coincidían. Para un elemento que no se puede mover, arregla la causa, o reanuda con `acceptNotMoved` si no lo necesitas. O abandona |
| `grants-not-ended` | No se pudo terminar el acceso de una aplicación conectada. El origen no se eliminó | Reanuda para intentarlo de nuevo |
| `keys-not-revoked` | No se pudieron revocar todas las API keys del proyecto. El origen no se eliminó | Reanuda para intentarlo de nuevo |
| `slug-taken` | El slug ya está en uso en el destino | Abandona y empieza de nuevo con otro slug |
| `target-unencrypted` | Los valores del proyecto están cifrados y el destino no tiene clave de organización | Configura las claves de cifrado de la organización en el destino y reanuda |
| `plan-limit` | Se superaría el plan del destino: proyectos, o entornos por proyecto | Libera capacidad en el destino o cambia su plan, y reanuda |
| `abandoned` | La ejecución no dio señales de vida durante 30 minutos, por eso se muestra como detenida. No es lo mismo que el estado `abandoned` | Reanuda o abandona |

### Elementos que no se movieron

Cada entrada de `notMoved` nombra un `subject`, con un `reason`. Los motivos que una transferencia puede informar son:

- `Undecryptable`: ninguna clave abre el valor. Se dejó exactamente como estaba. Restaura la clave o vuelve a introducir el valor.
- `WriteFailed`: el valor o el ajuste no se pudo escribir en el destino, lo que hay en el destino no coincide, o no tiene destino. Comprueba que el almacén de destino acepta escrituras y reanuda: los valores se copian de nuevo. Esto cubre también un vínculo de réplica de webhook que se descartó, un webhook o canal de un entorno que no se lleva y un proveedor que guarda valores pero no tiene asignación.
- `Unreadable`: no se pudo leer un registro del almacén de secretos.

## Después de la transferencia

Haz esto en orden:

1. **Crea API keys nuevas** en el destino y entrégalas a tus servicios.
2. **Agrega a las personas que se descartaron** y asigna al proyecto grupos del destino.
3. **Reinicia la confianza.** Haz que los hosts confíen en la autoridad SSH nueva y que las partes que confían confíen en la autoridad PKI nueva. Emite los certificados de nuevo. Actualiza las cargas de trabajo y las políticas que nombren un SPIFFE ID.
4. **Actualiza los ID guardados.** Cambia el ID de entorno en la configuración de CI y de Kubernetes.
5. **Reconecta las aplicaciones conectadas.** Cada persona vuelve a conectar su aplicación.
6. **Vuelve a configurar lo que quitaste:** claves TOTP, destinos de despliegue de certificados, delegaciones DNS y ámbitos de escaneo de Scout.
7. **Comprueba una lectura.** Lee un secreto con una clave nueva para confirmar que los servicios funcionan.

## Cifrado de conocimiento cero

Puedes transferir un proyecto tanto si alguna de las dos organizaciones exige el cifrado de conocimiento cero como si no. Las rutas de la transferencia no piden un dispositivo registrado. Bella abre los valores en el servidor y los cifra de nuevo para el destino. Nunca te devuelve un valor ni una clave durante una transferencia.

Se rechaza un caso: el proyecto de origen está cifrado con una clave de organización y el destino no tiene clave de organización. El propietario del destino configura primero las claves de cifrado de la organización. La copia se cifra entonces con una clave nueva en el destino.

## Errores

Cada rechazo antes de que empiece una ejecución no cambia nada. El `type` de `person-only`, `impersonation-refused` y `plan-limit-exceeded` es el nombre solo. En cualquier otro problema, el `type` es `https://bellabaxter.dev/problems/` seguido del nombre de la tabla.

| Estado | Tipo de problema | Cuándo | Qué hacer |
|---|---|---|---|
| `403` | `person-only` | Quien llama es una API key | Inicia sesión como persona |
| `403` | `impersonation-refused` | Un operador actúa en tu nombre | Inicia sesión tú mismo |
| `403` | `project-transfer-owner-required` | No eres propietario de la organización de origen. También al reanudar y abandonar cuando eres propietario de solo una de las dos organizaciones | Pide ayuda a un propietario |
| `400` | `project-transfer-target-refused` | El destino no existe, no está activo, es el propio origen o no eres su propietario. Bella da una sola respuesta para todos estos casos, así que no revela si una organización existe | Comprueba el ID del destino y tu rol en él |
| `409` | `project-transfer-blocked` | Algo bloquea la transferencia. La respuesta lista cada elemento | Quítalos e inténtalo de nuevo |
| `422` | `project-transfer-provider-unmapped` | Un proveedor propio que guarda valores no tiene asignación | Asígnalo |
| `422` | `project-transfer-provider-mapping-invalid` | Una asignación nombra un proveedor que no existe en el destino, está eliminado, no puede guardar secretos o es de otro tipo | Elige un proveedor del mismo tipo |
| `409` | `project-transfer-target-unencrypted` | El proyecto de origen está cifrado y el destino no tiene clave de organización | Configura el cifrado en el destino |
| `402` | `plan-limit-exceeded` | La transferencia superaría un límite del plan del destino. La respuesta nombra el `resource` y el `limit` | Libera capacidad en el destino o cambia su plan |
| `409` | `project-transfer-slug-taken` | El slug lo usa en el destino un proyecto activo o eliminado. Esto vale también para el slug que elegiste | Envía otro `targetSlug` |
| `422` | `project-transfer-slug-invalid` | El slug nuevo incumple las reglas de slug | Elige un slug válido |
| `422` | `project-transfer-confirmation-missing` | Falta `confirmProjectSlug` o `previewDigest` | Envía los dos |
| `422` | `project-transfer-confirmation-mismatch` | El slug que escribiste no es el del proyecto | Escríbelo exactamente |
| `409` | `project-transfer-preview-stale` | El proyecto o tus elecciones cambiaron desde la vista previa | Toma una vista previa nueva |
| `503` | `project-transfer-preview-unavailable` | Bella no pudo contar algo, o no pudo leer el registro de una organización | Inténtalo de nuevo más tarde |
| `409` | `project-transfer-in-progress` | Ya hay una transferencia de este proyecto en marcha, o intentaste cambiar un proyecto que se está transfiriendo | Espera a que termine la ejecución |
| `409` | `project-transfer-not-resumable` | La ejecución no está detenida, así que no se puede reanudar | Comprueba el estado de la ejecución |
| `409` | `project-transfer-not-abandonable` | La ejecución no está detenida, así que no se puede abandonar | Comprueba el estado de la ejecución |

Un proyecto o una ejecución que no existe responde `404`.

## En el log de auditoría

| Acción | Se registra en | Cuándo |
|---|---|---|
| `project_transfer_started` | El origen | Empieza una transferencia |
| `project_transferred_out` | El origen | La transferencia se completa |
| `project_transferred_in` | El destino | La transferencia se completa |
| `project_transfer_abandoned` | Ambos | Se abandona una ejecución |

En la consola, estas acciones se muestran como «Transferencia de proyecto iniciada», «Proyecto transferido a otra organización», «Proyecto recibido de otra organización» y «Transferencia de proyecto abandonada».

Una fila nombra la otra organización y la ejecución, y las filas de la transferencia completada llevan recuentos. Nunca contiene un valor ni el nombre de un secreto. Una transferencia que se rechaza antes de empezar no escribe ninguna fila. Las filas de la transferencia completada se escriben a nombre de la persona que inició la ejecución. El historial de auditoría anterior del proyecto se queda en el origen.

La eliminación del proyecto de origen se registra también ahí como `project_deleted`. Abandonar una ejecución registra `project_deleted` en el destino para el proyecto creado a medias.

## Consulta también

- [Proyectos](/features/projects) (en inglés), incluida la eliminación de un proyecto
- [Proveedores](/es/features/providers)
- [Entornos](/es/features/environments)
- [API Keys](/es/features/api-keys)
- [Certificados PKI](/features/pki-certificates) (en inglés)
- [Certificados SSH](/features/ssh-ca) (en inglés)
- [Gestionar aplicaciones conectadas](/es/features/connected-apps-manage)
- [Auditoría](/es/audit/)
