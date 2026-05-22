# CLI Reference

The `bella` CLI is a self-contained binary with zero runtime dependencies. No Node.js, Python, or .NET runtime required on the target machine.

## Installation

::: code-group

```sh [Linux / macOS]
curl -sSfL https://raw.githubusercontent.com/cosmic-chimps/bella-baxter-cli/main/scripts/install-bella.sh | bash
```

```powershell [Windows (PowerShell)]
irm https://raw.githubusercontent.com/cosmic-chimps/bella-baxter-cli/main/scripts/install-bella.ps1 | iex
```

:::

Self-update after install:

```sh
bella upgrade
bella upgrade --check   # check without installing
```

Binary downloads for all platforms are available on the [Releases page](https://github.com/cosmic-chimps/bella-baxter-cli/releases).

## Authentication

### OAuth (for humans)

```sh
bella login   # opens browser
```

The token encodes no project/environment — you need a `.bella` file or `-p`/`-e` flags.  
**Not billed** under the pay-as-you-go model.

### API Key (for CI/CD and MCP)

```sh
# Store locally
bella login --api-key bax-...

# Or set as environment variable (recommended for AI host configs)
export BELLA_BAXTER_API_KEY=bax-...
```

The key encodes your project + environment — no `.bella` file needed.  
**Billed** per API call.

::: tip MCP / AI hosts
Set `BELLA_BAXTER_API_KEY` in the MCP server `env` block — no `bella login` step needed.  
See [MCP / AI Integration](/integrations/mcp-ai) for config snippets.
:::

### The `.bella` file

```sh
bella context init          # interactive setup
bella context init myapp dev # direct
```

```toml
# .bella
org = "acme-corp"
project = "myapp"
environment = "dev"
```

The `org` field is written automatically by `bella context init`. If your `.bella` file was created before multi-org support, re-run `bella context init` to add it.

Safe to commit. When using an API key, it's auto-created for you.

---

## Environment Variables

The CLI reads the following environment variables. They take precedence over stored config and `.bella` files as described in the [resolution order](#context-resolution-order) below.

| Variable | Purpose | Notes |
|----------|---------|-------|
| `BELLA_BAXTER_URL` | API server URL | Overrides `bella config set-server` and stored config |
| `BELLA_BAXTER_API_KEY` | API key for authentication | `bax-...` format; takes priority over stored credentials |
| `BELLA_BAXTER_ACCESS_TOKEN` | OAuth JWT bearer token | Injected into child processes by `bella sdk run` |
| `BELLA_BAXTER_PROJECT` | Project slug (session override) | Set by `bella context use` via shell function |
| `BELLA_BAXTER_ENV` | Environment slug (session override) | Set by `bella context use` via shell function |
| `BELLA_BAXTER_TENANT` | Org/tenant slug (session override) | Used alongside `BELLA_BAXTER_PROJECT`/`BELLA_BAXTER_ENV` |
| `BELLA_BAXTER_PRIVATE_KEY` | ZKE private key (PEM) | Required for [Zero-Knowledge Encryption](/features/e2ee-zke) |
| `BELLA_BAXTER_APP_CLIENT` | App client identifier | Forwarded as a context header; useful for MCP/SDK integrations |
| `BELLA_BAXTER_DEBUG` | Enable debug HTTP logging | Set to any non-empty value |

::: details Deprecated variables
| Old variable | Replaced by |
|-------------|------------|
| `BAXTER_URL` | `BELLA_BAXTER_URL` |
| `BELLA_PROJECT` | `BELLA_BAXTER_PROJECT` |
| `BELLA_ENV` | `BELLA_BAXTER_ENV` |
:::

### Authentication Precedence

When connecting to the API, the CLI selects credentials in this order (first match wins):

1. `BELLA_BAXTER_API_KEY` env var
2. `BELLA_BAXTER_ACCESS_TOKEN` env var (injected into subprocesses by `bella sdk run`)
3. Stored API key (saved with `bella login --api-key`)
4. Stored OAuth token (saved with `bella login`)

### Context Resolution Order

When a command needs to know which project and environment to target, the CLI resolves them in this order (first match wins):

1. **`--project` / `--environment` flags** — explicit per-command override (highest priority)
2. **API key scope** — scoped API keys encode their project+environment; resolved via `GET /api/v1/keys/me`
3. **`BELLA_BAXTER_PROJECT` + `BELLA_BAXTER_ENV`** — session override set by `bella context use` (requires shell function from `bella shell init`)
4. **`.bella` file** — walked up from the current directory to the filesystem root (like `.git`)
5. **Interactive picker** — shown only on a human terminal when no other source is found

---

## Organizations (Multi-Org)

If you belong to more than one org (e.g. a freelancer working across multiple clients), you can manage which org is active without logging out.

### See your active org

```sh
bella whoami        # shows org alongside user info
bella org current   # show active org name, slug, and ID
```

### List all orgs you belong to

```sh
bella org list
```

```
Organizations
 Name          Slug          Role    Active
 Acme Corp     acme-corp     OWNER   ✓
 My Startup    my-startup    MEMBER
```

### Switch org

```sh
bella org switch acme-corp   # switch by slug
bella org switch <guid>      # switch by org ID
```

After switching, your token is silently refreshed to reflect the new org. Run `bella context init` to update your `.bella` file with the new org context.

::: tip
Switching orgs does **not** require logging out. The refresh happens in the background.
:::

::: warning API keys can't switch orgs
API keys are bound to one org at creation time. `bella org switch` is for OAuth (human) sessions only.
:::

---

## Running Secrets

### `bella run` — CLI fetches secrets, injects as env vars

```sh
bella run -- node server.js
bella run -p myapp -e staging -- python manage.py runserver
bella run --watch -- node server.js   # auto-restart on secret changes
bella run --watch --signal sighup -- gunicorn app:app   # reload without restart
```

### `bella sdk run` — SDK-powered: inject credentials only, SDK fetches inside the app

Use this when your app has a Bella SDK installed (e.g. `@bella-baxter/express`, `BellaBaxter.AspNetCore`).
Instead of fetching secrets itself, `bella sdk run` resolves the right credentials and injects them into
the child process environment. The SDK inside your app then fetches secrets at runtime — enabling
lazy loading, caching, and [Zero-Knowledge Encryption](/features/e2ee-zke).

```sh
bella sdk run -- node server.js
bella sdk run -- dotnet run
bella sdk run -p myapp -e production -- ./start.sh
```

**What `bella sdk run` does under the hood:**

1. **Resolves credentials** — picks the best available auth method in priority order:
   - Stored API key (`bella login --api-key`)
   - Workload identity (auto-detected in CI/CD environments — GitHub Actions, Google Cloud, Azure, etc.) — exchanges the platform token for a short-lived Bella token
   - Stored OAuth JWT (`bella login`) — refreshes if expired; resolves project + environment from flags, env vars, or the `.bella` file

2. **Scrubs stale Bella variables** — removes any `BELLA_BAXTER_*` / `BELLA_API_*` vars already present in the environment before injecting fresh ones, preventing credential leakage or conflicts from outer shells.

3. **Injects clean credentials** — sets only what the SDK needs:
   - API key path → `BELLA_BAXTER_API_KEY` + `BELLA_API_KEY` + `BELLA_BAXTER_URL`
   - OAuth path → `BELLA_BAXTER_ACCESS_TOKEN` + `BELLA_BAXTER_PROJECT` + `BELLA_BAXTER_ENV` + `BELLA_BAXTER_URL`

4. **Injects the ZKE device key** — if a device private key is configured (and no service-account key is used), `BELLA_BAXTER_PRIVATE_KEY` is set so the SDK can decrypt secrets end-to-end without the server ever seeing plaintext values.

5. **Spawns the subprocess** and returns its exit code — the child process has everything it needs; `bella sdk run` itself makes no secret API calls.

::: tip Why not `bella exec`?
`bella exec` still works as an alias. `bella sdk run` is the recommended name — it makes clear that
the child process must have a Bella SDK installed.
:::

| | `bella run` | `bella sdk run` |
|---|---|---|
| SDK required in child | No | Yes |
| What's injected | All secrets as env vars | Credentials + URL (+ ZKE key) |
| ZKE support | ❌ | ✅ |
| Workload identity (CI/CD) | ✅ | ✅ |
| Credential scrubbing | ✅ | ✅ |
| Watch / auto-reload | ✅ `--watch` | ❌ |
| Best for | Scripts, legacy apps | SDK-powered apps, ZKE workloads |

### `bella pull`

```sh
bella pull           # write .env in current directory
bella pull -o json   # write secrets.json
```

---

## Secret Drift Detection

`bella secrets drift` shows a cross-environment matrix of which secret keys are present (or missing) in each environment of a project. Useful for catching configuration drift before it causes a production incident.

```sh
bella secrets drift                    # uses project from .bella / context
bella secrets drift -p my-project      # explicit project slug
bella secrets drift --json             # machine-readable JSON
```

Sample output:

```
╭────────────────────────────── Secret Drift — my-project ──────────────────────────────╮
│ KEY                    │   dev    │  staging  │  production │
├────────────────────────┼──────────┼───────────┼─────────────┤
│ DATABASE_URL           │   ✓      │    ✓      │      ✓      │
│ STRIPE_SECRET_KEY 🌐   │   🌐     │    🌐     │      🌐     │
│ FEATURE_FLAG_X         │   ✓      │    ✗      │      ✗      │
│ NEW_RELIC_LICENSE_KEY  │   ✓      │    ✓      │      ✓      │
╰────────────────────────┴──────────┴───────────┴─────────────╯
Drift detected: 1 key missing in 2 environments.
```

Legend:

| Symbol | Meaning |
|--------|---------|
| `✓` (green) | Present in this environment |
| `✗` (red) | Missing — drift detected |
| `🌐` (blue) | Inherited from global scope |
| `✓ (override)` | Global key overridden in this environment |
| `~ key` (dim) | Environment-specific key (not expected in all envs) |

Keys highlighted in **yellow** are drifted (missing in at least one environment).

::: tip CI integration
`bella secrets drift` exits with code `1` when drift is detected, making it a ready-made CI gate:

```yaml
- run: bella secrets drift -p my-project
```
:::

---

## Secret Scan

`bella secrets scan` checks which secret keys defined in Bella are actually referenced in your local source code. Helps you find unused secrets and catch hardcoded key names before they become a problem.

```sh
bella secrets scan                              # scan cwd, use .bella for project/env
bella secrets scan -p my-project -e dev         # explicit project and environment
bella secrets scan --path ./src                 # scan a specific directory
bella secrets scan --json                       # machine-readable JSON
```

Sample output:

```
╭──────────────────────────────────────────────────────────────────────────╮
│ KEY                   │ STATUS        │ FOUND IN                         │
├───────────────────────┼───────────────┼──────────────────────────────────┤
│ DATABASE_URL          │ ✓ 3 file(s)   │ src/db.ts, config/db.ts, ...     │
│ STRIPE_SECRET_KEY     │ ✓ 1 file(s)   │ src/payments/stripe.ts           │
│ LEGACY_API_KEY        │ ⚠ not found   │                                  │
╰───────────────────────┴───────────────┴──────────────────────────────────╯
1 key not referenced in source. It may be unused or loaded dynamically.
```

**How it works:**

- Fetches key **names only** from the secrets manifest — no secret values are ever downloaded
- Uses `git ls-files` to enumerate files, which automatically respects `.gitignore` (skips `node_modules`, `dist`, `vendor`, etc.)
- Falls back to a directory walk skipping common build/dependency directories if git is not available
- Skips binary files and files larger than 2 MB
- Searches file contents for exact key name matches (case-sensitive)

::: tip CI integration
`bella secrets scan` exits with code `1` if any keys are not found in source, making it usable as an advisory CI check:

```yaml
- run: bella secrets scan -p my-project -e dev --path ./src
```

The "not found" result is advisory — a key might be loaded dynamically at runtime. Review results before treating this as a hard failure.
:::

---

## Shell Integration

Show your active context in your terminal prompt:

```sh
bella shell init bash      >> ~/.bashrc    && source ~/.bashrc
bella shell init zsh       >> ~/.zshrc     && source ~/.zshrc
bella shell init starship  >> ~/.config/starship.toml
bella shell init oh-my-posh
bella shell init powerlevel10k
bella shell init fish      >> ~/.config/fish/conf.d/bella.fish
bella shell init powershell >> $PROFILE
```

The context segment (`bella: myapp/dev`) appears only in directories that have a `.bella` file — no overhead elsewhere.

---

## Usage & Billing

```sh
bella usage          # show API usage and billing status for the current month
bella usage --json   # machine-readable JSON output
```

Sample output:

```
Bella Baxter Usage — 2026-04
Plan:    PayAsYouGo
Billing: Active subscription

Requests: 1,243 / 2,000 free  (757 remaining)
[████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
```

Fields returned:

| Field | Description |
|-------|-------------|
| `plan` | `PayAsYouGo` or `Enterprise` |
| `currentMonth` | Billing period (e.g. `2026-04`) |
| `requestsUsed` | Total API requests this month |
| `freeMonthlyQuota` | Free request allowance (default: 2,000) |
| `requestsRemaining` | Free requests left |
| `isUnlimited` | `true` for Enterprise plans |
| `isOperatorManaged` | `true` when your instance is operated by Cosmic Chimps (no billing) |
| `hasActiveSubscription` | `true` if a Stripe subscription is active |
| `overageRatePerRequest` | Overage price per request above quota |
| `estimatedOverageCost` | Estimated overage charge for the current month |

::: tip
To manage your subscription or view invoices, visit the **Billing** page in the Bella Baxter web app → **Settings → Billing**.
:::

---

## Commands Reference

```
bella login                   Log in (OAuth browser or API key)
bella logout                  Log out
bella whoami                  Show logged-in user
bella auth status / refresh

bella org current             Show active org
bella org list                List all orgs you belong to
bella org switch <slug>       Switch to a different org

bella projects list/get/create/update/delete/default
bella environments list/get/create/update/delete/default
bella providers list/get/create/delete

bella secrets list            List secret keys (values masked)
bella secrets get             Download all secrets as .env / JSON
bella secrets set <key>       Create or update a secret
bella secrets delete <key>    Delete a secret
bella secrets push            Push from a .env file
bella secrets drift           Cross-environment key presence matrix (CI gate)
bella secrets scan            Scan source files for secret key references (CI gate)
bella secrets generate <lang> Generate typed accessor class

bella context init/show/get/use/clear
bella shell init <framework>
bella shell open              Spawn subshell with Bella creds

bella env                     Output eval-able export statements (eval $(bella env))
bella issue --scope <names>   Issue short-lived scoped token

bella run -- <cmd>            Inject secrets, run command
bella run --watch -- <cmd>    Auto-restart on secret changes
bella sdk run -- <cmd>        Inject credentials only (SDK fetches inside app, enables ZKE)
bella exec -- <cmd>           Alias for bella sdk run

bella usage                   Show API usage and billing status
bella usage --json            Machine-readable JSON output

bella ssh configure/ca-key/sign/connect
bella ssh roles list/create/delete

bella pki configure               Configure CA for an environment
bella pki ca                      View CA certificate and ACME directory URL
bella pki roles create/list/delete
bella pki issue                   Issue a TLS/X.509 certificate
bella pki revoke --serial <sn>    Revoke a certificate by serial number
bella pki tidy                    Remove expired / revoked cert storage

bella agent                   Sidecar: watch secrets, write files, signal process
bella agent --init            Scaffold bella-agent.yaml

bella mcp                     Start MCP server (AI agent integration)
bella mcp --print-config      Print Claude/Copilot/Cursor config snippets

bella upgrade / upgrade --check
bella generate                Generate a secure random password or passphrase
bella config show/set-server
```

---

## Workload Identity (Keyless)

In GitHub Actions (with `id-token: write`) or Kubernetes, `bella run`/`bella sdk run` automatically exchange the platform OIDC token for a short-lived Bella key — no stored credentials needed.

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    permissions:
      id-token: write
      contents: read
    steps:
      - run: bella sdk run -p my-project -e production -- ./deploy.sh
```

See [Keyless / Workload Identity](/features/keyless) for full setup.

---

## Issuing Scoped Tokens

```sh
bella issue --scope stripe,payment          # 15-min token (default)
bella issue --scope stripe --ttl 30         # 30-minute token
TOKEN=$(bella issue --scope stripe)         # capture token
```

---

## Agent Sidecar

Watches secrets for changes and keeps local files in sync:

```yaml
# bella-agent.yaml
watches:
  - project: my-project
    environment: production
    poll-interval: 30

sinks:
  - type: dotenv
    path: ./.env
  - type: json
    path: ./secrets.json

process:
  signal: sighup
  pid-file: ./app.pid
```

```sh
bella agent --init    # scaffold config
bella agent           # start sidecar
```

---

## PKI Certificates

Issue TLS/X.509 certificates from Bella's internal CA (backed by OpenBao PKI engine).

```sh
# 1. Configure the CA (one-time per environment)
bella pki configure \
  --environment staging \
  --common-name "Acme Corp Staging CA" \
  --organization "Acme Corp" \
  --country US

# 2. Create a role (controls what CNs/SANs can be issued)
bella pki roles create \
  --name web-server \
  --allowed-domains internal.example.com \
  --allow-subdomains \
  --max-ttl 720h \
  --default-ttl 24h

# 3. Issue a certificate
bella pki issue \
  --environment staging \
  --role web-server \
  --cn api.internal.example.com \
  --alt-names "www.internal.example.com" \
  --ttl 24h \
  --out ./certs/api.staging
# Writes: api.staging.crt  api.staging.key  api.staging-chain.pem

# 4. View CA cert and ACME directory URL
bella pki ca --environment staging
bella pki ca --output /etc/ssl/certs/acme-corp-ca.pem   # save to trust store

# 5. Revoke a certificate
bella pki revoke --serial "1a:2b:3c:..."

# Other
bella pki roles list
bella pki roles delete --name web-server
bella pki tidy       # remove expired / revoked cert storage from OpenBao
```

> The CA private key is generated inside OpenBao and **never leaves it**. Bella never stores private keys.

See [PKI Certificates](/features/pki-certificates) for CA setup, ACME auto-renewal (Caddy, certbot, cert-manager), and security notes.

---

## MCP Server

Connect to Claude, GitHub Copilot, or Cursor with an API key — no `bella login` needed:

```json
// Claude Desktop — claude_desktop_config.json
{
  "mcpServers": {
    "bella-baxter": {
      "command": "bella",
      "args": ["mcp"],
      "env": { "BELLA_BAXTER_API_KEY": "bax-<your-api-key>" }
    }
  }
}
```

```sh
bella mcp --print-config   # print config snippet for your AI host
```

See [MCP / AI Integration](/integrations/mcp-ai) for full details.

---

## Typed Secret Code Generation

```sh
bella secrets generate typescript
bella secrets generate csharp --namespace MyApp --output AppSecrets.g.cs
bella secrets generate python --output app_secrets.py
bella secrets generate go
bella secrets generate java
bella secrets generate php
bella secrets generate ruby
bella secrets generate swift
bella secrets generate dart
```

Generates a typed class that reads from environment variables at runtime — no secret values embedded.
