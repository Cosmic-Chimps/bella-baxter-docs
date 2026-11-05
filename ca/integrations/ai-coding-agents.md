# Agents de programació amb IA

> 🌐 **Versió en anglès**: [AI Coding Agents](/integrations/ai-coding-agents)

Els agents de programació amb IA, com Claude Code, Cursor o el mode agent de Copilot, executen
ordres reals a la màquina del desenvolupador. Arrenquen l'app, criden APIs per comprovar una
resposta, graven fixtures de tests i executen els tests. Tard o d'hora aquesta feina necessita
secrets: credencials OAuth, API keys, client ids.

Aquesta pàgina explica com Bella Baxter permet que un agent faci aquesta feina **sense veure,
imprimir ni desar mai el valor d'un secret**. Surt d'una sessió real: Claude Code construint Frunchy,
una app web en F#/.NET amb inici de sessió de Discord i dades de MyAnimeList. La persona va crear
totes les credencials; l'agent les va usar a través de Bella i no en va tocar cap.

## El problema: els agents filtren secrets de maneres quotidianes

Un secret que passa per les mans d'un agent pot acabar en llocs que ningú no revisa:

- **La transcripció de la conversa**: una clau enganxada, o `cat .env`;
- **Fitxers**: `appsettings.json`, `.env`, fixtures de test que desen les capçaleres de la petició;
- **Commits**, tan bon punt es fa commit de qualsevol d'aquests fitxers;
- **Logs i sortida del terminal**: `echo $API_KEY`, una petició fallida impresa amb les seves capçaleres.

El consell habitual, "posa-ho en una variable d'entorn", deixa que l'agent decideixi com hi arriba
el valor. Si l'agent demana a la persona que l'enganxi al xat, la transcripció ja el conté.

## El que ha funcionat

### 1. L'app obté els seus propis secrets: `bella sdk run` + l'SDK

En una app de llarga durada, l'agent no passa cap secret. L'app afegeix Bella com a font de
configuració amb `BellaBaxter.AspNet.Configuration`, i l'agent l'arrenca a través de la CLI:

```bash
bella sdk run -- dotnet run --launch-profile http
```

`bella sdk run` entrega al procés les seves credencials de Bella, i el mateix SDK de l'app obté els
secrets. Amb `__` com a separador de seccions, `Frunchy__Auth__Providers__Discord__ClientSecret` a
Bella es converteix en `Frunchy:Auth:Providers:Discord:ClientSecret` a la configuració de l'app
(veure [SDK de .NET](/sdks/dotnet)).

El que ha aportat a la sessió:

- **Cap secret en fitxers del repo**: `appsettings.json` només té ajustaments que no són
  secrets. Un test falla si algun `appsettings*.json` del qual s'ha fet commit conté un client id o un secret.
- **Res que l'agent hagués de manejar**: mai no ha necessitat els valors, només l'ordre.
- **Recàrrega en calent**: l'SDK fa polling, així que un client secret de Discord rotat s'ha aplicat
  en el següent inici de sessió sense reiniciar. L'app enllaça les seves opcions d'OAuth a la
  configuració en lloc de copiar-les en arrencar, i un test rota un valor i comprova la següent
  redirecció.

### 2. Les ordres puntuals reben els secrets com a variables d'entorn: `bella run`

Algunes tasques són curtes: comprovar que una API key recentment registrada funciona, o gravar
respostes reals d'una API com a fixtures. Per a això, `bella run` injecta els secrets de l'entorn
en un sol procés:

```bash
# Funciona el nou client id de MyAnimeList? Una petició, i l'id no s'imprimeix mai
bella run -- sh -c 'curl -s -o out.json -w "status %{http_code}\n" \
  -H "X-MAL-CLIENT-ID: $Frunchy__Mal__ClientId" \
  "https://api.myanimelist.net/v2/anime?q=Frieren&limit=3"'
```

Per comprovar que un secret s'havia injectat, l'agent va imprimir la seva **longitud**, mai el seu valor:

```bash
bella run -- sh -c 'echo "id injected (${#Frunchy__Mal__ClientId} chars)"'
# ✓ Loaded 4 secret(s) from Bella
# id injected (32 chars)
```

El mateix patró va gravar les respostes reals que reprodueixen els tests. La gravació és un test
opcional que s'executa amb `bella run`, llegeix el client id de l'entorn i només escriu els cossos de
les respostes:

```bash
FRUNCHY_RECORD_MAL=1 bella run -- dotnet test --filter-method "*record the 2026 sample*"
```

Després, l'agent va buscar l'id als fitxers gravats: cap coincidència, així que es podia fer
commit d'aquests fitxers.

### 3. Un fitxer `.bella` amb commit: sense flags i sense endevinar

```toml
org = "my-org"
project = "frunchy"
environment = "development"
url = "https://api.bella-baxter.io"
```

`bella context init` escriu aquest fitxer. Només conté noms i l'adreça de l'API, cap
secret, així que se'n pot fer commit. Qualsevol `bella run` o `bella sdk run` llançat dins del
repositori usa el projecte i l'entorn correctes sense `-p` ni `-e`.

### 4. La persona crea les credencials; l'agent només les usa

La separació es va mantenir neta durant tota la sessió:

- **La persona**: va registrar les apps de Discord i MyAnimeList, va afegir els valors a la web de
  Bella i va executar `bella login` quan va caducar la sessió de la CLI.
- **L'agent**: va escriure el codi i les ordres, i li va dir a la persona el **nom** que havia
  d'usar, per exemple "afegeix el Client ID a Bella com a `Frunchy__Mal__ClientId`; no l'enganxis
  aquí". Després va executar les ordres.

Quan la persona va preguntar si també feia falta el *client secret* de MyAnimeList, l'agent va
consultar primer la referència de l'API. Només feia falta el client id, així que el secret mai no
es va afegir a l'entorn de l'app.

### 5. Errors que diuen a l'agent què ha de fer

La sessió es va trobar amb els dos tipus d'error, i tots dos van ser fàcils de resoldre:

- **Una sessió de la CLI caducada**:

  ```text
  {"error":"Failed to refresh JWT token: … Run: bella login"}
  ```

  L'agent va saber que calia un login interactiu, va demanar a la persona que executés
  `bella login` i no ho va tornar a intentar.
- **Un secret que falta**: l'app estava feta per degradar-se en comptes de caure. Sense el client id
  registra `MyAnimeList enrichment is off: Frunchy:Mal:ClientId is not set (Bella:
  Frunchy__Mal__ClientId, or dotnet user-secrets)` i serveix les pàgines amb normalitat. El missatge
  anomena la clau exacta i on posar-la.

## Regles que val la pena donar al teu agent

Posa-les al fitxer d'instruccions de l'agent (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`…):

```markdown
## Secrets
- Secrets live in Bella Baxter (project and environment in `.bella`). Never in the repo, never in
  appsettings or .env files, never in the chat.
- Run the app with `bella sdk run -- <command>`; run one-off scripts with `bella run -- <command>`.
- Never print a secret. To check one is present, print its length: `${#NAME}`.
- If a new secret is needed, tell the human its name (e.g. `Service__ApiKey`) and let them add it.
- If the CLI says `Run: bella login`, ask the human to run it; it's interactive.
- Before committing recorded fixtures or logs, search them for the secret's value.
```

## Paranys trobats a la sessió

- **Executa les ordres de Bella dins del projecte.** `bella run` troba `.bella` pujant des del
  directori actual. Una ordre llançada des d'una carpeta temporal fora del repositori es va
  quedar sense context de projecte sense avisar, i la seva petició no es va executar mai. La mateixa ordre
  des del repositori va funcionar.
- **Precedència.** `AddBellaSecrets()` s'afegeix després d'appsettings i dels user secrets, així que
  els valors de Bella guanyen a tots dos. Perquè les variables d'entorn i els arguments de línia
  d'ordres continuïn per sobre (útil per a un canvi local ràpid), torna a afegir aquestes fonts
  després de Bella.
- **`bella sdk run` amb login OAuth** (no amb API key) necessita el projecte i l'entorn; `.bella`
  els proporciona.
- **Separació de paraules a la shell.** No és cosa de Bella, però és habitual als scripts dels
  agents: a zsh, `for f in $files` no separa per espais. Fes servir `xargs` o arrays entre cometes.

## Per què importa

Amb Bella pel mig, l'agent ha pogut fer la feina que necessita credencials: arrencar l'app
amb OAuth real, verificar una API key i gravar fixtures reals. La transcripció, el repositori,
els fixtures i els logs mai no han contingut el valor d'un secret. La persona ha continuat creant i
rotant credencials en un únic lloc, i mai no ha calgut confiar aquests valors a l'agent.

Mira també: [MCP / IA](/ca/integrations/mcp-ai), perquè un assistent *gestioni* secrets a
través del servidor MCP de Bella.
