# Dynamic Secrets

Dynamic secrets are secrets that are fetched **at runtime** by your application (not written to a `.env` file at startup). They update automatically when they change in the provider.

## The Three Approaches

### 1. `bella run --watch` (CLI)

The simplest approach — Bella CLI polls for changes and **restarts your process** when secrets change:

```sh
bella run --watch -- node server.js
bella run --watch --poll-interval 10 -- npm start
bella run --watch --signal sighup -- gunicorn app:app   # reload without restart
```

| Flag | Default | Description |
|------|---------|-------------|
| `--watch` | off | Enable polling |
| `--poll-interval <seconds>` | 30 | How often to check |
| `--signal restart\|sighup` | `restart` | `restart` = kill+respawn; `sighup` = send SIGHUP |

### 2. Agent Sidecar (`bella agent`)

A long-running daemon that watches secrets and writes local files. Use in production where you don't want the CLI to own the process lifecycle.

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

### 3. SDK Refresh Interval

With any Bella SDK, configure a refresh interval and the SDK periodically re-fetches secrets from the API:

::: code-group

```typescript [JavaScript / TypeScript]
const client = new BaxterClient({
  baxterUrl: process.env.BELLA_BAXTER_URL!,
  apiKey: process.env.BELLA_BAXTER_API_KEY!,
  refreshInterval: 60,  // seconds
})
```

```python [Python]
client = BaxterClient(
    baxter_url=os.environ["BELLA_BAXTER_URL"],
    api_key=os.environ["BELLA_BAXTER_API_KEY"],
    refresh_interval=60,
)
```

```go [Go]
client := bellabaxter.NewClient(bellabaxter.ClientOptions{
    BaxterURL:       os.Getenv("BELLA_BAXTER_URL"),
    APIKey:          os.Getenv("BELLA_BAXTER_API_KEY"),
    RefreshInterval: 60 * time.Second,
})
```

:::

## Choosing an Approach

| Approach | Best for | Process restart? |
|----------|----------|-----------------|
| `bella run --watch` | Development, scripts | Yes (by default) |
| Agent sidecar | Production, long-running services | No (SIGHUP or file update) |
| SDK refresh interval | Microservices, containerised apps | No (in-memory refresh) |

## Hash-Based Efficient Polling

Bella uses a lightweight `GET /secrets/hash` endpoint that returns only a hash of the current secret set. The full `GET /secrets` is only called when the hash changes — minimising API calls and bandwidth.

---

## Database Credentials {#database-credentials}

> **VaultDatabase provider** — generate ephemeral database credentials via OpenBao's Database secrets engine.

`VaultDatabase` providers work differently from other provider types. Instead of storing static
secrets, they **generate short-lived database usernames and passwords** on demand. Credentials
expire automatically at the end of the lease — no manual revocation required.

### Prerequisites

1. A `VaultDatabase` provider configured in Bella (see [VaultDatabase configuration](/features/providers#vaultdatabase-dynamic-credentials-configuration))
2. The provider assigned to your environment (Environment → Providers tab)
3. OpenBao Database secrets engine enabled with at least one role

### Generate credentials via WebApp

Navigate to **Environment → Dynamic Credentials**. Bella shows all `VaultDatabase` providers
assigned to the environment. Select a role, optionally set a TTL, and click **Generate Credentials**.

The UI displays:
- `DATABASE_URL` (if `connection_url_template` is configured) — with copy button and masked reveal
- `username` and `password` — individual copy buttons
- Live TTL countdown (green → amber → red as expiry approaches)
- Lease ID for manual revocation if needed

### Generate credentials via API

```http
POST /api/v1/projects/{projectRef}/environments/{envSlug}/providers/{providerSlug}/credentials/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "app-readwrite",
  "ttlSeconds": 3600
}
```

```json
{
  "username": "v-approle-app-readwri-XXXXXX",
  "password": "A1B2-C3D4-E5F6",
  "expiresAt": "2026-03-17T17:00:00Z",
  "leaseDurationSeconds": 3600,
  "leaseId": "database/creds/app-readwrite/XXXX",
  "connectionUrl": "postgres://v-approle-app-readwri-XXXXXX:A1B2-C3D4-E5F6@db:5432/myapp"
}
```

Leave `role` null to use the provider's `default_role`.

### List available roles

```http
GET /api/v1/projects/{projectRef}/environments/{envSlug}/providers/{providerSlug}/credentials/roles
```

Returns the list of role names configured in OpenBao's database engine mount.

### `bella exec` — inject ephemeral credentials into a subprocess

The primary CLI integration for ephemeral database credentials:

```sh
# Run database migrations with short-lived credentials
bella exec --provider pg-prod -- npx prisma migrate deploy

# Run tests with their own ephemeral credentials (no shared test DB user)
bella exec --provider pg-dev -- pytest tests/

# The subprocess environment receives:
# DB_USERNAME=v-approle-...
# DB_PASSWORD=A1B2-...
# DATABASE_URL=postgres://v-approle-...:A1B2-...@db:5432/myapp
```

Credentials are generated just-in-time when `bella exec` starts and expire after the TTL.
They are never written to disk.

### Security characteristics

| Property | Value |
|----------|-------|
| Credentials stored by Bella | ❌ Never |
| Credentials stored in `.env` | ❌ Only if you write them there |
| Rotation on each call | ✅ Always — every call is a new user |
| Revocation on expiry | ✅ Automatic (by OpenBao) |
| Audit trail | ✅ Access log entry per generation |
| Security scan | ✅ Skipped — ephemeral creds are not flagged |

