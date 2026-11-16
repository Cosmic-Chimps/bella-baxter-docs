# API Keys

API keys (`bax-...`) are long-lived machine credentials for CI/CD pipelines, servers, and SDK clients.

## Create an API Key

An API key belongs to one environment. From the WebApp: open a project, choose the **Environments** tab, open the environment, choose its **API Keys** tab, then choose **Create API Key**.

Or via CLI:

::: warning Planned — not in the CLI yet
The `bella api-keys` commands (`create`, `list`, `revoke`) are on the roadmap and are not available in the CLI yet. Until then, manage keys from the WebApp (the environment's **API Keys** tab) or the [REST API](/api-reference/). The examples below show the planned syntax.
:::

```sh
bella api-keys create \
  --project my-api \
  --environment production \
  --name "GitHub Actions deploy"
```

The key is a token of the form `bax-{keyId}-{signingSecret}`. It holds only an identifier and a secret. Bella keeps the project, the environment and the key's role on the server, so the token tells a reader nothing about what it can reach.

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

To give a job a credential limited to named scopes that expires on its own, issue a token:

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

There is no rotate action yet, so a key cannot be replaced in one step. To rotate a key:

1. Create a new key for the same environment, with the same role.
2. Move each service to the new key.
3. Once nothing uses the old key, revoke it. See [Revoke a Key](#revoke-a-key).

The old key keeps working until you revoke it.

## Revoke a Key

::: warning Planned — not in the CLI yet
`bella api-keys revoke` is on the roadmap and is not in the CLI yet. Until then, revoke from the WebApp (the environment's **API Keys** tab) or the [REST API](/api-reference/).
:::

```sh
bella api-keys revoke my-key-id
```

Revoked keys are rejected immediately by all API endpoints.

In the WebApp, **Delete API Key** on the environment's **API Keys** tab revokes the key. It cannot be undone. To stop a key without ending it, choose **Deactivate**. A deactivated key is refused until you choose **Activate**.

## List Keys

::: warning Planned — not in the CLI yet
`bella api-keys list` is on the roadmap and is not in the CLI yet. Until then, list keys in the WebApp (the environment's **API Keys** tab) or with the [REST API](/api-reference/).
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
- **Rotate regularly** — set a calendar reminder to replace keys every 90 days (create a new key, move your services, then revoke the old one)
- **Use keyless auth** in GitHub Actions and Kubernetes — no stored keys at all
