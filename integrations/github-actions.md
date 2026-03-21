# GitHub Actions

The `bella-get-secrets` GitHub Action pulls secrets from Bella Baxter and exposes them as masked environment variables in your workflow.

## Quick Start

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    permissions:
      id-token: write   # required for keyless auth
      contents: read
    steps:
      - uses: actions/checkout@v6

      - name: Pull secrets from Bella Baxter
        uses: cosmic-chimps/bella-get-secrets@v1
        with:
          project: my-api
          environment: production
          bella-url: https://your-instance.bella-baxter.io
          # No API key needed — uses OIDC keyless auth

      - name: Deploy
        run: ./deploy.sh
        # DATABASE_URL, STRIPE_KEY, etc. are now available as env vars
```

## Authentication Options

### Option A: Keyless (Recommended)

No stored credentials. Uses GitHub's OIDC token to authenticate:

```yaml
permissions:
  id-token: write

steps:
  - uses: cosmic-chimps/bella-get-secrets@v1
    with:
      project: my-api
      environment: production
      bella-url: ${{ vars.BELLA_BAXTER_URL }}
```

Requires a [Trust Domain](/features/keyless) configured in Bella Baxter pointing at your repository.

### Option B: API Key

```yaml
steps:
  - uses: cosmic-chimps/bella-get-secrets@v1
    with:
      api-key: ${{ secrets.BELLA_BAXTER_API_KEY }}
      bella-url: ${{ vars.BELLA_BAXTER_URL }}
```

Store `BELLA_BAXTER_API_KEY` as a GitHub Actions secret (not a Bella secret — this is the bootstrap credential).

## Action Inputs

| Input | Required | Description |
|-------|----------|-------------|
| `bella-url` | Yes | Your Bella Baxter instance URL |
| `api-key` | No | API key (required if not using keyless auth) |
| `project` | No | Project slug (inferred from API key if omitted) |
| `environment` | No | Environment slug (inferred from API key if omitted) |
| `export-env` | No (default: `true`) | Export secrets as step environment variables |
| `output-file` | No | Write secrets to a `.env` file at this path |
| `prefix` | No | Add a prefix to all exported variable names |

## Outputs

All secrets from the environment are exported as **masked** environment variables. They appear as `***` in logs even if accidentally `echo`-ed.

```yaml
- uses: cosmic-chimps/bella-get-secrets@v1
  with:
    project: my-api
    environment: production
    bella-url: ${{ vars.BELLA_BAXTER_URL }}

- name: Use a secret
  run: echo "Connecting to $DATABASE_URL"  # prints "Connecting to ***"
```

## Using `bella exec` Instead

For more control, use the Bella CLI directly in your workflow:

```yaml
- name: Install Bella CLI
  run: curl -sSfL https://raw.githubusercontent.com/cosmic-chimps/bella-baxter/main/scripts/install-bella.sh | sh

- name: Deploy
  run: bella exec -p my-api -e production -- ./deploy.sh
  env:
    BELLA_BAXTER_API_KEY: ${{ secrets.BELLA_BAXTER_API_KEY }}
    BELLA_BAXTER_URL: ${{ vars.BELLA_BAXTER_URL }}
```

## Matrix Deployments

Deploy to multiple environments in parallel:

```yaml
strategy:
  matrix:
    environment: [staging, production]
steps:
  - uses: cosmic-chimps/bella-get-secrets@v1
    with:
      project: my-api
      environment: ${{ matrix.environment }}
      bella-url: ${{ vars.BELLA_BAXTER_URL }}
```
