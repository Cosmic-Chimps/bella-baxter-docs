# Funcionalitats per pla

> 🌐 **Versió en anglès**: [Features by plan](/open-source/enterprise-features)

Referència de quines funcionalitats són al nucli, quines són mòduls de pagament i quin pla inclou cadascuna. Per als plans en si, consulta [Plans i llicència](/ca/open-source/).

::: info Com s'activen els plans de pagament
Pro i Enterprise s'acorden contactant amb nosaltres. Encara no hi ha compra en línia. Al núvol, un operador activa els teus mòduls. En autoallotjat, t'emetem una clau de llicència que inclou els mòduls del teu contracte. L'operador de la instal·lació la configura i després activa cada mòdul per a les organitzacions que l'usen. Consulta [La clau de llicència per a autoallotjat](/ca/open-source/#la-clau-de-llicencia-per-a-autoallotjat).
:::

## ✅ Sempre gratis

| Funcionalitat | Motiu |
|---------------|-------|
| Projectes il·limitats | El topall exacte que ens va portar a construir Bella Baxter |
| Entorns il·limitats per projecte | Dev/staging/prod és el mínim |
| Secrets il·limitats | Funcionalitat bàsica |
| API keys il·limitades | Autenticació principal per a CI/CD: limitar-les trenca l'automatització |
| Proveïdors personalitzats (qualsevol quantitat) | Tota la proposta de valor és connectar la teva pròpia infraestructura |
| Detecció de drift | Higiene operativa, no govern de l'organització |
| Autoritat de certificació SSH | Funció de seguretat operativa |
| Trust domains / Workload identity (OIDC) | Autenticació de CI/CD: la mateixa categoria que les API keys |
| TOTP (gestió de claus 2FA) | Seguretat, no govern |
| Webhooks | Notificacions operatives d'esdeveniments |
| Secure Shares | Utilitat per a desenvolupadors |
| Integració MCP d'IA | Eines per a desenvolupadors |
| CLI, tots els SDKs | Flux de treball fonamental del desenvolupador |
| Integració amb .NET Aspire | Flux de treball del desenvolupador |
| Notificacions (Slack, Discord, Teams, Telegram) | Alertes operatives |
| Escanejos de Security Intelligence | La higiene de seguretat és un dret bàsic |
| Visor del log d'auditoria (a la WebApp) | Accés de només lectura al teu propi registre d'accessos |

**Prova:** *«Una persona desenvolupadora o una startup de 3 persones toparia amb això fent feina legítima?»* → Si la resposta és sí, ha de ser gratis.

## Mòduls de pagament

Només importen a **escala d'organització**, així que els equips petits mai no els necessiten.

| Mòdul | Núvol | Autoallotjat |
|-------|-------|--------------|
| **Inici de sessió únic (SAML o OIDC)** | Pro i Enterprise | Pro, Premium i Enterprise |
| **Exportació a SIEM** (Splunk, Datadog, Azure Monitor) | Pro i Enterprise | Pro, Premium i Enterprise |
| **Rotació de certificats** (inclosos ACME i appliances de proveïdors) | Encara no disponible | Premium i Enterprise |
| **Descobriment de certificats amb Scout** | Encara no disponible | Premium i Enterprise |
| **Sense mesurament** | Enterprise | Mai no es mesura a cap pla |
| **Suport 24/7** | Enterprise | Enterprise |

- **SSO.** Una organització el sol·licita, i un operador aprova la sol·licitud. Consulta [Inici de sessió únic](/features/sso).
- **Exportació a SIEM.** El visor del log d'auditoria de la consola continua sent gratis. Un operador activa l'enviament per a l'organització. Consulta [Logs d'auditoria](/ca/audit/).
- **La clau de llicència d'autoallotjat.** Un token signat amb ES256 que la instal·lació verifica sense connexió, sense cap crida de xarxa. Inclou els tres mòduls anteriors (SSO, exportació a SIEM i rotació de certificats, que inclou Scout). Una clau cobreix les versions fins a la seva data `upgrades_until` i tots els pedaços d'aquestes línies de versions. Una línia posterior necessita una clau renovada, i mentrestant els tres mòduls s'executen com Community, sense baixar cap control. Consulta [Plans i llicència](/ca/open-source/#la-clau-de-llicencia-per-a-autoallotjat) i la [política de suport](/ca/open-source/support-policy).
- **La rotació de certificats i Scout** són només per a autoallotjat, de moment. Premium al núvol espera un agent de sortida que executes dins la teva xarxa. Encara no està construït.

Executar més d'una organització en una instància no té restricció. Qualsevol persona amb la sessió iniciada pot crear una altra organització avui.

## ❌ NO es limitarà

| Funcionalitat | Motiu |
|---------------|-------|
| Quantitat de projectes | Aquest és l'error d'Infisical: repetir-lo traïria la raó per la qual es va crear Bella Baxter |
| Quantitat d'entorns | Igual |
| Quantitat de proveïdors | Obliga a usar la nostra infraestructura i destrueix la proposta de valor |
| Quantitat d'API keys | Trenca el CI/CD per als usuaris de la comunitat |
| Detecció de drift | Castiga les bones pràctiques |
| Escanejos de seguretat | Detectar contrasenyes febles és un dret bàsic de seguretat |

## Com obtenir un pla de pagament

Contacta amb nosaltres: [enterprise@cosmic-chimps.io](mailto:enterprise@cosmic-chimps.io)

- **Pro:** SSO i exportació a SIEM, al núvol o autoallotjat.
- **Premium (autoallotjat):** Pro, més rotació de certificats i Scout.
- **Enterprise:** tot el de Pro (núvol) o de Premium (autoallotjat), més suport 24/7 sota contracte. Al núvol també vol dir sense mesurament.

Aquí no publiquem preus. Contacta amb nosaltres i t'enviarem les condicions.

L'autoallotjament està disponible sota petició; consulta [Autoallotjament](/ca/getting-started/self-hosting).
