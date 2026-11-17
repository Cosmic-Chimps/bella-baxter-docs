# Connecta amb Bella Baxter

> 🌐 **Versió en anglès**: [Connect with Bella Baxter](/features/connected-apps)

"Connecta amb Bella Baxter" permet que una aplicació de tercers llegeixi els secrets d'un entorn, després que la persona propietària d'aquests secrets l'aprovi. L'aplicació mai no rep una API key i mai no veu res que la persona no hagi triat.

Aquesta pàgina és per al desenvolupador que construeix una aplicació. Si ets una persona a qui una aplicació ha demanat connectar-se, o ets propietari o administrador d'una organització, llegeix [Gestiona les aplicacions connectades](/ca/features/connected-apps-manage).

## Què és

- **Només lectura.** Una aplicació pot llegir valors de secrets. No pot crear, canviar ni eliminar res.
- **Un entorn.** La persona tria una organització, un projecte i un entorn. Pot acotar-ho encara més a una etiqueta d'àmbit. Una etiqueta d'àmbit és una etiqueta que porta un secret. Amb una etiqueta d'àmbit, l'aplicació veu només els secrets que porten aquesta etiqueta.
- **La persona aprova a la pàgina de Bella.** La pàgina mostra el nom de l'aplicació, el domini que el desenvolupador ha demostrat que controla i l'organització que ha registrat l'aplicació. No es concedeix res fins que la persona tria **Permet**.
- **La persona pot revocar en qualsevol moment** des d'**Aplicacions connectades** a la consola. La següent lectura de l'aplicació és rebutjada.
- **L'accés pot acabar en una data.** A la pàgina d'aprovació, la persona tria quant dura l'accés: fins que el revoqui, 30 dies, 90 dies o 1 any.

## Qui paga

Cada lectura compta contra la quota d'API de l'organització **propietària de l'aplicació**. Mai no compta contra la persona que ha connectat l'aplicació, i mai no toca la seva pròpia assignació ni les seves pròpies API keys.

Si l'organització propietària de l'aplicació ha superat la seva quota, l'aplicació rep `429` amb el tipus de problema `monthly-quota-exceeded`.

## Registra una aplicació

Has de ser propietari o administrador de la teva organització. Obre **Configuració**, després la pestanya **Aplicacions de desenvolupador** i tria **Registra una aplicació**.

1. **Registra l'aplicació.** Escriu tres coses:
   - **Nom de l'aplicació.** Les persones decideixen segons aquest nom. No es pot canviar després.
   - **Domini.** El domini que controles, per exemple `app.example.com`. No es pot canviar després.
   - **Adreces de redirecció.** Una per línia. Una adreça de redirecció és on Bella envia el navegador de la persona després que permeti o rebutgi. Cadascuna ha d'usar `https`. El seu host ha de ser el teu domini o un subdomini seu.

   En registrar-la es crea un esborrany. L'aplicació queda **Pendent**, ningú no la pot connectar i un operador encara no la veu.
2. **Demostra el domini.** La pàgina de l'aplicació mostra un nom de registre i un valor de registre. Afegeix un registre TXT al teu DNS:

   | Nom del registre | Valor del registre |
   |---|---|
   | `_bella-app-challenge.<el-teu-domini>` | `bella-app-verification=<token>` |

   Aquesta no és la prova de l'inici de sessió únic. Mai no afecta l'SSO. Un domini només pot estar verificat per a aplicacions d'una organització alhora.
3. **Verifica el domini.** Tria **Verifica el domini**. Bella comprova el registre. Els canvis de DNS poden trigar uns minuts a arribar. Pots verificar 10 vegades per hora per a cada aplicació.
4. **Envia per a l'aprovació.** Tria **Envia per a l'aprovació**. El botó funciona quan el domini està **Verificat** i l'aplicació té almenys una adreça de redirecció. L'aplicació continua **Pendent** mentre un operador la revisa.
5. **Obté el secret de client.** Després d'enviar-la, la pàgina de l'aplicació mostra **Rota el secret de client**. Tria'l i confirma. Bella mostra el secret nou una sola vegada. Copia'l i tria **Ja l'he copiat**. Bella no desa el secret i no el pot mostrar de nou. Si el perds, rota'l un altre cop. El secret anterior deixa de funcionar a l'instant.
6. **Espera l'aprovació.** Un operador de Bella aprova l'aplicació. Fins aleshores l'aplicació no pot iniciar la sessió de ningú, perquè el seu client està desactivat. L'ID de client (`bella-app-<id>`) és a la pàgina de l'aplicació en tot moment.

Si un operador rebutja l'aplicació, la pàgina de l'aplicació en mostra el motiu.

Després del registre pots canviar dues coses:

- **Les adreces de redirecció.** Tria **Edita** al costat de les adreces de redirecció. Només ho pots fer mentre l'aplicació està Pendent o Aprovada. Han de continuar al teu domini.
- **El secret de client.** Rota'l com al pas 5.

Una aplicació rebutjada no es pot enviar de nou. Per provar-ho una altra vegada, registra una aplicació nova. Eliminar una aplicació revoca totes les connexions a l'aplicació.

### Prova del domini

Bella torna a comprovar el teu registre TXT cada dia. La prova caduca només després de tres comprovacions diàries seguides que coincideixen que el registre falta. Una comprovació que no pot arribar al DNS no compta. Una comprovació que troba el registre reinicia el compte. Mentre la prova està caducada, les connexions noves s'aturen. Les connexions que ja existeixen continuen funcionant. Publica el registre un altre cop i verifica per restaurar-la.

## Estats de l'aplicació

La llista d'aplicacions i la pàgina de l'aplicació mostren dos estats per aplicació: l'estat de l'aplicació i l'estat de la prova del seu domini.

| Estat de l'aplicació | Què vol dir |
|---|---|
| **Pendent**, amb el missatge "Aquesta aplicació encara no s'ha enviat" | Has registrat l'aplicació i no l'has enviada. Ningú no la pot connectar. |
| **Pendent**, amb el missatge "Esperant que un operador revisi aquesta aplicació" | Has enviat l'aplicació. Un operador encara no ha decidit. |
| **Aprovada** | Un operador l'ha aprovada. Les persones la poden connectar mentre el seu domini estigui **Verificat**. Si el domini no està verificat, ningú no la pot connectar fins que el tornis a verificar. |
| **Rebutjada** | Un operador l'ha rebutjada. La pàgina en mostra el motiu. No es pot enviar de nou. Registra una aplicació nova, o elimina aquesta. |
| **Suspesa** | Un operador l'ha suspesa. La pàgina en mostra el motiu. Es rebutgen totes les connexions fins que un operador la reactivi. |

| Estat del domini | Què vol dir |
|---|---|
| **Sense verificar** | Bella encara no ha trobat el registre TXT. |
| **Verificat** | Bella ha trobat el registre. |
| **Caducat** | El domini estava verificat i després el registre ha faltat en tres comprovacions diàries seguides. Publica el registre i verifica de nou. |

## El flux

La teva aplicació inicia la sessió de la persona amb el proveïdor d'identitat de Bella, demana a Bella una adreça de configuració i envia la persona allà perquè triï què compartir. Després llegeix.

Els exemples fan servir el servei allotjat. En una instal·lació autoallotjada, canvia `https://api.bella-baxter.io` per l'adreça de la teva pròpia API, i canvia l'emissor (issuer) pel que publica la teva instal·lació. Llegeix-lo al camp `issuer` de `GET /api/v1/auth/config`, una ruta que no necessita iniciar la sessió:

```sh
curl https://api.bella-baxter.io/api/v1/auth/config
```

L'emissor del servei allotjat és `https://auth.bella-baxter.io/realms/bella-baxter`. El `setupUrl` del pas 2 es construeix amb l'adreça de la consola de la instal·lació, així que en una instal·lació autoallotjada apunta a la teva consola.

1. **Inicia la sessió de la persona amb authorization code i PKCE.** Usa el teu client id, l'scope `openid offline_access` i el mètode de desafiament `S256`. El proveïdor d'identitat no mostra pantalla de consentiment. La pàgina de configuració de Bella és el consentiment.

   PKCE lliga el codi a la teva sessió. És obligatori: el proveïdor d'identitat rebutja un intercanvi de codi que no porti un verificador `S256`.

   Demana l'scope `offline_access`. Amb ell reps un refresh token que continua funcionant quan acaba la sessió del navegador de la persona, de manera que la teva aplicació conserva l'accés fins que la connexió es revoca o caduca. El teu access token no porta cap dels rols de la persona.

   ```http
   GET https://auth.bella-baxter.io/realms/bella-baxter/protocol/openid-connect/auth
       ?client_id=bella-app-<id>
       &response_type=code
       &scope=openid%20offline_access
       &redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback
       &code_challenge=<desafiament S256>
       &code_challenge_method=S256
       &state=<aleatori>
   ```

   El `redirect_uri` d'aquí és una adreça registrada per a la teva aplicació. Després intercanvia el codi. La teva aplicació és un client confidencial, així que envia el client secret:

   ```http
   POST https://auth.bella-baxter.io/realms/bella-baxter/protocol/openid-connect/token
   Content-Type: application/x-www-form-urlencoded

   grant_type=authorization_code
   &client_id=bella-app-<id>
   &client_secret=<client secret>
   &code=<codi>
   &redirect_uri=https://app.example.com/callback
   &code_verifier=<verificador>
   ```

   Desa el refresh token. L'access token dura poc. Per obtenir-ne un de nou, crida la mateixa adreça de token amb `grant_type=refresh_token`, el teu client id i secret, i el refresh token.

2. **Demana a Bella una adreça de configuració.** Envia l'access token. El `redirectUri` ha de ser igual a una de les teves adreces registrades, caràcter per caràcter. `state` és opcional, fins a 512 caràcters, i Bella te'l retorna al final.

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

   L'adreça funciona una sola vegada i dura 10 minuts. Si l'adreça de redirecció no està registrada, la resposta és `400` amb el tipus de problema `connected-app-redirect-invalid`, i no es crea res.

3. **Envia la persona a `setupUrl`.** Obre-la al seu navegador. Només la persona a qui has iniciat la sessió la pot completar.

4. **La persona permet o rebutja.** Tria l'organització, el projecte, l'entorn, una etiqueta d'àmbit opcional i quant dura l'accés. Els entorns que no pot llegir no apareixen. Una organització que no pot acceptar una connexió es mostra amb el motiu. Si la teva aplicació no està aprovada, o el seu domini no està verificat, la pàgina rebutja la connexió i diu que l'aplicació no pot acceptar connexions noves.

5. **El navegador torna a la teva adreça de redirecció.** Bella l'envia a l'adreça que has donat al pas 2 i afegeix el teu `state`:

   ```text
   https://app.example.com/connected?state=b7c1f0
   ```

   Si la persona ha rebutjat, l'adreça porta a més `error=access_denied`:

   ```text
   https://app.example.com/connected?error=access_denied&state=b7c1f0
   ```

   Comprova `state` contra el que has enviat. Rebutjar, o tancar la pàgina, no crea cap connexió.

6. **Llegeix la concessió i els secrets.** Envia el mateix access token i renova'l amb el refresh token quan caduqui.

   ```http
   GET https://api.bella-baxter.io/api/v1/connected-apps/grant
   Authorization: Bearer <access token>
   ```

   ```json
   {
     "organisationName": "Organització d'exemple",
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

   És la mateixa forma de resposta que en llegir els secrets d'un entorn amb una API key. Si la concessió té una etiqueta d'àmbit, només es retornen els secrets amb aquesta etiqueta. Una etiqueta que cap secret porta dona un objecte `secrets` buit.

La concessió pertany a la sessió d'inici de sessió que ha fet la configuració. Si inicies la sessió de la persona un altre cop des de zero, comences una sessió nova i repeteixes la configuració.

## Rebuigs

- **`403` `connected-app-grant-refused`.** Tots els rebuigs són la mateixa resposta, amb el mateix estat, les mateixes capçaleres i el mateix cos. Passa quan la connexió s'ha revocat, ha caducat o no ha existit mai. També passa quan l'aplicació està suspesa, la persona que l'ha connectada ha estat eliminada de l'organització o està suspesa, la persona ja no pot llegir l'entorn, l'entorn ja no existeix, l'organització ha desactivat les aplicacions connectades, o l'organització exigeix dispositius registrats. L'aplicació no pot saber quina ha estat, per disseny, així que no serveix per esbrinar coses de l'organització. Tracta-ho com "demana a la persona que es connecti de nou". No tornis a provar en bucle.
- **`503` `connected-app-unavailable`.** Bella no ha pogut decidir en aquest moment. No s'ha concedit res. Torna-ho a provar més tard.
- **`429` `monthly-quota-exceeded`.** La teva organització ha superat la seva quota d'API. Consulta [Qui paga](#qui-paga).
- **`400` `connected-app-redirect-invalid`.** L'adreça de redirecció de la petició de configuració no és una de les teves adreces registrades.

Un token d'aplicació funciona **només** en aquestes tres rutes. La resta de l'API de Bella el rebutja.

## Rotació i memòria cau

Cada lectura retorna els valors actuals, així que un secret que s'ha rotat es veu a la teva següent lectura. Bella tampoc no desa la concessió a la memòria cau: una revocació s'aplica a la següent lectura.

- **Usa memòria cau amb un interval d'actualització.** Torna a llegir cada pocs minuts, o quan la teva aplicació comenci una feina que necessiti valors recents. Tria l'interval segons com aviat necessitis veure una rotació.
- **No usis webhooks per a això.** Els webhooks pertanyen a l'organització de la persona, i una aplicació no en pot crear cap. Consulta [Webhooks](/features/webhooks) per veure a què es pot subscriure la mateixa organització.
- **Mai no desis a la memòria cau a través d'un `403`.** Quan rebis `connected-app-grant-refused`, descarta el que has desat per a aquella persona. Ja no et correspon conservar aquests valors.
- **No hi ha cap helper d'SDK.** Crida les rutes amb qualsevol client HTTP.

## Què veu la persona

Cada lectura apareix al log d'auditoria de l'organització que ha concedit l'accés, amb l'actor `aplicació: <nom de la teva aplicació>` i, a sota, la persona que ha connectat l'aplicació. Una lectura rebutjada es registra només quan la connexió existeix. Una petició que no coincideix amb cap connexió, un `503` i un `429` no es registren. La persona veu i revoca cada connexió a **Aplicacions connectades**; consulta [Gestiona les aplicacions connectades](/ca/features/connected-apps-manage).

## Per a organitzacions

Un propietari o administrador pot desactivar les aplicacions connectades per a l'organització. Mentre estiguin desactivades, ningú no pot connectar una aplicació i es rebutgen totes les connexions existents. Una organització que exigeix dispositius registrats no pot acceptar aplicacions connectades. Consulta [Gestiona les aplicacions connectades](/ca/features/connected-apps-manage).

## Vegeu també

- [Gestiona les aplicacions connectades](/ca/features/connected-apps-manage)
- [Webhooks](/features/webhooks)
- [Logs d'auditoria](/ca/audit/)
- [API keys](/features/api-keys)
