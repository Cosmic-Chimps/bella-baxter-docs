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

      - uses: cosmic-chimps/bella-baxter-setup-action@v1.0.0
        with:
          bella-url: ${{ vars.BELLA_BAXTER_URL }}

      - run: bella login --api-key ${{ secrets.BELLA_BAXTER_API_KEY }}

      - run: bella exec -p my-api -e production -- ./deploy.sh
        # DATABASE_URL, STRIPE_KEY, etc. are injected as env vars
```

## Action Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `version` | No | `latest` | CLI version to install (e.g. `1.2.3`) |
| `bella-url` | No | — | API base URL — exported as `BELLA_BAXTER_URL` for all subsequent steps |

## Action Outputs

| Output | Description |
|--------|-------------|
| `bella-version` | The installed Bella CLI version string |

## Authentication

### Option A: API Key

Store your API key as a GitHub Actions secret, then pass it to `bella login`:

```yaml
- uses: cosmic-chimps/bella-baxter-setup-action@v1.0.0
  with:
    bella-url: ${{ vars.BELLA_BAXTER_URL }}

- run: bella login --api-key ${{ secrets.BELLA_BAXTER_API_KEY }}
```

### Option B: Keyless — Trust Domain (Recommended for CI/CD)

No stored credentials. The job authenticates using GitHub's OIDC token. Requires a [Trust Domain](/features/keyless) configured in Bella Baxter for your repository.

```yaml
permissions:
  id-token: write   # required

steps:
  - uses: cosmic-chimps/bella-baxter-setup-action@v1.0.0
    with:
      bella-url: ${{ vars.BELLA_BAXTER_URL }}

  - run: bella run -p my-api -e production -- ./deploy.sh
    # bella detects the OIDC token automatically — no login step needed
```

## Workflow Patterns

### Pattern 1 — Inject secrets as environment variables

`bella exec` wraps your command and injects all secrets as environment variables. Nothing is written to disk.

```yaml
- uses: cosmic-chimps/bella-baxter-setup-action@v1.0.0
  with:
    bella-url: ${{ vars.BELLA_BAXTER_URL }}

- run: bella login --api-key ${{ secrets.BELLA_BAXTER_API_KEY }}

- run: bella exec -p my-api -e production -- ./deploy.sh
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

      - uses: cosmic-chimps/bella-baxter-setup-action@v1.0.0
        with:
          bella-url: ${{ vars.BELLA_BAXTER_URL }}

      - run: bella run -p my-api -e production -- ./deploy.sh
```

### Pattern 3 — SSH certificate signing

Issue a short-lived SSH certificate via Bella's SSH CA for passwordless access to production:

```yaml
- uses: cosmic-chimps/bella-baxter-setup-action@v1.0.0
  with:
    bella-url: ${{ vars.BELLA_BAXTER_URL }}

- run: bella login --api-key ${{ secrets.BELLA_BAXTER_API_KEY }}

- run: bella ssh sign ~/.ssh/id_ed25519.pub --role deployer

- run: ssh -i ~/.ssh/id_ed25519-cert.pub deploy@prod ./deploy.sh
```

### Pattern 4 — Generate and rotate a secret

`bella generate` runs fully offline (pure crypto — no API call). Useful for secret rotation pipelines:

```yaml
- uses: cosmic-chimps/bella-baxter-setup-action@v1.0.0
  with:
    bella-url: ${{ vars.BELLA_BAXTER_URL }}

- run: bella login --api-key ${{ secrets.BELLA_BAXTER_API_KEY }}

- run: |
    NEW_PASS=$(bella generate --length 32 --quiet)
    bella secrets set DB_PASSWORD "$NEW_PASS" -p my-api -e production
    # Then rotate the actual DB credential with the same value
```

## Matrix Deployments

Deploy to multiple environments in parallel:

```yaml
strategy:
  matrix:
    environment: [staging, production]
steps:
  - uses: cosmic-chimps/bella-baxter-setup-action@v1.0.0
    with:
      bella-url: ${{ vars.BELLA_BAXTER_URL }}

  - run: bella login --api-key ${{ secrets.BELLA_BAXTER_API_KEY }}

  - run: bella exec -p my-api -e ${{ matrix.environment }} -- ./deploy.sh
```

## Pin a specific CLI version

```yaml
# Pin both the action version AND the CLI binary version independently
- uses: cosmic-chimps/bella-baxter-setup-action@v1.0.0
  with:
    version: '1.2.3'          # CLI binary (from GitHub Releases)
    bella-url: ${{ vars.BELLA_BAXTER_URL }}
```

## Advanced: AI Agent Workflows (MCP)

When running GitHub Copilot coding agent workflows or custom AI pipelines, `bella mcp` acts as an MCP proxy server — giving the agent access to secrets, TOTP codes, SSH signing, and token issuance as MCP tools.

```yaml
- uses: cosmic-chimps/bella-baxter-setup-action@v1.0.0
  with:
    bella-url: ${{ vars.BELLA_BAXTER_URL }}

# Expose the API key to bella mcp via environment variable
- run: echo "BELLA_BAXTER_API_KEY=${{ secrets.BELLA_BAXTER_API_KEY }}" >> $GITHUB_ENV
```

Configure your MCP host to launch `bella mcp` — print the exact config snippet with:

```bash
bella mcp --print-config
```

For regular CI/CD pipelines, use `bella exec` or `bella run` directly — `bella mcp` is only needed for AI agent workflows.
