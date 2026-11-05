# Referència de la CLI

> 🌐 **Versió en anglès**: [CLI Reference](/cli/)

La traducció completa de la referència de la CLI està en curs. Mentrestant, consulta la versió en anglès.

La CLI de Bella Baxter proporciona totes les ordres necessàries per gestionar secrets, projectes, entorns i més des del teu terminal.

## Instal·lació

```sh
curl -sSfL https://github.com/Cosmic-Chimps/bella-baxter-cli/releases/latest/download/install-bella.sh | bash
```

L'instal·lador es publica amb cada release. Verifica la signatura GPG del `checksums.txt` de la release amb
la clau de signatura de Cosmic Chimps que porta incorporada (empremta
`65BB 8D3C EEE3 DD9E 4FFD  22B4 119F 114C A309 C2FA`) i després el SHA-256 del binari, i **avorta** si
no pot completar qualsevol de les dues comprovacions, així que necessites tenir `gpg` instal·lat. Per fixar
una versió, descarrega l'instal·lador d'aquesta release:
`https://github.com/Cosmic-Chimps/bella-baxter-cli/releases/download/v1.2.3/install-bella.sh`.
Només per a un mirall sense connexió que no pugui portar la signatura, `BELLA_INSECURE_SKIP_SIGNATURE=1` instal·la
comprovant únicament el checksum.

## Quina URL de servidor fer servir

La CLI parla amb un sol servidor: l'origen de l'**API** de Bella Baxter. Fixa'l una vegada amb
`bella config set-server <url>` o amb `BELLA_BAXTER_URL`:

| Instal·lació | URL del servidor |
|-------------|------------------|
| Servei allotjat | `https://api.bella-baxter.io`, el valor per defecte, així que no cal fixar res |
| Autoallotjada amb noms de host separats | el nom de host de l'**API** (`api.<domini>`), no el de la passarel·la de la consola (`gw.<domini>`) |
| Paquet autoallotjat | `https://<la-teva-adreça>`, l'única adreça que serveix |

En una instal·lació amb noms de host separats, la consola parla amb una passarel·la que a més dona accés a la
rotació de certificats i a Scout. Aquesta passarel·la només reenvia `/api/**`, i `bella mcp` i el connector MCP usen
`/mcp`, així que deixa la CLI al nom de host de l'API. Totes les ordres actuals de la CLI se serveixen allà.

## Ordres principals

| Ordre | Descripció |
|---------|-------------|
| `bella login` | Iniciar la sessió |
| `bella whoami` | Veure l'usuari i l'org activa |
| `bella org current` | Veure l'org activa |
| `bella org list` | Llistar totes les teves organitzacions |
| `bella org switch <slug>` | Canviar d'organització |
| `bella pull` | Escriure els secrets a `.env` |
| `bella run -- <cmd>` | Executar un procés amb els secrets injectats |
| `bella sdk run -- <cmd>` | Semblant a run (sense gestió del cicle de vida) |
| `bella secrets drift` | Matriu de presència de claus entre entorns (CI gate) |
| `bella secrets scan` | Escanejar el codi font a la recerca de referències a claus de secrets (CI gate) |
| `bella usage` | Veure l'ús de l'API i l'estat de facturació del mes actual |
| `bella context use <project/env>` | Canviar el context actiu |

## Identitat de càrrega de treball (sense claus)

A GitHub Actions (amb `id-token: write`) o Kubernetes, `bella run`, `bella sdk run`, `bella exec` i `bella auth oidc` intercanvien el token OIDC de la plataforma per una clau Bella de curta durada. L'intercanvi necessita el tenant, el projecte i l'entorn: `-t`/`--tenant`, `-p`/`--project` i `-e`/`--env` (o `BELLA_BAXTER_TENANT`, `BELLA_BAXTER_PROJECT` i `BELLA_BAXTER_ENV`, o un fitxer `.bella`):

```sh
bella run -t mi-org -p mi-api -e production -- ./deploy.sh
```

Cada valor es resol per separat: el flag guanya a la variable d'entorn, i aquesta al `.bella`, i un flag mai no canvia els altres dos. Si encara en falta algun, l'ordre s'atura abans de contactar amb Bella i anomena el que falta (per exemple "missing: environment", juntament amb `--env <slug>`, `BELLA_BAXTER_ENV` o la clau `environment` de `.bella` per indicar-lo) en lloc de dir "Not logged in". Si el runner té a més una sessió desada amb `bella login`, continua usant-la.

## Organitzacions (Multi-Org)

Si pertanys a més d'una organització, pots canviar entre elles sense tancar la sessió:

```sh
bella org list               # llistar organitzacions
bella org switch acme-corp   # canviar a una altra org
```

Després de canviar, executa `bella context init` per actualitzar el teu fitxer `.bella` amb el nou context d'org.

## Ús i facturació

```sh
bella usage          # veure l'ús de l'API i l'estat de facturació del mes actual
bella usage --json   # sortida JSON per a scripts
```

Mostra el pla actiu, les sol·licituds utilitzades respecte a la quota gratuïta mensual, el cost estimat dels excessos i l'estat de la subscripció.

[→ Veure la referència completa en anglès](/cli/)
