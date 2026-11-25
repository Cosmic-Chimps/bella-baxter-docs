# Plans i llicència

> 🌐 **Versió en anglès**: [Plans and licence](/open-source/)

Bella Baxter és open-core i de codi disponible (source-available) sota la [llicència ELv2](https://www.elastic.co/licensing/elastic-license). El nucli és gratuït. Els plans de pagament hi afegeixen mòduls, al núvol i a la teva pròpia infraestructura.

## El principi rector

> **El nucli mai no té topall i mai no es cobra per usuari. Cobrem els mòduls d'organització i l'automatització al núvol: mai els recursos que necessites per fer la teva feina.**

Una persona desenvolupadora o una startup de 3 persones no hauria de topar mai amb un mur mentre fa feina legítima.

## Dues maneres d'usar Bella, quatre plans a cadascuna

Pots usar el **núvol** administrat, allotjar Bella tu mateix (**autoallotjat**) a la teva pròpia infraestructura, o totes dues coses. Cadascuna té quatre plans. Cada pla inclou tot el que hi ha al pla anterior.

### Núvol

| Pla | Què inclou | Com es cobra |
|-----|------------|--------------|
| **Pagament per ús** | El nucli. L'automatització es mesura: 2.000 crides al mes són gratis a la primera organització d'una persona, i després es cobra cada crida. | 0,005 $ per petició després de les 2.000 gratis. |
| **Pro** | Pagament per ús, més inici de sessió únic (SSO) i exportació a SIEM. | Contacta amb nosaltres. |
| **Enterprise** | Pro, sense mesurament i amb suport 24/7. | Per contracte. |

Pagament per ús és el pla per defecte de cada organització. Les sessions de les persones a la consola i a la CLI mai no es mesuren.

### Autoallotjat

| Pla | Què inclou | Com es cobra |
|-----|------------|--------------|
| **Community Edition (CE)** | El nucli. Gratis, sense topall i sense mesurament. | Gratis. |
| **Pro** | CE, més SSO i exportació a SIEM. | Contacta amb nosaltres. |
| **Premium** | Pro, més rotació de certificats (inclosos ACME i appliances de proveïdors) i descobriment de certificats amb Scout. | Contacta amb nosaltres. |
| **Enterprise** | Premium, més suport 24/7. | Per contracte. |

## El que es compleix a tots els plans

- **El nucli mai no té topall i mai no es cobra per usuari.** Projectes, entorns, secrets, API keys, proveïdors i la resta de la llista de sota no tenen límit a cap pla.
- **L'autoallotjat mai no es mesura.** El mesurament existeix només al núvol, on es pot facturar.
- **«Gratis» vol dir el nucli i Community Edition.** No s'aplica als plans de pagament.
- **La rotació de certificats i Scout són només per a autoallotjat, de moment.** Necessiten una ruta cap a la teva xarxa, i un servei compartit al núvol no n'ha de tenir. Un pla Premium al núvol espera un agent de sortida que executes dins la teva xarxa. Encara no està construït.

## Què existeix avui i què ve

**Avui**

- El núvol és actiu, amb Pagament per ús. Pro i Enterprise s'acorden contactant amb nosaltres: [enterprise@cosmic-chimps.io](mailto:enterprise@cosmic-chimps.io). Encara no hi ha compra en línia per a aquests plans.
- SSO i l'exportació a SIEM funcionen al núvol i en autoallotjat. Una organització els sol·licita, i un operador aprova l'SSO o activa l'enviament. Consulta [Inici de sessió únic](/features/sso) i [Logs d'auditoria](/ca/audit/).
- En autoallotjat, un mòdul de pagament funciona quan la teva clau de llicència l'inclou i l'operador de la instal·lació l'ha activat per a una organització. Consulta [La clau de llicència per a autoallotjat](#la-clau-de-llicencia-per-a-autoallotjat).

**El que ve**

- Compra en línia del pla Pro al núvol.
- Rotació de certificats i Scout al núvol, mitjançant l'agent de sortida.

## La clau de llicència per a autoallotjat

Una instal·lació autoallotjada activa els mòduls de pagament amb una **clau de llicència**. L'emetem quan contractes un pla de pagament.

- **Què activa.** Tres mòduls: inici de sessió únic (SSO), exportació a SIEM (enviament del registre d'auditoria) i rotació de certificats, que inclou el descobriment de certificats amb Scout. Una clau Pro inclou els dos primers. Una clau Premium o Enterprise inclou els tres. L'operador de la instal·lació continua decidint quines organitzacions reben cada mòdul.
- **Com es comprova.** La clau és un token signat (ES256). La instal·lació verifica la signatura per ella mateixa, sense connexió, amb claus públiques incloses a la versió. No fa cap crida de xarxa per a això, així que funciona en un equip sense sortida a internet, i no ens envia res sobre la teva clau ni sobre la teva instal·lació.
- **On es configura.** Com a configuració del desplegament, a l'ajust `BELLA_LICENSE`. Al paquet autoallotjat, l'assistent d'instal·lació l'escriu i `./bella.sh apply` la porta als contenidors. Consulta la guia d'instal·lació del paquet.
- **Què cobreix una clau.** El mateix model que les eines de JetBrains. Una clau cobreix les versions fins a la data impresa en ella (`upgrades_until`). Una línia de versions publicada per primera vegada en aquesta data o abans continua funcionant amb la clau, sense data de fi, igual que cada pedaç d'aquesta línia. Una línia posterior necessita una clau renovada. Consulta la [política de suport](/ca/open-source/support-policy).
- **Amb una clau, res no s'apaga per data.** Quan una clau no cobreix la versió que executes, el nucli no canvia, ni res del que figura a [Sempre gratis](#sempre-gratis-community). Un control que ja està actiu mai no es baixa: l'SSO obligatori continua sent obligatori i les rotacions de certificats programades continuen. Els tres mòduls deixen d'acceptar configuració nova i feina nova, i no s'esborra res. Renova la clau, o torna a una versió coberta, i es reprenen sense reconfigurar. L'enviament del registre d'auditoria a un SIEM se suspèn mentre el mòdul no té llicència: s'envia un únic missatge de control `stream suspended` al destí, no es posa res a la cua i el teu registre d'auditoria a Bella Baxter continua complet. L'enviament es reprèn tot sol quan la llicència torni a incloure el mòdul.
- **Una única gràcia de 30 dies si actualitzes sense clau.** Una instal·lació que ja fa servir SSO, enviament d'auditoria o rotació de certificats i actualitza a aquesta versió sense clau conserva cadascun d'aquests mòduls durant 30 dies, comptats des de la primera arrencada d'una versió que pot verificar una clau de producció. Un mòdul que no feies servir no forma part de la gràcia. Una clau amb una errada o tallada no acaba la gràcia; una clau vàlida sí, i els mòduls que llista continuen funcionant.
- **Un problema amb la clau mai no atura la instal·lació.** Una clau absent, mal escrita o il·legible mai no impedeix que la instal·lació arrenqui ni que serveixi secrets. Els mòduls de pagament es comporten com Community fins que es corregeixi la clau, i la consola de l'operador diu per què.

## Sempre gratis (Community)

Això forma part del nucli. Community Edition ho executa tot gratis i sense topall. Al núvol està inclòs a tots els plans, i només es mesuren les crides d'automatització.

| Funcionalitat | Per què és sempre gratis |
|---------------|--------------------------|
| Projectes il·limitats | El topall exacte que va fer frustrant usar Infisical |
| Entorns il·limitats | Dev/staging/prod és el mínim |
| Secrets il·limitats | Funcionalitat bàsica |
| API keys il·limitades | Autenticació principal per a CI/CD: limitar-les trenca l'automatització |
| Tots els proveïdors personalitzats (Vault, AWS, Azure, GCP) | Tota la proposta de valor: connectar la teva pròpia infraestructura |
| Accés a la CLI | Flux de treball fonamental del desenvolupador |
| Tots els SDKs (10 llenguatges) | Eines per a desenvolupadors |
| Autoritat de certificació SSH | Seguretat operativa, no govern de l'organització |
| Trust Domains / Workload Identity (OIDC) | Autenticació de CI/CD: la mateixa categoria que les API keys |
| TOTP (gestió de claus 2FA) | Funció de seguretat per a tot desenvolupador |
| Webhooks | Notificacions operatives d'esdeveniments |
| Secure Shares | Utilitat per a desenvolupadors |
| Detecció de drift | Higiene operativa |
| Integració MCP / IA | Eines per a desenvolupadors |
| Notificacions (Slack, Discord, Teams, Telegram) | Alertes operatives |
| Escanejos de Security Intelligence | Detectar `password123` és un dret bàsic, no una millora de pagament |
| Integració amb .NET Aspire | Flux de treball del desenvolupador |

Executar més d'una organització en una instància no té restricció. Qualsevol persona amb la sessió iniciada pot crear una altra organització avui.

Per als mòduls de pagament, consulta [Funcionalitats per pla](/ca/open-source/enterprise-features).

## Ús al núvol

El núvol administrat de Bella Baxter mesura l'automatització, no les persones.

- **Quota gratuïta**: 2.000 peticions a l'API per mes, sense targeta de crèdit.
  La quota gratuïta pertany a la primera organització que crea una persona. Una organització que creï després comença sense quota, i les seves peticions amb API key retornen `429` fins que s'hi afegeixi un mètode de pagament. Les sessions de la consola i de la CLI d'una persona mai no es mesuren.
  Quan s'esgota la quota gratuïta i no hi ha cap mètode de pagament registrat, les peticions amb API key retornen `429` fins que n'afegeixis un.
- **Excés**: 0,005 $ per petició per sobre de 2.000 (~5 $ per cada 1.000 peticions).
- **Enterprise**: sense mesurament. S'acorda per contracte.

La quota gratuïta i la tarifa són els valors per defecte. Un operador pot fixar-ne uns altres per a una organització per contracte.

Una «petició» = una crida HTTP a l'API de secrets feta per una identitat de màquina (API key). Això inclou:
- `bella pull` / `bella run`: compta com **una petició** sense importar quants secrets es retornin
- Lectures des de pipelines de CI/CD (cada desplegament = una petició)
- Crides d'agents d'IA / eines MCP (cada `get_secret` o `list_secret_keys` = una petició)

El servidor MCP de la CLI usa memòria cau basada en ETag. Quan els secrets no han canviat, les crides posteriors de l'eina d'IA retornen resultats de la memòria cau sense tocar l'API, així que una sessió llarga d'IA sol consumir només 1 o 2 peticions mesurades.

Els fluxos humans (WebApp, gestió de projectes, gestió d'usuaris) **mai no es mesuren**.

### Què costa un ús típic

| Equip | Activitat | Peticions al mes | Dins de les 2.000 gratis? | Cost |
|-------|-----------|------------------|---------------------------|------|
| Desenvolupador individual | Desenvolupament actiu | ~200 | Sí | 0 $ |
| Startup de 3 persones | Dev + CI/CD (20 desplegaments al dia) | ~600 | Sí | 0 $ |
| Startup de 3 persones + IA | CI/CD + sessions MCP diàries | ~1.800 | Sí | 0 $ |
| Equip de 10 persones | CI/CD intens (100 desplegaments al dia) | ~3.000 | No | 5 $ |
| Equip de 10 persones | 500 desplegaments al dia | ~15.000 | No | 65 $ |
| Empresa de 50 persones | 2.000 desplegaments al dia | ~60.000 | No | 290 $ |

Pagues més quan desplegues més (o quan els teus agents d'IA estan molt actius). Que la factura creixi és un senyal que l'equip creix.

## Autoallotjat davant núvol

| | Autoallotjat | Núvol |
|--|--------------|-------|
| Plans | Community Edition, Pro, Premium, Enterprise | Pagament per ús, Pro, Enterprise |
| Cost del nucli | Gratis, sense topall i sense mesurament | 0 $ per començar, 0,005 $ per petició després de 2.000 |
| Infraestructura | L'administres tu (Docker/Aspire/K8s) | L'administra Cosmic Chimps |
| Residència de dades | La teva infraestructura | Cosmic Chimps (UE / EUA) |
| SSO i exportació a SIEM | Pro i superiors | Pro i superiors |
| Rotació de certificats i Scout | Premium i superiors | Encara no disponible |
| Suport 24/7 | Enterprise | Enterprise |
| Actualitzacions | Manuals | Automàtiques |

## Llicència

Bella Baxter es publica sota la **Elastic License v2 (ELv2)**:

- ✅ Autoallotja lliurement per a qualsevol ús intern
- ✅ Modifica el codi font
- ✅ Contribueix al projecte original
- ❌ No pots oferir Bella Baxter com a servei administrat a tercers sense un acord comercial

Això impedeix que els proveïdors de núvol embolcallin Bella Baxter com a servei competidor, i manté l'autoallotjament completament lliure.

[→ Llegeix el text complet de la llicència](https://www.elastic.co/licensing/elastic-license)

### Les biblioteques client són MIT

La Elastic License cobreix el servidor de Bella Baxter: el producte que autoallotges, i el que Cosmic Chimps opera com a servei al núvol.

Les biblioteques client es publiquen sota la **llicència MIT**. Això inclou els SDKs de tots els llenguatges, la biblioteca de criptografia compartida `BellaBaxter.Crypto`, la CLI `bella`, el proveïdor de Terraform, la col·lecció d'Ansible i l'acció de configuració per a GitHub. Pots usar-les al teu propi programari, obert o tancat, sense restricció. Cadascuna inclou el seu propi fitxer `LICENSE`.

Les versions del paquet de Swift publicades abans del 16 de novembre de 2026 encara porten la Elastic License al seu fitxer `LICENSE`. Les versions posteriors porten MIT.

### Programari de tercers

Bella Baxter s'executa sobre programari de codi obert que conserva la seva pròpia llicència, inclosos OpenBao (MPL 2.0), Keycloak (Apache 2.0), PostgreSQL, Redis i l'entorn d'execució de .NET. El fitxer `NOTICE` del paquet autoallotjat enumera cadascun, amb la seva llicència.
