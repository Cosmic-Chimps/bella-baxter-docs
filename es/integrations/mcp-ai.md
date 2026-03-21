# MCP / IA

> 🌐 **English version**: [MCP / AI Integration](/integrations/mcp-ai)

Bella Baxter expone un servidor [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) que permite a los asistentes de IA — Claude, GitHub Copilot, Cursor — gestionar secretos en tu nombre. Todos los accesos están gobernados por el mismo RBAC que la API REST.

## Autenticación

`bella mcp` admite tres métodos de autenticación, evaluados en este orden:

| Método | Cómo | Ideal para |
|--------|------|-----------|
| **API key en la config** (recomendado) | Variable de entorno `BELLA_BAXTER_API_KEY` | Claude Desktop, VS Code, Cursor — sin `bella login` previo |
| **API key guardada** | `bella login --api-key bax-...` una vez | Máquinas de desarrollo compartidas |
| **Sesión OAuth** | `bella login` (navegador) | Cuentas personales interactivas |

La opción de API key es la recomendada para configuraciones de hosts de IA: se configura una vez en el archivo y no es necesario ejecutar `bella login` de nuevo.

Obtén una API key desde **WebApp → Proyecto → Ajustes → API Keys → Crear clave**.

## Configuración

### 1. Imprimir el snippet de configuración

```sh
bella mcp --print-config
```

Muestra la configuración lista para pegar en Claude Desktop, VS Code o cualquier host compatible con MCP, con la variable de entorno de API key ya incluida.

### 2. Configurar tu host de IA

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "bella-baxter": {
      "command": "bella",
      "args": ["mcp"],
      "env": {
        "BELLA_BAXTER_API_KEY": "bax-<tu-api-key>"
      }
    }
  }
}
```

**VS Code / GitHub Copilot** (`.vscode/mcp.json` en tu proyecto, o en la configuración de usuario):

```json
{
  "servers": {
    "bella-baxter": {
      "type": "stdio",
      "command": "bella",
      "args": ["mcp"],
      "env": {
        "BELLA_BAXTER_API_KEY": "bax-<tu-api-key>"
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
        "BELLA_BAXTER_API_KEY": "bax-<tu-api-key>"
      }
    }
  }
}
```

::: tip Sin login previo
Cuando `BELLA_BAXTER_API_KEY` está configurada, `bella mcp` arranca directamente — no es necesario ejecutar `bella login`.
:::

### 3. Instancia auto-hospedada

```json
{
  "mcpServers": {
    "bella-baxter": {
      "command": "bella",
      "args": ["mcp"],
      "env": {
        "BELLA_API_URL": "https://tu-bella.ejemplo.com",
        "BELLA_BAXTER_API_KEY": "bax-<tu-api-key>"
      }
    }
  }
}
```

## Herramientas MCP disponibles

| Herramienta | Descripción |
|-------------|-------------|
| `list_projects` | Lista los proyectos a los que tienes acceso |
| `list_environments` | Lista los entornos de un proyecto |
| `list_providers` | Lista los proveedores de secretos de un entorno |
| `list_secret_keys` | Lista los nombres de las claves (valores nunca expuestos) |
| `get_secret` | Obtiene el valor de un secreto específico |
| `set_secret` | Crea o actualiza un secreto |
| `delete_secret` | Elimina permanentemente un secreto |
| `get_totp_code` | Genera el código TOTP/2FA actual |
| `list_totp_keys` | Lista los nombres de claves TOTP almacenadas |
| `sign_ssh_key` | Firma una clave pública SSH mediante el CA de Vault |
| `list_ssh_roles` | Lista los roles de firma SSH disponibles |
| `bella_issue_token` | Emite un token efímero con alcance limitado para la tarea actual |

## Qué pueden hacer los agentes de IA

Una vez configurada Bella como servidor MCP, puedes pedirle a tu IA:

> "Rota la API key de Stripe en el entorno de producción y actualiza el webhook signing secret."

> "Comprueba qué secretos hay en el entorno staging de my-api y compáralos con producción."

> "Firma mi clave SSH con el rol `ops` para que pueda acceder al servidor de despliegue."

> "Genera un token de 30 minutos limitado a los secretos de pagos y dáselo al agente de despliegue."

## Diseño de seguridad

- **Firma HMAC por petición** — la autenticación con API key usa HMAC-SHA256 con marca de tiempo y firma de la petición. La clave nunca viaja como `Authorization: Bearer` plano
- **RBAC aplicado** — si no puedes acceder a un secreto desde la CLI, la IA tampoco puede
- **Valores nunca en el contexto del prompt** — `list_secret_keys` lista solo los nombres, sin valores. `get_secret` obtiene un único valor cuando se solicita explícitamente
- **Tokens con alcance para agentes** — `bella_issue_token` permite al agente emitir una credencial efímera para una subtarea, sin necesidad de tu API key completa
- **Scope de la API key** — crea una API key dedicada para cada host de IA, con acceso solo a los entornos necesarios

## Agentes de IA en CI/CD (sin credenciales)

Para agentes automatizados (GitHub Actions, Kubernetes) que necesiten llamar a Bella vía MCP sin una clave almacenada, usa **Trust Domains**. El agente intercambia su token OIDC de plataforma por una clave `bax-...` efímera:

```
El agente arranca (ej. trabajo de GitHub Actions)
  → Solicita token OIDC a la plataforma (sin secreto necesario)
  → Lo envía a POST /api/v1/environments/{id}/token
  → Bella verifica contra las reglas del Trust Domain
  → Devuelve clave bax-... efímera (expira según el TTL)
  → El agente usa la clave para llamadas MCP / REST API
```

Consulta [Keyless / Identidad de Carga de Trabajo](/features/keyless) para la configuración.

## Opciones de `bella mcp`

```sh
bella mcp                          # inicia el servidor MCP
bella mcp --api-url <url>          # cambia la URL de la API (o usa la variable BELLA_API_URL)
bella mcp --print-config           # imprime snippets de configuración para todos los hosts
```
