# Auditoria

> 🌐 **Versió en anglès**: [Audit Logs](/audit/)

Traducció properament. Consulta la [versió en anglès](/audit/) per a la documentació completa.

## Enviament a un SIEM: el que CEF no pot portar

Les destinacions JSON (HTTPS genèric, Splunk HEC, Datadog, Azure Monitor) reben cada esdeveniment com un sobre JSON el
membre `raw` del qual conté la fila d'auditoria completa, inclosos `raw.scopeNarrowing` (quantes claus ha amagat un llistat
limitat per àmbit), `raw.trustDomainId`, `raw.presentedAudiences` i `raw.audienceMatched`. Les audiències
presentades les aporta qui crida i Bella no les verifica: com a màxim 8 valors de 256 caràcters, amb els
caràcters de control reemplaçats. Tracta-les com a entrada no fiable en mostrar-les.

**La destinació CEF (syslog sobre TLS) porta només els camps promoguts i no inclou `raw`.** Per això no distingeix un
llistat retallat per àmbit d'una lectura rebutjada, ni porta el domini de confiança ni les audiències presentades.
Si una regla en depèn, fes servir una destinació JSON.

## On veure el log d'auditoria

A l'aplicació web, tria **Auditoria** al menú de navegació. La pàgina es titula **Registres d'auditoria**. Llista tota l'organització. Per veure un sol projecte, fes servir el control **Filtra per projecte**.

## Aplicacions connectades al log

Una aplicació connectada és una aplicació de tercers a la qual una persona ha deixat llegir un entorn. Consulta [Gestiona les aplicacions connectades](/ca/features/connected-apps-manage) per al costat de la persona i [Connecta amb Bella Baxter](/ca/features/connected-apps) per al del desenvolupador. Bella escriu aquestes files a l'organització que ha concedit l'accés.

En una fila l'`actorType` de la qual és `application`:

- `appId`, `appName` i `grantId` anomenen l'aplicació i la connexió. Només les files escrites per a una aplicació connectada els tenen.
- `userId` i `userName` són la persona que ha connectat l'aplicació, no una persona que hagi actuat.
- `bellaClient` és `connected-app`. El fixa Bella, no l'informa qui crida. El valor `mcp`, que marca les files de la superfície de l'assistent d'IA, també el fixa Bella.
- `apiKeyId` és buit.

La consola mostra l'actor com a `aplicació: <nom>`, amb `Connectada per <persona>` a sota.

Dues accions importen aquí:

| Acció | Es registra quan |
|-------|------------------|
| `export_all` | Una aplicació connectada ha llegit tots els secrets del seu entorn. És la mateixa acció que quan ho llegeix una persona, i l'actor `application` les distingeix |
| `connected_app_read_denied` | S'ha rebutjat la lectura d'una aplicació connectada a través d'una connexió que existeix, per exemple perquè s'ha revocat, ha vençut o s'ha desactivat. El motiu és a `detail`. Una petició que no coincideix amb cap connexió no es registra |

`connected_app_read_denied` s'envia al SIEM amb `outcome` igual a `denied`.

### El que no es registra

Connectar una aplicació, revocar una connexió, activar o desactivar les aplicacions connectades a l'organització, i registrar o canviar una aplicació de desenvolupador no escriuen cap fila. Si un control teu depèn d'evidència d'aquests esdeveniments, guarda-la fora de Bella per ara.
