# Secrets

Bella Baxter manages secrets as key-value pairs stored in your external provider (Vault, AWS, Azure, GCP). Secret **values are never stored in Bella's database** — they flow through the API in-memory only.

## Create a Secret

::: code-group

```sh [CLI]
bella secrets set DATABASE_URL                      # prompts; keeps the value off your shell history
printf %s "$DATABASE_URL" | bella secrets set DATABASE_URL --stdin   # scripts and CI
bella secrets set GCP_SA_KEY --from-file sa.json    # a file, bytes as-is
bella secrets set DATABASE_URL "postgres://user:pass@host/db"        # convenient, but see the warning
```

> **Do not pass a value as an argument in automation.** It is visible in `ps` while the command runs,
> it lands in shell history, and any CI runner that echoes the command it ran will log it. Use
> `--stdin` or `--from-file`. Use `printf %s` rather than `echo`, which appends a newline that
> becomes part of the value.

```http [API]
POST /api/v1/environments/{envId}/providers/{providerId}/secrets
Content-Type: application/json

{
  "key": "DATABASE_URL",
  "value": "postgres://user:pass@host/db"
}
```

:::

## List Secrets

Key names are returned; the CLI always masks the values (`***`). To read values, use `bella secrets get` (see below).

```sh
bella secrets list
```

## Read a Secret

`bella secrets get` downloads all secrets of the environment; it does not take a key. To read one secret, ask for JSON and pick the key:

```sh
bella secrets get --format json | jq -r '.DATABASE_URL'
```

Or read it through the process environment of a command Bella starts:

```sh
bella run -- sh -c 'echo "$DATABASE_URL"'
```

Pass `-p <project> -e <environment>` to target a specific environment (otherwise the `.bella` file is used).

## Update a Secret

```sh
bella secrets set DATABASE_URL "postgres://newhost/db"
```

The provider handles versioning automatically. Vault creates a new version; AWS Secrets Manager stores the new version with a timestamp.

## Delete a Secret

```sh
bella secrets delete OLD_API_KEY
```

Deletion is proxied to the provider. Vault soft-deletes (recoverable); AWS hard-deletes by default.

## Import from `.env` File

```sh
bella secrets push -i .env          # push all key=value pairs
bella secrets push -i .env -p my-api -e staging   # into a specific environment
```

## Export to `.env` File

```sh
bella pull                  # write .env in current directory
bella pull -o json          # write secrets.json
bella pull -o yaml          # write secrets.yaml
```

## Secret Versioning

When the underlying provider supports versioning (Vault, AWS), Bella exposes the history: list a secret's versions, read
an older one, roll back to it, and soft-delete or restore a version. These are in the console and the
[REST API](/api-reference/) (`listSecretVersions`, `getSecretVersion`, `rollbackSecret`) today.

::: warning Planned — not in the CLI yet
The version commands, `bella secrets versions` and `bella secrets rollback`, are on the roadmap and are not in the CLI yet.
Until then, use the console or the REST API above.
:::

```sh
bella secrets rollback DATABASE_URL   # revert to previous version
```

## Secret Path Convention

Secrets are namespaced per environment to prevent cross-environment collisions:

```
{tenant}/{environment_slug}/{key}
```

Example: `acme/production/DATABASE_URL`

This path is managed by Bella — you never need to set it manually.

## JSON Secrets

Secret values can be JSON objects. Bella stores the raw JSON string in the provider. When exported to `.env`, the value is JSON-escaped on a single line.

```sh
bella secrets set CONFIG '{"host":"db.example.com","port":5432}'
```

In `.env` output:
```
CONFIG="{\"host\":\"db.example.com\",\"port\":5432}"
```

## Typed Secrets

Generate a typed accessor class for your language:

```sh
bella secrets generate typescript
bella secrets generate csharp
bella secrets generate python
```

See [Typed Secret Code Generation](/cli/#typed-secret-code-generation) for all languages and options.

## Drift Detection

Bella can detect when secrets in different environments have drifted out of sync. See [Projects](/features/projects#drift-detection) for setup.
