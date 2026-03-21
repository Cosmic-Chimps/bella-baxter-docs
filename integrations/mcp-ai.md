# MCP / AI Integration

Bella Baxter exposes an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that lets AI assistants — Claude, GitHub Copilot, Cursor — manage secrets on your behalf. All secret access is governed by the same RBAC as the REST API.

## Authentication

`bella mcp` supports three authentication methods, checked in this order:

| Method | How | Best for |
|--------|-----|----------|
| **API key in config** (recommended) | `BELLA_BAXTER_API_KEY` env var | Claude Desktop, VS Code, Cursor — no prior login needed |
| **Stored API key** | `bella login --api-key bax-...` once | Shared developer machines |
| **OAuth session** | `bella login` (browser) | Interactive personal accounts |

The API key option is recommended for AI host configs because you set it once in the config file and never need to run `bella login` again.

Get an API key from **WebApp → Project → Settings → API Keys → Create Key**.

## Setup

### 1. Print the Configuration Snippet

```sh
bella mcp --print-config
```

This outputs ready-to-paste configuration for Claude Desktop, VS Code, or any MCP-compatible host, with the API key env var pre-filled.

### 2. Configure Your AI Host

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "bella-baxter": {
      "command": "bella",
      "args": ["mcp"],
      "env": {
        "BELLA_BAXTER_API_KEY": "bax-<your-api-key>"
      }
    }
  }
}
```

**VS Code / GitHub Copilot** (`.vscode/mcp.json` in your project, or User settings):

```json
{
  "servers": {
    "bella-baxter": {
      "type": "stdio",
      "command": "bella",
      "args": ["mcp"],
      "env": {
        "BELLA_BAXTER_API_KEY": "bax-<your-api-key>"
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
        "BELLA_BAXTER_API_KEY": "bax-<your-api-key>"
      }
    }
  }
}
```

::: tip No login required
When `BELLA_BAXTER_API_KEY` is set, `bella mcp` starts immediately — no `bella login` step needed.
:::

### 3. Self-Hosted Instance

```json
{
  "mcpServers": {
    "bella-baxter": {
      "command": "bella",
      "args": ["mcp"],
      "env": {
        "BELLA_API_URL": "https://your-bella.example.com",
        "BELLA_BAXTER_API_KEY": "bax-<your-api-key>"
      }
    }
  }
}
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `list_projects` | List projects you have access to |
| `list_environments` | List environments for a project |
| `list_providers` | List secret providers for an environment |
| `list_secret_keys` | List secret key names (values never exposed in the list) |
| `get_secret` | Retrieve a specific secret value |
| `set_secret` | Create or update a secret |
| `delete_secret` | Permanently delete a secret |
| `get_totp_code` | Generate a current TOTP/2FA code |
| `list_totp_keys` | List stored TOTP key names |
| `sign_ssh_key` | Sign an SSH public key via Vault SSH CA |
| `list_ssh_roles` | List available SSH CA signing roles |
| `bella_issue_token` | Issue a short-lived, scope-limited token for the current task |

## What AI Agents Can Do

Once Bella is configured as an MCP server, you can ask your AI:

> "Rotate the Stripe API key in my production environment and update the webhook signing secret."

> "Check what secrets are in the staging environment of my-api and compare them to production."

> "Sign my SSH key with the `ops` role so I can log into the deployment server."

> "Generate a 30-minute token scoped to the payment secrets and give it to the deployment agent."

## Security Design

- **Per-request HMAC signing** — API key auth uses HMAC-SHA256 with a timestamp and request signature. The raw key never travels in `Authorization: Bearer`
- **RBAC enforced** — if you can't access a secret in the CLI, the AI can't either
- **Values never in prompt context** — `list_secret_keys` lists key names only, without values. `get_secret` fetches one value when explicitly requested
- **Scoped tokens for agents** — `bella_issue_token` lets the AI issue a short-lived credential for a subtask, scoped to specific secret names, so it never needs your full API key
- **API key scope** — create a dedicated API key for each AI host with only the environments it needs access to

## AI Agents in CI/CD (Keyless)

For automated agents (GitHub Actions, Kubernetes) that need to call Bella via MCP without a stored key, use **Trust Domains**. The agent exchanges its platform OIDC token (GitHub Actions JWT, Kubernetes ServiceAccount) for a short-lived `bax-...` key:

```
Agent starts (e.g. GitHub Actions job)
  → Requests OIDC token from platform (no secret needed)
  → Sends to POST /api/v1/environments/{id}/token
  → Bella verifies against Trust Domain rules
  → Returns short-lived bax-... key (expires in TTL minutes)
  → Agent uses key for MCP / REST API calls
```

See [Keyless / Workload Identity](/features/keyless) for setup.

## `bella mcp` Options

```sh
bella mcp                          # start MCP server (auto-detected by AI host)
bella mcp --api-url <url>          # override API URL (or set BELLA_API_URL env var)
bella mcp --print-config           # print config snippets for all supported hosts
```
