# API Keys

API keys (`bax-...`) are long-lived machine credentials for CI/CD pipelines, servers, and SDK clients.

## Create an API Key

From the WebApp: **Project → Settings → API Keys → Create Key**

Or via CLI:

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
bella login --api-key bax-...
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

The scoped token (`bax-...`) can only access the named secret scopes and expires after the TTL.

| Flag | Default | Description |
|------|---------|-------------|
| `--scope <names>` | required | Comma-separated scope names |
| `--ttl <minutes>` | `15` | Token lifetime (1–480 min) |
| `--reason <text>` | `cli-issued-token` | Audit label |

## Rotate a Key

```sh
bella api-keys rotate my-key-id
```

The old key is invalidated immediately. Issue a new key and update your services.

## Revoke a Key

```sh
bella api-keys revoke my-key-id
```

Revoked keys are rejected immediately by all API endpoints.

## List Keys

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
