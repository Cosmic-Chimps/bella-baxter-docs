# Transfereix un projecte a una altra organització

> 🌐 **Versió en anglès**: [Transfer a project to another organisation](/features/project-transfer)

Una transferència mou un projecte d'una organització a una altra. Bella ho fa en dos passos. Primer copia el projecte a l'organització que el rep, com a projecte nou. Després elimina el projecte a l'organització de la qual surt.

Llegeix això abans de començar:

- **Una transferència completada no es pot desfer.** El projecte original s'elimina.
- **La confiança es reinicia.** Les autoritats de certificació, les claus de signatura de tokens i les identitats de càrrega de treball del projecte es creen de nou a l'organització que el rep. Tot el que confiava en les anteriors s'ha d'actualitzar.
- **Es revoquen totes les API keys.** Els serveis que llegeixen els secrets del projecte necessiten claus noves.
- **L'historial de versions no s'endú.** Només es mou el valor actual de cada secret. Llegeix qualsevol versió anterior que necessitis abans de transferir.
- **Els entorns arxivats no s'enduen.** S'eliminen juntament amb el projecte original.

En aquesta pàgina, l'**origen** és l'organització de la qual surt el projecte. La **destinació** és l'organització que el rep. Una **execució** és un intent de transferència.

## Qui pot transferir un projecte

Has de ser el **propietari (Owner) de les dues organitzacions**, l'origen i la destinació. Un administrador (Admin) no pot transferir un projecte. Una persona suspesa en qualsevol de les dues organitzacions no compta com a propietària, així que no pot iniciar, reprendre ni abandonar una transferència.

La destinació no aprova la transferència en un pas a part, perquè la mateixa persona és propietària de totes dues.

Només una persona pot transferir un projecte. Es rebutja qualsevol API key, incloses les personals. També es rebutja una sessió en què un operador actua en nom teu.

## Abans de començar

Comprova cada punt. Bella rebutja la transferència fins que es treguin els elements que la bloquegen.

**Treu el que bloqueja una transferència.** La vista prèvia llista cada element per entorn i nom:

- **Claus TOTP.** Bella no pot llegir de tornada una llavor TOTP, així que no la pot copiar. Elimina les claus i torna a registrar-les a la destinació després.
- **Leases actius.** Són els leases de secrets que Bella registra, que pots veure i revocar. Espera que caduquin o revoca'ls.
- **Destinacions de desplegament de certificats** als entorns del projecte.
- **Delegacions DNS** als entorns del projecte.
- **Àmbits d'escaneig de Scout i dominis reclamats** als entorns del projecte.

Bella ho comprova de nou en començar l'execució i just abans d'eliminar l'origen. Un lease o una destinació creats mentre l'execució treballa l'aturen.

**Prepara els proveïdors:**

- **El proveïdor per defecte no necessita res.** Els seus valors passen al proveïdor per defecte de la destinació.
- **Assigna cada proveïdor propi que guardi valors.** Per a cada un, tria un proveïdor del mateix tipus a la destinació. La vista prèvia llista els proveïdors de la destinació. El proveïdor ha d'existir, no estar eliminat i poder guardar secrets. Sense una assignació per a cada un, la transferència es rebutja. Bella mai no descarta valors en silenci.
- **Un proveïdor propi que s'ha eliminat a Bella però continua guardant valors no es pot assignar.** Manté rebutjada la transferència.
- **No assignis al mateix emmagatzematge.** Si el proveïdor que tries a la destinació arriba al mateix emmagatzematge que el proveïdor de l'origen, amb el mateix slug, l'execució s'atura en començar. Tria un altre proveïdor o dona al projecte un slug nou.
- **Concedeix primer l'accés a la destinació al teu núvol.** Un proveïdor d'AWS o de GCP està lligat a la identitat de l'organització. Abans de la transferència, concedeix accés a la identitat de la destinació al teu compte del núvol i crea el proveïdor a la destinació. Consulta [Proveïdors](/features/providers).

**Comprova el slug.** El projecte conserva el seu slug si la destinació no l'ha fet servir mai. Un slug que va tenir un projecte eliminat compta com a usat. Si està en ús, tria un slug nou. Un slug té de 2 a 63 caràcters: lletres minúscules i dígits, amb guions simples entre ells, i sense guió al principi ni al final.

**Comprova els límits del pla de la destinació.** Bella comprova que la destinació pugui guardar un projecte més i que el seu pla permeti tants entorns per projecte com en té el projecte. La vista prèvia també mostra els límits de proveïdors propis i de membres de l'equip. Una transferència no els pot augmentar, així que mai no bloquegen.

**Planifica el reinici de la confiança.** Fes una llista dels hosts que confien en l'autoritat de certificació SSH o PKI del projecte, de les càrregues de treball que fan servir identitats SPIFFE i de qualsevol configuració de CI o Kubernetes que contingui un ID d'entorn. Tots canvien.

**Avisa les persones afectades.** Els membres que no són actius a la destinació perden l'accés. Els serveis perden les seves API keys. Mentre la transferència s'executa, ningú no pot canviar el projecte.

## Què es mou, què es queda i què has de refer

| Element | Què passa | Què fas |
|---|---|---|
| Nom, descripció i etiquetes del projecte | Es copien | Res |
| Entorns | Es copien a la destinació. Cada un rep un ID nou. Es copien el seu nom, la seva descripció, la seva política de leases i la seva configuració SPIFFE | Actualitza qualsevol configuració de CI o Kubernetes que contingui un ID d'entorn |
| Secrets | El valor actual de cada secret es copia i es xifra de nou per a la destinació. Es copien la seva descripció, les seves etiquetes, el seu tipus, la seva caducitat i les dades del certificat | Res |
| Historial de versions dels secrets | No es copia. S'elimina juntament amb el projecte d'origen | Llegeix qualsevol versió anterior que necessitis abans de començar |
| Secrets del projecte (globals) | Es copien | Res |
| Etiquetes d'àmbit | Es copien amb cada secret | Res |
| Polítiques de rotació | Es copien. La data de la propera rotació compta des del moment de la còpia. Una rotació en curs no s'endú | Res |
| Webhooks | Es creen de nou a la destinació, amb el mateix secret de signatura, així que un receptor que comprova la signatura continua funcionant. Un webhook que replica el seu secret de signatura en un proveïdor conserva aquest vincle només si la persona que el va crear és membre actiu de la destinació. Si no, el vincle es descarta i apareix a **No mogut** | Res, o crea el vincle de nou a la destinació |
| Canals de notificació | Es creen de nou a la destinació, amb la seva configuració | Res |
| Els valors del proveïdor per defecte | Es copien al proveïdor per defecte de la destinació | Res |
| Proveïdors propis | Els valors van al proveïdor que has assignat a la destinació. Els proveïdors que no guarden cap valor del projecte no s'assignen a la destinació | Assigna cada un abans de la transferència |
| Membres | Un membre arriba amb el seu rol només si és membre actiu de la destinació. Tots els altres es descarten. La vista prèvia els llista. La persona que inicia l'execució passa a ser la propietària del projecte nou i de cada entorn nou | Afegeix les persones descartades a la destinació i després al projecte |
| Grups | Es descarten. Un grup existeix només a la seva pròpia organització. La vista prèvia els llista | Assigna al projecte grups de la destinació |
| API keys | Es revoquen quan s'elimina l'origen. Això abasta tota clau limitada al projecte o a un dels seus entorns. La vista prèvia les llista | Crea claus noves a la destinació i lliura-les als teus serveis |
| Aplicacions connectades | Les connexions es revoquen abans d'eliminar l'origen. La vista prèvia les llista pel nom de l'aplicació | La persona torna a connectar l'aplicació a la destinació |
| Autoritat de certificació PKI | Es crea una autoritat nova a la destinació, amb una clau nova i adreces noves. El vincle amb el magatzem de secrets que la guarda no es copia | Fes que cada part que hi confia confiï en l'autoritat nova i emet els certificats de nou |
| Autoritat de certificació SSH | Es crea una autoritat nova a la destinació, amb una clau nova | Fes que cada host confiï en l'autoritat nova |
| Identitats de càrrega de treball | Es creen de nou amb un SPIFFE ID nou. El trust domain SPIFFE és el slug de l'organització, així que tots els SPIFFE ID canvien. Una identitat revocada no es crea de nou. Una desactivada continua desactivada. No s'enduen els vincles amb nodes, els vincles amb instàncies d'AWS, les identitats emeses (SVID) ni els leases | Actualitza cada càrrega de treball i política que nomeni un SPIFFE ID |
| Trust domains (els emissors OIDC que un entorn accepta per a l'accés sense claus) | Es creen de nou amb el mateix emissor, les mateixes regles de claims i les mateixes audiències. Un de desactivat continua desactivat | Res |
| Claus de signatura de tokens de l'entorn | Es creen claus noves | Actualitza tot el que verifiqui tokens amb les claus anteriors |
| Claus TOTP | Bloquegen la transferència | Elimina-les primer i torna a registrar-les a la destinació |
| Leases actius | Bloquegen la transferència | Espera que caduquin o revoca'ls |
| Destinacions de desplegament de certificats, delegacions DNS, àmbits d'escaneig de Scout i dominis reclamats | Bloquegen la transferència | Treu-los primer i torna a configurar-los a la destinació |
| Credencials dinàmiques de bases de dades | Bella no en guarda registre, així que no bloquegen. Els seus leases caduquen al teu motor de base de dades | Res |
| Entorns arxivats | No s'enduen. La vista prèvia els llista, amb el seu nombre de secrets, i s'eliminen juntament amb l'origen | Res |
| Troballes de seguretat | No es copien. La destinació torna a escanejar el projecte | Res |
| Historial d'auditoria | Es queda a l'origen com a registre | Llegeix l'historial anterior del projecte a l'origen |
| Historial d'ús i de facturació | Es queda a l'origen | Res |
| El slug del projecte | Es conserva si la destinació no l'ha fet servir mai. Si no, en tries un de nou | Actualitza tot el que nomeni el slug, si ha canviat |
| IDs del projecte i dels entorns | Nous | Actualitza tot el que guardi un ID |

## Executa la transferència

Una transferència té tres etapes: una vista prèvia, una confirmació i una execució que treballa en segon pla.

### La vista prèvia

La vista prèvia no canvia res. No s'escriu cap registre i totes les API keys continuen funcionant. Mostra:

- què es mou, amb el nombre de secrets de cada entorn i proveïdor (`moves`);
- què es crea de nou, a cada entorn (`recreated`);
- quines API keys i aplicacions connectades es revoquen (`revoked`);
- quins membres i grups es descarten, quins entorns arxivats no s'enduen i quins tipus d'historial es queden enrere (`dropped`);
- què bloqueja la transferència (`blocks`);
- quins proveïdors encara necessiten una assignació i quines assignacions no es poden fer servir (`providersNeedingMapping`, `invalidMappings`);
- les assignacions en vigor (`mappedProviders`);
- els proveïdors de la destinació que pots assignar, cadascun amb l'id, el nom i el tipus (`targetProviders`). Fes servir aquests ids a `providerMappings`;
- el slug que tindria el projecte a la destinació i si està lliure (`targetSlug`, `targetSlugAvailable`);
- si a la destinació li falta una clau d'organització que el projecte necessita (`targetUnencrypted`);
- els límits del pla de la destinació, abans i després (`planLimits`);
- què destrueix eliminar el projecte d'origen, amb els mateixos recomptes que la [vista prèvia d'eliminació d'un projecte](/features/projects#delete-a-project) (`deletionPreview`);
- advertiments (`warnings`);
- un digest que envies de tornada en iniciar (`previewDigest`).

Els advertiments són:

| Advertiment | Què significa |
|---|---|
| `trust-reset` | Els hosts, les parts que hi confien i les càrregues de treball han de confiar en les autoritats i identitats noves. Els ID d'entorn canvien. Es mostra quan el projecte té almenys un entorn |
| `ca-store-binding-required` | Un entorn que arriba tindria més d'un magatzem de tipus Vault. Un administrador de la destinació ha de triar quin guarda les autoritats de certificació noves |
| `dynamic-credentials-untracked` | Les credencials dinàmiques de bases de dades no deixen registre a Bella, així que els seus leases no es comproven. Es mostra sempre |
| `same-storage-checked-at-start` | Un proveïdor que has assignat es comprova quan comença la transferència, per assegurar que no arriba a l'emmagatzematge de l'origen. Es mostra quan has assignat almenys un proveïdor propi |

Cada entrada de `planLimits` té un `resource`, un `limit` (`-1` vol dir sense límit), `current`, `after`, `exceeded` i una `note`. En proveïdors propis i membres de l'equip, `current` i `after` van buits i `exceeded` és sempre fals.

Si Bella no pot comptar alguna cosa, la vista prèvia es rebutja. Mai no mostra un zero del qual no estigui segura.

### A la consola

Has de ser propietari de l'organització del projecte i ser propietari d'almenys una altra organització. Ningú més no veu l'acció.

1. Obre el projecte i tria **Configuració**.
2. A la secció **Organització**, tria **Transfereix a una altra organització**. El diàleg s'anomena «Transfereix *nom del projecte* a una altra organització».
3. **1. Organització de destinació.** Tria l'organització. Només apareixen les organitzacions de les quals ets propietari.
4. **2. Proveïdors.** Aquest pas apareix només quan un proveïdor propi guarda valors del projecte. Per a cada proveïdor, tria a la llista un proveïdor de la destinació. La llista mostra només els proveïdors de la destinació del mateix tipus, amb el nom i el tipus. El magatzem per defecte no és a la llista, perquè s'assigna sol. Si la destinació no té cap proveïdor d'aquest tipus, el pas ho diu i no pots iniciar: afegeix-ne un a l'organització de destinació i obre de nou el diàleg.
5. **3. Slug del projecte.** El camp comença amb el slug del projecte. Conserva'l o escriu-ne un de nou. La consola et diu si el slug està lliure a la destinació.
6. **4. Què passarà.** Llegeix la vista prèvia. Comença amb un advertiment titulat **Tot el que confia en aquest projecte hi ha de tornar a confiar**. A sota apareixen què es mou, què es crea de nou, què deixa de funcionar, què no s'endú i què s'elimina aquí.
7. **5. Confirma.** Escriu el slug del projecte.
8. Tria **Inicia la transferència**.

El botó continua desactivat fins que res no ho impedeix. El diàleg llista cada motiu sota el botó, per exemple un proveïdor que necessita una destinació, alguna cosa que bloqueja la transferència, un slug en ús, un límit del pla o una confirmació que no coincideix.

Després la consola obre la pàgina de l'execució, a `/project-transfers/` seguit de l'id de l'execució. La pàgina mostra l'estat, la fase i el progrés. També mostra **No mogut** quan alguna cosa no s'ha mogut. Quan la transferència acaba, mostra un botó per obrir el projecte a la destinació.

Mentre hi ha una transferència en curs, la pàgina **Configuració** del projecte mostra **Hi ha una transferència en curs** a la secció **Organització**, amb un enllaç, **Mostra la transferència**, a la pàgina de l'execució.

### Amb l'API

Totes les rutes necessiten la sessió d'una persona. Els exemples fan servir l'adreça allotjada. `{projectRef}` és l'id o el slug del projecte.

**1. Vista prèvia.**

```http
POST https://api.bella-baxter.io/api/v1/projects/{projectRef}/transfer/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetTenantId": "<id de l'organització de destinació>",
  "providerMappings": [
    { "sourceProviderId": "<proveïdor a l'origen>", "targetProviderId": "<proveïdor a la destinació>" }
  ],
  "targetSlug": "my-api"
}
```

`providerMappings` té una entrada per cada proveïdor propi que guarda valors del projecte. Pot estar buit. Omet `targetSlug` per conservar el slug del projecte. La resposta inclou `previewDigest`, que envies de tornada al pas següent.

**2. Inicia.** Envia el mateix cos, més el slug del projecte i el digest:

```http
POST https://api.bella-baxter.io/api/v1/projects/{projectRef}/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetTenantId": "<id de l'organització de destinació>",
  "providerMappings": [
    { "sourceProviderId": "<proveïdor a l'origen>", "targetProviderId": "<proveïdor a la destinació>" }
  ],
  "targetSlug": "my-api",
  "confirmProjectSlug": "my-api",
  "previewDigest": "<digest de la vista prèvia>"
}
```

Bella construeix la vista prèvia de nou amb l'estat actual i compara el seu digest amb el teu. Si el projecte ha canviat des de la teva vista prèvia, l'inici es rebutja amb `project-transfer-preview-stale`. La resposta és `202`, amb l'execució al cos i la seva adreça a la capçalera `Location`: `/api/v1/project-transfers/{runId}`.

Un projecte té un sol registre d'execució. El seu id surt del projecte, així que no canvia si abandones una execució i comences de nou.

**3. Segueix l'execució.**

```http
GET https://api.bella-baxter.io/api/v1/project-transfers/{runId}
Authorization: Bearer <token>
```

| Camp | Què conté |
|---|---|
| `id` | L'id de l'execució |
| `state` | `queued`, `running`, `stopped`, `completed` o `abandoned` |
| `phase` | El pas en què és l'execució, o el pas en què s'ha aturat: `check`, `createtarget`, `copyvalues`, `copyconfiguration`, `verify` o `retiresource` |
| `failureCode` | Per què s'ha aturat una execució aturada. Consulta [Si una transferència s'atura](#si-una-transferencia-s-atura) |
| `source`, `target` | L'organització i el projecte de cada costat: `tenantId`, `tenantSlug`, `projectId`, `projectSlug` |
| `startedBy`, `startedByName` | El propietari que ha iniciat l'execució |
| `requestedAt`, `heartbeatAt`, `completedAt` | Quan s'ha demanat l'execució, quan va donar senyals de vida per última vegada i quan s'ha completat |
| `progress` | Comptadors d'entorns, secrets d'entorn, secrets globals, webhooks, canals de notificació, identitats de càrrega de treball i trust domains. Cada un té `created`, `copied` i `verified` |
| `notMoved` | Cada element que l'execució no ha pogut moure, amb el seu `subject`, `name`, `reason`, `count` i on és |

`GET /api/v1/projects/{projectRef}/transfer` retorna l'execució actual del projecte. Respon `404` quan no n'hi ha cap. És per al propietari de l'organització del projecte.

Pots llegir una execució pel seu id si ets propietari de l'origen o de la destinació. Qualsevol altra persona rep `404`, així que una execució no revela que existeix.

Cap resposta d'aquestes rutes no conté un valor de secret, una clau ni el nom d'un secret. Porten recomptes i noms de coses com proveïdors i entorns.

No hi ha cap ordre de la CLI per a una transferència.

## Mentre una transferència s'executa

Una execució passa per aquestes fases, en aquest ordre:

| Fase | Què fa Bella |
|---|---|
| `check` | Ho comprova tot de nou amb l'estat actual: que continues sent propietari de les dues organitzacions, que la destinació és activa, que res no bloqueja, el xifratge, el slug, els límits del pla de la destinació i que cap proveïdor assignat arribi a l'emmagatzematge de l'origen. No escriu res |
| `createtarget` | Crea el projecte, la seva clau de dades, els seus entorns, les seves assignacions de proveïdors i els membres que arriben |
| `copyvalues` | Copia els valors dels secrets, xifrats de nou per a la destinació |
| `copyconfiguration` | Crea els webhooks, els canals de notificació, les identitats de càrrega de treball i els trust domains |
| `verify` | Llegeix cada valor a l'origen i a la destinació i els compara. Espera fins que l'execució tingui 30 segons, perquè tots els servidors hagin vist que el projecte és de només lectura. No s'elimina res fins que això passa |
| `retiresource` | Comprova de nou que ets propietari de les dues organitzacions i que res no bloqueja. Després acaba les connexions de les aplicacions connectades, elimina el projecte d'origen, revoca les seves API keys i escriu les files d'auditoria |

Mentre treballa:

- **El projecte és de només lectura als dos costats.** Les lectures funcionen. Els canvis al projecte d'origen, o al projecte que arriba a la destinació, es rebutgen amb `project-transfer-in-progress`.
- **El treball programat es pausa per al projecte.** Les rotacions de secrets, les rotacions de secrets de webhooks i els avisos de caducitat esperen fins que acabi l'execució. Després s'executen de nou.
- **Una execució alhora.** Es rebutja una segona transferència del mateix projecte.
- **L'origen s'elimina al final.** Bella elimina el projecte d'origen només després de comprovar cada valor a la destinació.

Una execució que no dona senyals de vida durant 30 minuts es mostra com a `stopped` amb el codi de fallada `abandoned`. La pots reprendre o abandonar.

## Si una transferència s'atura

Una execució que falla a mitges s'atura. El projecte d'origen queda intacte i de només lectura. L'execució mostra per què s'ha aturat i què no s'ha mogut. Llavors tries una de dues accions. Les dues exigeixen que siguis propietari de **les dues** organitzacions. Les dues responen `202` amb l'execució. Només les pots fer servir mentre l'execució és `stopped`.

- **Reprèn.** L'execució continua al pas en què s'ha aturat. Un valor que ja ha arribat no es copia de nou. Si l'execució s'ha aturat perquè alguns valors de la destinació no coincidien amb l'origen, en reprendre es copien de nou només aquests valors i es verifica una altra vegada. El botó de la consola és **Reprèn**.

  ```http
  POST https://api.bella-baxter.io/api/v1/project-transfers/{runId}/resume
  Authorization: Bearer <token>
  Content-Type: application/json

  { "acceptNotMoved": true }
  ```

  El cos és obligatori. Envia `{}` per reprendre sense acceptar res. Envia `{"acceptNotMoved": true}` només si acceptes perdre els elements llistats a `notMoved`. La consola ho mostra com la casella **Accepta els elements no moguts**. Apareix només quan hi ha elements.

  La teva acceptació cobreix exactament la llista que has vist. Si la llista és diferent quan Bella està a punt d'eliminar l'origen, l'execució s'atura de nou amb `not-moved`, oblida la teva acceptació i no elimina res. Llavors veus la llista nova i tornes a decidir. Una represa sense `acceptNotMoved` esborra qualsevol acceptació anterior.
- **Abandona.** Bella elimina el projecte creat a mitges a la destinació, amb els valors copiats en ell, i torna a permetre escriure al projecte d'origen. El botó de la consola és **Abandona**, i et demana confirmació.

  ```http
  POST https://api.bella-baxter.io/api/v1/project-transfers/{runId}/abandon
  Authorization: Bearer <token>
  ```

Si ets propietari de només una de les dues organitzacions, reprendre i abandonar responen `403` amb `project-transfer-owner-required`. Si no ets propietari de cap, responen `404`.

### Codis de fallada

| `failureCode` | Què significa | Què fer |
|---|---|---|
| `blocked` | Ha aparegut alguna cosa que bloqueja una transferència mentre l'execució treballava: una clau TOTP, un lease, una destinació de desplegament de certificats, una delegació DNS, o un àmbit o domini reclamat de Scout | Treu-ho i reprèn |
| `owner-lost` | La persona que ha iniciat l'execució ja no és propietària activa de les dues organitzacions. Un propietari suspès en qualsevol de les dues no compta | Restaura el rol de propietari d'aquesta persona i reprèn. O abandona |
| `target-inactive` | L'organització de destinació ja no és activa | Espera que torni a ser activa i reprèn. O abandona |
| `provider-shares-storage` | Un proveïdor que has assignat arriba al mateix emmagatzematge que el proveïdor al qual substitueix. Copiar sobreescriuria l'original | Abandona i comença de nou amb un altre proveïdor o un slug nou |
| `provider-unavailable` | Un proveïdor assignat ja no existeix, no es pot fer servir o no s'ha pogut arribar-hi per comprovar o copiar valors | Arregla el proveïdor i reprèn. Si s'ha eliminat, abandona i comença de nou, perquè les assignacions es fixen quan comença l'execució |
| `store-unavailable` | No s'ha pogut llegir o escriure un magatzem de secrets, un magatzem de claus o la base de dades. Bella no endevina | Comprova que els magatzems siguin accessibles i reprèn |
| `not-moved` | Alguns elements no s'han mogut i no ho has acceptat. O els valors de l'origen i de la destinació no coincidien quan Bella els ha verificat. L'origen no s'ha eliminat | Llegeix **No mogut**. Reprèn per copiar de nou els valors que no coincidien. Per a un element que no es pot moure, arregla la causa, o reprèn amb `acceptNotMoved` si no el necessites. O abandona |
| `grants-not-ended` | No s'ha pogut acabar l'accés d'una aplicació connectada. L'origen no s'ha eliminat | Reprèn per tornar-ho a provar |
| `keys-not-revoked` | No s'han pogut revocar totes les API keys del projecte. L'origen no s'ha eliminat | Reprèn per tornar-ho a provar |
| `slug-taken` | El slug ja està en ús a la destinació | Abandona i comença de nou amb un altre slug |
| `target-unencrypted` | Els valors del projecte estan xifrats i la destinació no té clau d'organització | Configura les claus de xifratge de l'organització a la destinació i reprèn |
| `plan-limit` | Se superaria el pla de la destinació: projectes, o entorns per projecte | Allibera capacitat a la destinació o canvia'n el pla, i reprèn |
| `abandoned` | L'execució no ha donat senyals de vida durant 30 minuts, per això es mostra com a aturada. No és el mateix que l'estat `abandoned` | Reprèn o abandona |

### Elements que no s'han mogut

Cada entrada de `notMoved` anomena un `subject`, amb un `reason`. Els motius que una transferència pot informar són:

- `Undecryptable`: cap clau obre el valor. Es va deixar exactament com estava. Restaura la clau o torna a introduir el valor.
- `WriteFailed`: el valor o l'ajust no s'ha pogut escriure a la destinació, el que hi ha a la destinació no coincideix, o no té destinació. Comprova que el magatzem de destinació accepta escriptures i reprèn: els valors es copien de nou. Això cobreix també un vincle de rèplica de webhook que s'ha descartat, un webhook o canal d'un entorn que no s'endú i un proveïdor que guarda valors però no té assignació.
- `Unreadable`: no s'ha pogut llegir un registre del magatzem de secrets.

## Després de la transferència

Fes això en ordre:

1. **Crea API keys noves** a la destinació i lliura-les als teus serveis.
2. **Afegeix les persones que s'han descartat** i assigna al projecte grups de la destinació.
3. **Reinicia la confiança.** Fes que els hosts confiïn en l'autoritat SSH nova i que les parts que hi confien confiïn en l'autoritat PKI nova. Emet els certificats de nou. Actualitza les càrregues de treball i les polítiques que nomenin un SPIFFE ID.
4. **Actualitza els ID desats.** Canvia l'ID d'entorn a la configuració de CI i de Kubernetes.
5. **Reconnecta les aplicacions connectades.** Cada persona torna a connectar la seva aplicació.
6. **Torna a configurar el que has tret:** claus TOTP, destinacions de desplegament de certificats, delegacions DNS i àmbits d'escaneig de Scout.
7. **Comprova una lectura.** Llegeix un secret amb una clau nova per confirmar que els serveis funcionen.

## Xifratge de coneixement zero

Pots transferir un projecte tant si alguna de les dues organitzacions exigeix el xifratge de coneixement zero com si no. Les rutes de la transferència no demanen un dispositiu registrat. Bella obre els valors al servidor i els xifra de nou per a la destinació. Mai no et retorna un valor ni una clau durant una transferència.

Es rebutja un cas: el projecte d'origen està xifrat amb una clau d'organització i la destinació no té clau d'organització. El propietari de la destinació configura primer les claus de xifratge de l'organització. La còpia es xifra llavors amb una clau nova a la destinació.

## Errors

Cada rebuig abans que comenci una execució no canvia res. El `type` de `person-only`, `impersonation-refused` i `plan-limit-exceeded` és el nom sol. En qualsevol altre problema, el `type` és `https://bellabaxter.dev/problems/` seguit del nom de la taula.

| Estat | Tipus de problema | Quan | Què fer |
|---|---|---|---|
| `403` | `person-only` | Qui crida és una API key | Inicia la sessió com a persona |
| `403` | `impersonation-refused` | Un operador actua en nom teu | Inicia la sessió tu mateix |
| `403` | `project-transfer-owner-required` | No ets propietari de l'organització d'origen. També en reprendre i abandonar quan ets propietari de només una de les dues organitzacions | Demana ajuda a un propietari |
| `400` | `project-transfer-target-refused` | La destinació no existeix, no és activa, és el mateix origen o no en ets propietari. Bella dona una sola resposta per a tots aquests casos, així que no revela si una organització existeix | Comprova l'ID de la destinació i el teu rol en ella |
| `409` | `project-transfer-blocked` | Alguna cosa bloqueja la transferència. La resposta llista cada element | Treu-los i torna-ho a provar |
| `422` | `project-transfer-provider-unmapped` | Un proveïdor propi que guarda valors no té assignació | Assigna'l |
| `422` | `project-transfer-provider-mapping-invalid` | Una assignació anomena un proveïdor que no existeix a la destinació, està eliminat, no pot guardar secrets o és d'un altre tipus | Tria un proveïdor del mateix tipus |
| `409` | `project-transfer-target-unencrypted` | El projecte d'origen està xifrat i la destinació no té clau d'organització | Configura el xifratge a la destinació |
| `402` | `plan-limit-exceeded` | La transferència superaria un límit del pla de la destinació. La resposta anomena el `resource` i el `limit` | Allibera capacitat a la destinació o canvia'n el pla |
| `409` | `project-transfer-slug-taken` | El slug l'utilitza a la destinació un projecte actiu o eliminat. Això val també per al slug que has triat | Envia un altre `targetSlug` |
| `422` | `project-transfer-slug-invalid` | El slug nou incompleix les regles de slug | Tria un slug vàlid |
| `422` | `project-transfer-confirmation-missing` | Falta `confirmProjectSlug` o `previewDigest` | Envia'ls tots dos |
| `422` | `project-transfer-confirmation-mismatch` | El slug que has escrit no és el del projecte | Escriu-lo exactament |
| `409` | `project-transfer-preview-stale` | El projecte o les teves tries han canviat des de la vista prèvia | Fes una vista prèvia nova |
| `503` | `project-transfer-preview-unavailable` | Bella no ha pogut comptar alguna cosa, o no ha pogut llegir el registre d'una organització | Torna-ho a provar més tard |
| `409` | `project-transfer-in-progress` | Ja hi ha una transferència d'aquest projecte en marxa, o has intentat canviar un projecte que s'està transferint | Espera que acabi l'execució |
| `409` | `project-transfer-not-resumable` | L'execució no està aturada, així que no es pot reprendre | Comprova l'estat de l'execució |
| `409` | `project-transfer-not-abandonable` | L'execució no està aturada, així que no es pot abandonar | Comprova l'estat de l'execució |

Un projecte o una execució que no existeix respon `404`.

## Al log d'auditoria

| Acció | Es registra a | Quan |
|---|---|---|
| `project_transfer_started` | L'origen | Comença una transferència |
| `project_transferred_out` | L'origen | La transferència es completa |
| `project_transferred_in` | La destinació | La transferència es completa |
| `project_transfer_abandoned` | Totes dues | S'abandona una execució |

A la consola, aquestes accions es mostren com «Transferència de projecte iniciada», «Projecte transferit a una altra organització», «Projecte rebut d'una altra organització» i «Transferència de projecte abandonada».

Una fila anomena l'altra organització i l'execució, i les files de la transferència completada porten recomptes. Mai no conté un valor ni el nom d'un secret. Una transferència que es rebutja abans de començar no escriu cap fila. Les files de la transferència completada s'escriuen a nom de la persona que ha iniciat l'execució. L'historial d'auditoria anterior del projecte es queda a l'origen.

L'eliminació del projecte d'origen es registra també allà com a `project_deleted`. Abandonar una execució registra `project_deleted` a la destinació per al projecte creat a mitges.

## Consulta també

- [Projectes](/features/projects) (en anglès), inclosa l'eliminació d'un projecte
- [Proveïdors](/features/providers) (en anglès)
- [Entorns](/features/environments) (en anglès)
- [API Keys](/features/api-keys) (en anglès)
- [Certificats PKI](/features/pki-certificates) (en anglès)
- [Certificats SSH](/features/ssh-ca) (en anglès)
- [Gestiona les aplicacions connectades](/ca/features/connected-apps-manage)
- [Auditoria](/ca/audit/)
