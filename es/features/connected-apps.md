# Conectar con Bella Baxter

> 🌐 **English version**: [Connect with Bella Baxter](/features/connected-apps)

"Conectar con Bella Baxter" permite que una aplicación de terceros lea los secretos de un entorno, después de que la persona dueña de esos secretos la apruebe. La aplicación nunca recibe una API key y nunca ve nada que la persona no haya elegido.

Esta página es para el desarrollador que construye una aplicación. Si eres una persona a la que una aplicación pidió conectarse, o eres propietario o administrador de una organización, lee [Gestionar aplicaciones conectadas](/es/features/connected-apps-manage).

## Qué es

- **Solo lectura.** Una aplicación puede leer valores de secretos. No puede crear, cambiar ni eliminar nada.
- **Un entorno.** La persona elige una organización, un proyecto y un entorno. Puede acotarlo aún más a una etiqueta de ámbito. Una etiqueta de ámbito es una etiqueta que lleva un secreto. Con una etiqueta de ámbito, la aplicación ve solo los secretos que llevan esa etiqueta.
- **La persona aprueba en la página de Bella.** La página muestra el nombre de la aplicación, el dominio que el desarrollador demostró que controla y la organización que registró la aplicación. No se concede nada hasta que la persona elige **Permitir**.
- **La persona puede revocar en cualquier momento** desde **Aplicaciones conectadas** en la consola. La siguiente lectura de la aplicación es rechazada.
- **El acceso puede terminar en una fecha.** En la página de aprobación, la persona elige cuánto dura el acceso: hasta que lo revoque, 30 días, 90 días o 1 año.

## Quién paga

Cada lectura cuenta contra la cuota de API de la organización **dueña de la aplicación**. Nunca cuenta contra la persona que conectó la aplicación, y nunca toca su propia asignación ni sus propias API keys.

Si la organización dueña de la aplicación superó su cuota, la aplicación recibe `429` con el tipo de problema `monthly-quota-exceeded`.

## Registrar una aplicación

Tienes que ser propietario o administrador de tu organización. Abre **Configuración**, después la pestaña **Aplicaciones de desarrollador** y elige **Registrar una aplicación**.

1. **Registra la aplicación.** Escribe tres cosas:
   - **Nombre de la aplicación.** Las personas deciden según este nombre. No se puede cambiar después.
   - **Dominio.** El dominio que controlas, por ejemplo `app.example.com`. No se puede cambiar después.
   - **Direcciones de redirección.** Una por línea. Una dirección de redirección es a donde Bella envía el navegador de la persona después de que permita o rechace. Cada una debe usar `https`. Su host debe ser tu dominio o un subdominio de él.

   Al registrar se crea un borrador. La aplicación queda **Pendiente**, nadie puede conectarla y un operador todavía no la ve.
2. **Demuestra el dominio.** La página de la aplicación muestra un nombre de registro y un valor de registro. Agrega un registro TXT a tu DNS:

   | Nombre del registro | Valor del registro |
   |---|---|
   | `_bella-app-challenge.<tu-dominio>` | `bella-app-verification=<token>` |

   Esta no es la prueba del inicio de sesión único. Nunca afecta al SSO. Un dominio solo puede estar verificado para aplicaciones de una organización a la vez.
3. **Verifica el dominio.** Elige **Verificar el dominio**. Bella comprueba el registro. Los cambios de DNS pueden tardar unos minutos en llegar. Puedes verificar 10 veces por hora por cada aplicación.
4. **Envía para aprobación.** Elige **Enviar para aprobación**. El botón funciona cuando el dominio está **Verificado** y la aplicación tiene al menos una dirección de redirección. La aplicación sigue **Pendiente** mientras un operador la revisa.
5. **Obtén el secreto de cliente.** Después de enviarla, la página de la aplicación muestra **Rotar el secreto de cliente**. Elígelo y confirma. Bella muestra el secreto nuevo una sola vez. Cópialo y elige **Ya lo copié**. Bella no guarda el secreto y no puede mostrarlo de nuevo. Si lo pierdes, rótalo otra vez. El secreto anterior deja de funcionar al instante.
6. **Espera la aprobación.** Un operador de Bella aprueba la aplicación. Hasta entonces la aplicación no puede iniciar la sesión de nadie, porque su cliente está desactivado. El ID de cliente (`bella-app-<id>`) está en la página de la aplicación en todo momento.

Si un operador rechaza la aplicación, la página de la aplicación muestra el motivo.

Después del registro puedes cambiar dos cosas:

- **Las direcciones de redirección.** Elige **Editar** junto a las direcciones de redirección. Solo puedes hacerlo mientras la aplicación está Pendiente o Aprobada. Deben seguir en tu dominio.
- **El secreto de cliente.** Rótalo como en el paso 5.

Una aplicación rechazada no se puede enviar de nuevo. Para intentarlo otra vez, registra una aplicación nueva. Eliminar una aplicación revoca todas las conexiones a ella.

### Prueba del dominio

Bella vuelve a comprobar tu registro TXT cada día. La prueba caduca solo después de tres comprobaciones diarias seguidas que coinciden en que el registro falta. Una comprobación que no puede llegar al DNS no cuenta. Una comprobación que encuentra el registro reinicia la cuenta. Mientras la prueba está caducada, las conexiones nuevas se detienen. Las conexiones que ya existen siguen funcionando. Publica el registro otra vez y verifica para restaurarla.

## Estados de la aplicación

La lista de aplicaciones y la página de la aplicación muestran dos estados por aplicación: el estado de la aplicación y el estado de la prueba de su dominio.

| Estado de la aplicación | Qué significa |
|---|---|
| **Pendiente**, con el mensaje "Esta aplicación es un borrador" | Registraste la aplicación y no la has enviado. Nadie puede conectarla. |
| **Pendiente**, con el mensaje "Esperando a que un operador revise esta aplicación" | Enviaste la aplicación. Un operador todavía no ha decidido. |
| **Aprobada** | Un operador la aprobó. Las personas pueden conectarla mientras su dominio esté **Verificado**. Si el dominio no está verificado, nadie puede conectarla hasta que lo verifiques de nuevo. |
| **Rechazada** | Un operador la rechazó. La página muestra el motivo. No se puede enviar de nuevo. Registra una aplicación nueva, o elimina esta. |
| **Suspendida** | Un operador la suspendió. La página muestra el motivo. Se rechazan todas las conexiones a ella hasta que un operador la reactive. |

| Estado del dominio | Qué significa |
|---|---|
| **Sin verificar** | Bella todavía no encontró el registro TXT. |
| **Verificado** | Bella encontró el registro. |
| **Caducado** | El dominio estaba verificado y después el registro faltó en tres comprobaciones diarias seguidas. Publica el registro y verifica de nuevo. |

## El flujo

Tu aplicación inicia sesión a la persona con el proveedor de identidad de Bella, pide a Bella una dirección de configuración y envía a la persona allí para que elija qué compartir. Después lee.

Los ejemplos usan el servicio alojado. En una instalación auto-alojada, cambia `https://api.bella-baxter.io` por la dirección de tu propia API, y cambia el emisor (issuer) por el que publica tu instalación. Léelo en el campo `issuer` de `GET /api/v1/auth/config`, una ruta que no necesita iniciar sesión:

```sh
curl https://api.bella-baxter.io/api/v1/auth/config
```

El emisor del servicio alojado es `https://auth.bella-baxter.io/realms/bella-baxter`. El `setupUrl` del paso 2 se construye con la dirección de la consola de la instalación, así que en una instalación auto-alojada apunta a tu consola.

1. **Inicia sesión a la persona con authorization code y PKCE.** Usa tu client id, el scope `openid offline_access` y el método de desafío `S256`. El proveedor de identidad no muestra pantalla de consentimiento. La página de configuración de Bella es el consentimiento.

   PKCE ata el código a tu sesión. Es obligatorio: el proveedor de identidad rechaza un intercambio de código que no lleve un verificador `S256`.

   Pide el scope `offline_access`. Con él recibes un refresh token que sigue funcionando cuando termina la sesión del navegador de la persona, así que tu aplicación conserva el acceso hasta que la conexión se revoca o caduca. Tu access token no lleva ninguno de los roles de la persona.

   ```http
   GET https://auth.bella-baxter.io/realms/bella-baxter/protocol/openid-connect/auth
       ?client_id=bella-app-<id>
       &response_type=code
       &scope=openid%20offline_access
       &redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback
       &code_challenge=<desafío S256>
       &code_challenge_method=S256
       &state=<aleatorio>
   ```

   El `redirect_uri` de aquí es una dirección registrada para tu aplicación. Después intercambia el código. Tu aplicación es un cliente confidencial, así que envía el client secret:

   ```http
   POST https://auth.bella-baxter.io/realms/bella-baxter/protocol/openid-connect/token
   Content-Type: application/x-www-form-urlencoded

   grant_type=authorization_code
   &client_id=bella-app-<id>
   &client_secret=<client secret>
   &code=<código>
   &redirect_uri=https://app.example.com/callback
   &code_verifier=<verificador>
   ```

   Guarda el refresh token. El access token dura poco. Para obtener uno nuevo, llama a la misma dirección de token con `grant_type=refresh_token`, tu client id y secret, y el refresh token.

2. **Pide a Bella una dirección de configuración.** Envía el access token. El `redirectUri` debe ser igual a una de tus direcciones registradas, carácter por carácter. `state` es opcional, hasta 512 caracteres, y Bella te lo devuelve al final.

   ```http
   POST https://api.bella-baxter.io/api/v1/connected-apps/setup
   Authorization: Bearer <access token>
   Content-Type: application/json

   {
     "redirectUri": "https://app.example.com/connected",
     "state": "b7c1f0"
   }
   ```

   ```json
   {
     "setupUrl": "https://console.bella-baxter.io/connect/setup/<token>",
     "expiresAt": "2026-01-01T12:10:00Z"
   }
   ```

   La dirección funciona una sola vez y dura 10 minutos. Si la dirección de redirección no está registrada, la respuesta es `400` con el tipo de problema `connected-app-redirect-invalid`, y no se crea nada.

3. **Envía a la persona a `setupUrl`.** Ábrela en su navegador. Solo la persona a la que iniciaste sesión puede completarla.

4. **La persona permite o rechaza.** Elige la organización, el proyecto, el entorno, una etiqueta de ámbito opcional y cuánto dura el acceso. Los entornos que no puede leer no aparecen. Una organización que no puede aceptar una conexión se muestra con el motivo. Si tu aplicación no está aprobada, o su dominio no está verificado, la página rechaza la conexión y dice que la aplicación no puede aceptar conexiones nuevas.

5. **El navegador vuelve a tu dirección de redirección.** Bella lo envía a la dirección que diste en el paso 2 y agrega tu `state`:

   ```text
   https://app.example.com/connected?state=b7c1f0
   ```

   Si la persona rechazó, la dirección lleva además `error=access_denied`:

   ```text
   https://app.example.com/connected?error=access_denied&state=b7c1f0
   ```

   Comprueba `state` contra el que enviaste. Rechazar, o cerrar la página, no crea ninguna conexión.

6. **Lee la concesión y los secretos.** Envía el mismo access token y renuévalo con el refresh token cuando caduque.

   ```http
   GET https://api.bella-baxter.io/api/v1/connected-apps/grant
   Authorization: Bearer <access token>
   ```

   ```json
   {
     "organisationName": "Organización de ejemplo",
     "projectSlug": "my-project",
     "environmentSlug": "production",
     "scopeTag": null,
     "expiresAt": null
   }
   ```

   ```http
   GET https://api.bella-baxter.io/api/v1/connected-apps/grant/secrets
   Authorization: Bearer <access token>
   ```

   ```json
   {
     "environmentSlug": "production",
     "environmentName": "Production",
     "secrets": { "DATABASE_URL": "postgres://...", "STRIPE_KEY": "sk_live_..." },
     "version": 42,
     "lastModified": "2026-01-01T12:00:00Z"
   }
   ```

   Es la misma forma de respuesta que al leer los secretos de un entorno con una API key. Si la concesión tiene una etiqueta de ámbito, solo se devuelven los secretos con esa etiqueta. Una etiqueta que ningún secreto lleva da un objeto `secrets` vacío.

La concesión pertenece a la sesión de inicio de sesión que hizo la configuración. Si inicias sesión a la persona otra vez desde cero, empiezas una sesión nueva y repites la configuración.

## Rechazos

- **`403` `connected-app-grant-refused`.** Todos los rechazos son la misma respuesta, con el mismo estado, las mismas cabeceras y el mismo cuerpo. Ocurre cuando la conexión se revocó, caducó o nunca existió. También ocurre cuando la aplicación está suspendida, la persona que la conectó fue eliminada de la organización o está suspendida, la persona ya no puede leer el entorno, el entorno ya no existe, la organización desactivó las aplicaciones conectadas, o la organización exige cifrado de conocimiento cero. La aplicación no puede saber cuál fue, por diseño, así que no sirve para averiguar cosas de la organización. Trátalo como "pide a la persona que se conecte de nuevo". No reintentes en bucle.
- **`503` `connected-app-unavailable`.** Bella no pudo decidir en este momento. No se concedió nada. Inténtalo más tarde.
- **`429` `monthly-quota-exceeded`.** Tu organización superó su cuota de API. Consulta [Quién paga](#quien-paga).
- **`400` `connected-app-redirect-invalid`.** La dirección de redirección de la petición de configuración no es una de tus direcciones registradas.

Un token de aplicación funciona **solo** en estas tres rutas. El resto de la API de Bella lo rechaza.

## Rotación y caché

Cada lectura devuelve los valores actuales, así que un secreto que se rotó se ve en tu siguiente lectura. Bella tampoco guarda en caché la concesión: una revocación se aplica en la siguiente lectura.

- **Usa caché con un intervalo de actualización.** Vuelve a leer cada pocos minutos, o cuando tu aplicación empiece un trabajo que necesite valores recientes. Elige el intervalo según qué tan pronto necesites ver una rotación.
- **No uses webhooks para esto.** Los webhooks pertenecen a la organización de la persona, y una aplicación no puede crear uno. Consulta [Webhooks](/features/webhooks) para ver a qué puede suscribirse la propia organización.
- **Nunca guardes en caché a través de un `403`.** Cuando recibas `connected-app-grant-refused`, descarta lo que guardaste para esa persona. Ya no te corresponde conservar esos valores.
- **No hay helper de SDK.** Llama a las rutas con cualquier cliente HTTP.

## Qué ve la persona

Cada lectura aparece en el log de auditoría de la organización que concedió el acceso, con el actor `aplicación: <nombre de tu aplicación>` y, debajo, la persona que conectó la aplicación. Una lectura rechazada se registra solo cuando la conexión existe. Una petición que no coincide con ninguna conexión, un `503` y un `429` no se registran. La persona ve y revoca cada conexión en **Aplicaciones conectadas**; consulta [Gestionar aplicaciones conectadas](/es/features/connected-apps-manage).

## Para organizaciones

Un propietario o administrador puede desactivar las aplicaciones conectadas para la organización. Mientras estén desactivadas, nadie puede conectar una aplicación y se rechazan todas las conexiones existentes. Una organización que exige cifrado de conocimiento cero no puede aceptar aplicaciones conectadas. Consulta [Gestionar aplicaciones conectadas](/es/features/connected-apps-manage).

## Véase también

- [Gestionar aplicaciones conectadas](/es/features/connected-apps-manage)
- [Webhooks](/features/webhooks)
- [Logs de auditoría](/es/audit/)
- [API keys](/es/features/api-keys)
