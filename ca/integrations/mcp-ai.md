# MCP / IA

> 🌐 **Versió en anglès**: [MCP / AI Integration](/integrations/mcp-ai)

Bella Baxter exposa un servidor [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) que permet als assistents d'IA — Claude, GitHub Copilot, Cursor — gestionar secrets en nom teu. Tots els accessos estan governats pel mateix RBAC que l'API REST.

## Autenticació

`bella mcp` admet tres mètodes d'autenticació, avaluats en aquest ordre:

| Mètode | Com | Ideal per a |
|--------|------|-----------|
| **API key a la config** (recomanat) | Variable d'entorn `BELLA_BAXTER_API_KEY` | Claude Desktop, VS Code, Cursor — sense `bella login` previ |
| **API key desada** | `bella login` una vegada | Màquines de desenvolupament compartides |
| **Sessió OAuth** | `bella login` (navegador) | Comptes personals interactius |

L'opció d'API key és la recomanada per a configuracions de hosts d'IA: es configura una vegada al fitxer i no cal tornar a executar `bella login`.

Obtén una API key des de **WebApp → Projecte → Ajustaments → API Keys → Crear clau**.

## Configuració

### 1. Imprimir el snippet de configuració

```sh
bella mcp --print-config
```

Mostra la configuració llesta per enganxar a Claude Desktop, VS Code o qualsevol host compatible amb MCP, amb la variable d'entorn d'API key ja inclosa.

### 2. Configurar el teu host d'IA

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "bella-baxter": {
      "command": "bella",
      "args": ["mcp"],
      "env": {
        "BELLA_BAXTER_API_KEY": "bax-<la-teva-api-key>"
      }
    }
  }
}
```

**VS Code / GitHub Copilot** (`.vscode/mcp.json` al teu projecte, o a la configuració d'usuari):

```json
{
  "servers": {
    "bella-baxter": {
      "type": "stdio",
      "command": "bella",
      "args": ["mcp"],
      "env": {
        "BELLA_BAXTER_API_KEY": "bax-<la-teva-api-key>"
      }
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "bella-baxter": {
      "command": "bella",
      "args": ["mcp"],
      "env": {
        "BELLA_BAXTER_API_KEY": "bax-<la-teva-api-key>"
      }
    }
  }
}
```

::: tip Sense login previ
Quan `BELLA_BAXTER_API_KEY` està configurada, `bella mcp` arrenca directament — no cal executar `bella login`.
:::

### 3. Instància autoallotjada

```json
{
  "mcpServers": {
    "bella-baxter": {
      "command": "bella",
      "args": ["mcp"],
      "env": {
        "BELLA_API_URL": "https://la-teva-bella.exemple.com",
        "BELLA_BAXTER_API_KEY": "bax-<la-teva-api-key>"
      }
    }
  }
}
```

## Eines MCP disponibles

| Eina | Descripció |
|-------------|-------------|
| `list_projects` | Llista els projectes als quals tens accés |
| `list_environments` | Llista els entorns d'un projecte |
| `list_providers` | Llista els proveïdors de secrets d'un entorn |
| `list_secret_keys` | Llista els noms de les claus (valors mai exposats) |
| `get_secret` | Obté el valor d'un secret específic |
| `set_secret` | Crea o actualitza un secret |
| `delete_secret` | Elimina permanentment un secret |
| `get_totp_code` | Genera el codi TOTP/2FA actual |
| `list_totp_keys` | Llista els noms de claus TOTP emmagatzemades |
| `sign_ssh_key` | Signa una clau pública SSH mitjançant la CA de Vault |
| `list_ssh_roles` | Llista els rols de signatura SSH disponibles |
| `bella_issue_token` | Emet un token efímer amb àmbit limitat per a la tasca actual |

## Què poden fer els agents d'IA

Un cop configurada Bella com a servidor MCP, pots demanar a la teva IA:

> "Rota l'API key de Stripe a l'entorn de producció i actualitza el webhook signing secret."

> "Comprova quins secrets hi ha a l'entorn staging de my-api i compara'ls amb producció."

> "Signa la meva clau SSH amb el rol `ops` perquè pugui accedir al servidor de desplegament."

> "Genera un token de 30 minuts limitat als secrets de pagaments i dona'l a l'agent de desplegament."

## Disseny de seguretat

- **Signatura HMAC per petició** — l'autenticació amb API key usa HMAC-SHA256 amb marca de temps i signatura de la petició. La clau mai no viatja com a `Authorization: Bearer` pla
- **RBAC aplicat** — si no pots accedir a un secret des de la CLI, la IA tampoc no hi pot accedir
- **Valors mai al context del prompt** — `list_secret_keys` llista només els noms, sense valors. `get_secret` obté un únic valor quan se sol·licita explícitament
- **Tokens amb àmbit per a agents** — `bella_issue_token` permet a l'agent emetre una credencial efímera per a una subtasca, sense necessitat de la teva API key completa
- **Àmbit de l'API key** — crea una API key dedicada per a cada host d'IA, amb accés només als entorns necessaris

## Agents d'IA a CI/CD (sense credencials)

Per a agents automatitzats (GitHub Actions, Kubernetes) que necessitin cridar Bella via MCP sense una clau emmagatzemada, fes servir **Trust Domains**. L'agent intercanvia el seu token OIDC de plataforma per una clau `bax-...` efímera:

```
L'agent arrenca (p. ex. treball de GitHub Actions)
  → Sol·licita un token OIDC a la plataforma (sense cap secret necessari)
  → L'envia a POST /api/v1/environments/{id}/token
  → Bella verifica contra les regles del Trust Domain
  → Retorna una clau bax-... efímera (caduca segons el TTL)
  → L'agent usa la clau per a crides MCP / REST API
```

Consulta [Keyless / Identitat de càrrega de treball](/features/keyless) per a la configuració.

## Opcions de `bella mcp`

```sh
bella mcp                          # inicia el servidor MCP
bella mcp --api-url <url>          # canvia la URL de l'API (o usa la variable BELLA_API_URL)
bella mcp --print-config           # imprimeix snippets de configuració per a tots els hosts
```
