# API Keys

API keys (`bax-...`) are long-lived machine credentials for CI/CD pipelines, servers, and SDK clients.

## Create an API Key

From the WebApp: **Project → Settings → API Keys → Create Key**

Or via CLI:

::: warning Planned — not in the CLI yet
The `bella api-keys` commands (`create`, `list`, `rotate`, `revoke`) are on the roadmap and are not available in the CLI yet. Until then, manage keys from the WebApp (**Project → Settings → API Keys**) or the [REST API](/api-reference/). The examples below show the planned syntax.
:::

```sh
bella api-keys create \
  --project my-api \
  --environment production \
  --name "GitHub Actions deploy"
```

An API key encodes:
- The project slug
- The environment slug
- A signing secret for HMAC request authentication

## Using API Keys

```sh
# Set as environment variable
export BELLA_BAXTER_URL=https://your-instance.bella-baxter.io
export BELLA_BAXTER_API_KEY=bax-...

# Or use with bella CLI
bella login
bella run -- ./deploy.sh
```

## Key Format

```
bax-{keyId}-{signingSecret}
```

Keys are prefixed with `bax-` for easy identification in logs and `git grep`.

## Issue Short-Lived Tokens

For zero-trust patterns — issue a token that expires automatically:

```sh
bella issue --scope stripe,payment --ttl 15
```

The scoped token (`bax-...`) can only access the named secret scopes and expires after the TTL. It reads secrets and never issues credentials: TLS and SSH certificates, TOTP codes, database credentials and further tokens are refused to it (`403 scope-limited-token`). Use an unscoped key for automation that issues them.

| Flag | Default | Description |
|------|---------|-------------|
| `--scope <names>` | required | Comma-separated scope names |
| `--ttl <minutes>` | `15` | Token lifetime (1–480 min) |
| `--reason <text>` | `cli-issued-token` | Audit label |

## Rotate a Key

::: warning Planned — not in the CLI yet
`bella api-keys rotate` is on the roadmap and is not in the CLI yet. Until then, rotate from the WebApp (**Project → Settings → API Keys**) or the [REST API](/api-reference/).
:::

```sh
bella api-keys rotate my-key-id
```

The old key is invalidated immediately. Issue a new key and update your services.

## Revoke a Key

::: warning Planned — not in the CLI yet
`bella api-keys revoke` is on the roadmap and is not in the CLI yet. Until then, revoke from the WebApp (**Project → Settings → API Keys**) or the [REST API](/api-reference/).
:::

```sh
bella api-keys revoke my-key-id
```

Revoked keys are rejected immediately by all API endpoints.

## List Keys

::: warning Planned — not in the CLI yet
`bella api-keys list` is on the roadmap and is not in the CLI yet. Until then, list keys in the WebApp (**Project → Settings → API Keys**) or with the [REST API](/api-reference/).
:::

```sh
bella api-keys list --project my-api --environment production
```

Keys are shown with their name, creation date, and last-used timestamp. The secret portion of the key is never shown after creation.

## Keyless Alternative

For GitHub Actions and Kubernetes, you don't need a stored API key at all. See [Keyless / Workload Identity](/features/keyless) for setup.

## Security Best Practices

- **One key per service** — if a key leaks, you can revoke just that service
- **Name keys descriptively** — `"GitHub Actions - deploy"` vs just `"CI"`
- **Use short-lived tokens** (`bella issue`) when passing credentials to subprocesses or AI agents
- **Rotate regularly** — set a calendar reminder to rotate keys every 90 days
- **Use keyless auth** in GitHub Actions and Kubernetes — no stored keys at all
