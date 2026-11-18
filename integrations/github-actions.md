# GitHub Actions

The `bella-baxter-setup-action` installs the Bella CLI as a self-contained binary on your runner — Linux, macOS, or Windows. No Node.js, no .NET runtime, no package manager required. Once installed, use the Bella CLI directly in your workflow steps.

## Quick Start

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: cosmic-chimps/bella-baxter-setup-action@v0
        with:
          bella-url: ${{ vars.BELLA_BAXTER_URL }}

      # The CLI reads BELLA_BAXTER_API_KEY from the environment. A key passed as a command
      # argument is visible in the runner's process list and in its command log (#833).
      - run: bella run -p my-api -e production -- ./deploy.sh
        env:
          BELLA_BAXTER_API_KEY: ${{ secrets.BELLA_BAXTER_API_KEY }}
        # DATABASE_URL, STRIPE_KEY, etc. are injected as env vars
```

## Action Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `version` | No | `latest` | CLI version to install (e.g. `1.2.3`) |
| `bella-url` | No | — | API base URL, exported as `BELLA_BAXTER_URL` for all subsequent steps. With `oidc: 'true'` and no URL, `https://api.bella-baxter.io` is used. Self-hosted: your API origin, not the console's. |
| `oidc` | No | `false` | Set to `'true'` to exchange the job's GitHub OIDC token for a short-lived Bella key. Requires `id-token: write`, a [Trust Domain](/features/keyless) for this repository, and `tenant`, `project` and `environment`. Exports `BELLA_BAXTER_API_KEY` (masked; legacy alias `BELLA_API_KEY`) for subsequent steps. |
| `tenant` | With `oidc` | — | Tenant (organisation) slug. Falls back to `BELLA_BAXTER_TENANT` in the job's `env`. |
| `project` | With `oidc` | — | Project slug. Falls back to `BELLA_BAXTER_PROJECT`. |
| `environment` | With `oidc` | — | Environment slug. Falls back to `BELLA_BAXTER_ENV`. |
| `audience` | No | `bella-baxter` | OIDC audience to request. Must be one the Trust Domain accepts. Falls back to `BELLA_OIDC_AUDIENCE`. |

### Which version to use

The examples on this page use `@v0`. It follows the latest `0.x` release of the action, so you stay on the
newest version without editing your workflows, and a future breaking `1.0` never reaches you on its own.
`@latest` follows every release, including a breaking one. For maximum supply-chain safety, pin a full
commit SHA instead (`@<sha> # v0.1.1-preview.N`). See
[the tag list](https://github.com/Cosmic-Chimps/bella-baxter-setup-action/tags) for the releases.

### Keyless instead of a stored key

Every example below that is not keyless authenticates with the `BELLA_BAXTER_API_KEY` environment variable, which
means a long-lived credential in your repository secrets. If you would rather not have one, `oidc: 'true'`
replaces the secret:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write   # required for the OIDC token
      contents: read
    steps:
      - uses: actions/checkout@v6
      - uses: cosmic-chimps/bella-baxter-setup-action@v0
        with:
          bella-url: ${{ vars.BELLA_BAXTER_URL }}   # optional; default https://api.bella-baxter.io
          oidc: 'true'
          tenant: my-org
          project: my-api
          environment: production
      # The issued key is scoped to that environment, so -p / -e are not needed.
      - run: bella run -- ./deploy.sh
```

The action exports the issued key as `BELLA_BAXTER_API_KEY` (and the legacy name `BELLA_API_KEY`), masked in the log.
`tenant`, `project` and `environment` are required with `oidc`: Bella looks for the trust domain of that
environment, and the step fails early if one is missing. You can also set `BELLA_BAXTER_TENANT`,
`BELLA_BAXTER_PROJECT` and `BELLA_BAXTER_ENV` in the job's `env`; an input wins when both are set.

`bella run` also takes the three as flags, `bella run -t my-org -p my-api -e production -- ./deploy.sh`, and the
environment-variable form above stays valid. Each is resolved on its own: a flag beats the variable, which beats a
`.bella` in the repository, and a flag never changes the other two values. If a keyless exchange would run but
one is still empty, `bella run` sends nothing and names the missing ones (for example "missing: environment", with
`--env <slug>`, `BELLA_BAXTER_ENV` or the `environment` key of `.bella` as ways to supply it), instead of reporting "Not logged in".

`bella-url` is the **API** address (`https://api.bella-baxter.io` for the hosted service, your API origin when
self-hosted), not the console's. See [Keyless / Workload Identity](/features/keyless) for the Trust Domain this
needs, including the claim rules it accepts.

`bella run` does not mask the secret values it injects. Do not echo them in a step.

**Tenants that require registered devices.** The sign-in also binds a throwaway device key to the issued key, and
the action exports its private half, masked, as `BELLA_BAXTER_PRIVATE_KEY`. `bella run -- ./deploy.sh` finds it
with no key options, and the action needs no new input. The key is useful only with that API key, which expires
with the trust domain's token lifetime. See [Tenants that require registered devices](/features/keyless#_3-tenants-that-require-registered-devices).

**Token audience.** The action asks GitHub for a token minted for Bella, with audience `bella-baxter`, so
it works against a trust domain that accepts the default with nothing to configure. If your trust domain
accepts a different audience, for example its recommended per-environment value, pass it as the `audience`
input (or set `BELLA_OIDC_AUDIENCE` for the job). It must be one the trust domain accepts. If you call Bella
without the CLI, request the audience yourself: `core.getIDToken('bella-baxter')`.

GitHub's default audience (`https://github.com/<owner>`) is shared with every other service that accepts
it, so a trust domain enforcing its audience refuses it.

## Action Outputs

| Output | Description |
|--------|-------------|
| `bella-version` | The installed Bella CLI version string |

## Authentication

### Option A: API Key

Store your API key as a GitHub Actions secret, then set it as the `BELLA_BAXTER_API_KEY` environment variable:

```yaml
- uses: cosmic-chimps/bella-baxter-setup-action@v0
  with:
    bella-url: ${{ vars.BELLA_BAXTER_URL }}

# The CLI reads BELLA_BAXTER_API_KEY from the environment. A key passed as a command
# argument is visible in the runner's process list and in its command log (#833).
# Declare it as job or step env:
#   env:
#     BELLA_BAXTER_API_KEY: ${{ secrets.BELLA_BAXTER_API_KEY }}
```

### Option B: Keyless — Trust Domain (Recommended for CI/CD)

No stored credentials. The job authenticates using GitHub's OIDC token. Requires a [Trust Domain](/features/keyless) configured in Bella Baxter for your repository.

```yaml
permissions:
  id-token: write   # required
  contents: read

steps:
  - uses: cosmic-chimps/bella-baxter-setup-action@v0
    with:
      bella-url: ${{ vars.BELLA_BAXTER_URL }}
      oidc: 'true'
      tenant: my-org
      project: my-api
      environment: production

  # No login step: the action already exported BELLA_BAXTER_API_KEY for this environment.
  - run: bella run -- ./deploy.sh
```

## Workflow Patterns

### Pattern 1 — Inject secrets as environment variables

`bella run` wraps your command and injects all secrets as environment variables. Nothing is written to disk.

```yaml
- uses: cosmic-chimps/bella-baxter-setup-action@v0
  with:
    bella-url: ${{ vars.BELLA_BAXTER_URL }}

# The CLI reads BELLA_BAXTER_API_KEY from the environment. A key passed as a command
# argument is visible in the runner's process list and in its command log (#833).
- run: bella run -p my-api -e production -- ./deploy.sh
  env:
    BELLA_BAXTER_API_KEY: ${{ secrets.BELLA_BAXTER_API_KEY }}
```

### Pattern 2 — Keyless (zero stored credentials)

```yaml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: cosmic-chimps/bella-baxter-setup-action@v0
        with:
          bella-url: ${{ vars.BELLA_BAXTER_URL }}
          oidc: 'true'
          tenant: my-org
          project: my-api
          environment: production

      - run: bella run -- ./deploy.sh
```

### Pattern 3 — SSH certificate signing

Issue a short-lived SSH certificate via Bella's SSH CA for passwordless access to production:

```yaml
- uses: cosmic-chimps/bella-baxter-setup-action@v0
  with:
    bella-url: ${{ vars.BELLA_BAXTER_URL }}

# The CLI reads BELLA_BAXTER_API_KEY from the environment. A key passed as a command
# argument is visible in the runner's process list and in its command log (#833).
- run: bella ssh sign --key ~/.ssh/id_ed25519.pub --role deployer
  env:
    BELLA_BAXTER_API_KEY: ${{ secrets.BELLA_BAXTER_API_KEY }}

- run: ssh -i ~/.ssh/id_ed25519-cert.pub deploy@prod ./deploy.sh
```

### Pattern 4 — Generate and rotate a secret

`bella generate` runs fully offline (pure crypto — no API call). Useful for secret rotation pipelines:

```yaml
- uses: cosmic-chimps/bella-baxter-setup-action@v0
  with:
    bella-url: ${{ vars.BELLA_BAXTER_URL }}

# The CLI reads BELLA_BAXTER_API_KEY from the environment. A key passed as a command
# argument is visible in the runner's process list and in its command log (#833).
- env:
    BELLA_BAXTER_API_KEY: ${{ secrets.BELLA_BAXTER_API_KEY }}
  run: |
    NEW_PASS=$(bella generate --length 32 --quiet)
    printf %s "$NEW_PASS" | bella secrets set DB_PASSWORD --stdin -p my-api -e production
    # Then rotate the actual DB credential with the same value
```

## Matrix Deployments

Deploy to multiple environments in parallel:

```yaml
strategy:
  matrix:
    environment: [staging, production]
steps:
  - uses: cosmic-chimps/bella-baxter-setup-action@v0
    with:
      bella-url: ${{ vars.BELLA_BAXTER_URL }}

  # The CLI reads BELLA_BAXTER_API_KEY from the environment. A key passed as a command
  # argument is visible in the runner's process list and in its command log (#833).
  - run: bella run -p my-api -e ${{ matrix.environment }} -- ./deploy.sh
    env:
      BELLA_BAXTER_API_KEY: ${{ secrets.BELLA_BAXTER_API_KEY }}
```

## Pin a specific CLI version

```yaml
# Pin both the action version AND the CLI binary version independently
- uses: cosmic-chimps/bella-baxter-setup-action@v0
  with:
    version: '1.2.3'          # CLI binary (from GitHub Releases)
    bella-url: ${{ vars.BELLA_BAXTER_URL }}
```

## Advanced: AI Agent Workflows (MCP)

When running GitHub Copilot coding agent workflows or custom AI pipelines, `bella mcp` acts as an MCP proxy server — giving the agent access to secrets, TOTP codes, SSH signing, and token issuance as MCP tools.

```yaml
- uses: cosmic-chimps/bella-baxter-setup-action@v0
  with:
    bella-url: ${{ vars.BELLA_BAXTER_URL }}

# Expose the API key to bella mcp via environment variable
- run: echo "BELLA_BAXTER_API_KEY=${{ secrets.BELLA_BAXTER_API_KEY }}" >> $GITHUB_ENV
```

Configure your MCP host to launch `bella mcp` — print the exact config snippet with:

```bash
bella mcp --print-config
```

For regular CI/CD pipelines, use `bella sdk run` or `bella run` directly — `bella mcp` is only needed for AI agent workflows.
