# Secrets at Runtime

::: tip
Looking for dynamic secrets (short-lived database credentials)? See [Dynamic database credentials](/features/dynamic-database-credentials).
:::

This page is about fetching secrets **at runtime** in your application, instead of writing them to a `.env` file at startup. The secrets keep their value; your application sees a new value when it changes in the provider.

## The Three Approaches

### 1. `bella run --watch` (CLI)

The simplest approach — Bella CLI polls for changes and **restarts your process** when secrets change:

```sh
bella run --watch -- node server.js
bella run --watch --poll-interval 10 -- npm start
bella run --watch --signal sighup -- gunicorn app:app   # stop the old process politely (SIGTERM)
```

Every time the secrets change, `bella run --watch` starts a new process with the new secrets and stops the old one. It never sends a signal that asks the running process to reload itself.

| Flag | Default | Description |
|------|---------|-------------|
| `--watch` | off | Enable polling |
| `--poll-interval <seconds>` | 30 | How often to check |
| `--signal restart\|sighup` | `restart` | How the old process is stopped. `restart` = kill it (SIGKILL); `sighup` = ask it to stop with SIGTERM instead. Either way a new process is started. SIGHUP is not sent |

If you want a running process to reload its secrets without a restart, use the agent sidecar below: it can send SIGHUP to a process whose ID is in a PID file.

### 2. Agent Sidecar (`bella agent`)

A long-running daemon that watches secrets and writes local files. Use in production where you don't want the CLI to own the process lifecycle. After it rewrites the files, it can signal a process that is already running: it reads the process ID from `pid-file` and sends `signal` (`sighup`, `sigterm` or `none`) to it.

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

### 3. From an SDK

The SDKs fetch secrets when you ask for them. Which SDK can also keep them fresh for you differs by language:

- **JavaScript / TypeScript:** `createBellaConfig` loads the secrets and then checks for changes in the background. Set `pollingInterval` (milliseconds, default 60000) to change how often. It fetches the secrets again only when the version changes, and calls `onUpdate` with what changed. Call `destroy()` to stop the polling.
- **.NET and Java:** the configuration provider can poll in the same way (`PollingInterval` in .NET; `pollingEnabled` and `pollingInterval` in Java, where polling is off by default).
- **Python and Go:** there is no background refresh. Call the fetch again when you need fresh values. To avoid downloading everything each time, ask for the secrets version first (`GET /api/v1/projects/{projectRef}/environments/{envSlug}/secrets/version`) and fetch again only when it has changed.

::: code-group

```typescript [JavaScript / TypeScript]
import { createBellaConfig } from '@bella-baxter/sdk'

const bella = await createBellaConfig({
  baxterUrl: process.env.BELLA_BAXTER_URL!,
  apiKey: process.env.BELLA_BAXTER_API_KEY!,
  projectSlug: 'my-project',
  environmentSlug: 'production',
  pollingInterval: 60_000,  // milliseconds
  onUpdate: (changes) => console.log('Changed:', changes.map((c) => c.key)),
})

const dbUrl = bella.get('DATABASE_URL')
```

```python [Python]
import os
from bella_baxter import BaxterClient, BaxterClientOptions

client = BaxterClient(BaxterClientOptions(
    baxter_url=os.environ["BELLA_BAXTER_URL"],
    api_key=os.environ["BELLA_BAXTER_API_KEY"],
))

# Call this on your own schedule
current = client.get_secrets_version().version
if current != last_version:
    secrets = client.get_all_secrets().secrets
    last_version = current
```

```go [Go]
client, err := bellabaxter.New(bellabaxter.Options{
    BaxterURL: os.Getenv("BELLA_BAXTER_URL"),
    ApiKey:    os.Getenv("BELLA_BAXTER_API_KEY"),
})
if err != nil {
    log.Fatal(err)
}

// Call this on your own schedule
v, err := client.GetSecretsVersion(ctx, "my-project", "production")
if err == nil && v.Version != lastVersion {
    resp, err := client.GetAllSecrets(ctx, "my-project", "production")
    if err == nil {
        secrets = resp.Secrets
        lastVersion = v.Version
    }
}
```

:::

## Choosing an Approach

| Approach | Best for | Process restart? |
|----------|----------|-----------------|
| `bella run --watch` | Development, scripts | Yes, always: it starts a new process and stops the old one |
| Agent sidecar | Production, long-running services | No (it updates files and can send SIGHUP to a running process) |
| SDK | Microservices, containerised apps | No (JavaScript, .NET and Java can refresh in memory; in Python and Go you fetch again yourself) |

## Hash-Based Efficient Polling

The agent sidecar uses a lightweight endpoint, `GET /api/v1/projects/{projectRef}/environments/{envSlug}/providers/{providerSlug}/secrets/hash`, that returns an opaque change token for the current secret set — not a digest of the values: compare it for equality with the last one you saw, nothing more. The full secrets are only fetched when the token changes — minimising API calls and bandwidth. The SDKs use a similar check, `GET /api/v1/projects/{projectRef}/environments/{envSlug}/secrets/version`, which returns the environment's version number. The token changes once when Bella is upgraded to the keyed form, so every watcher refetches once.

---

## Database Credentials {#database-credentials}

Short-lived database credentials have their own page: [Dynamic database credentials](/features/dynamic-database-credentials).
