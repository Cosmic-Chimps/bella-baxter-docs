# Secrets

Bella Baxter manages secrets as key-value pairs stored in your external provider (Vault, AWS, Azure, GCP). Secret **values are never stored in Bella's database** — they flow through the API in-memory only.

## Create a Secret

::: code-group

```sh [CLI]
bella secrets set DATABASE_URL "postgres://user:pass@host/db"
bella secrets set DATABASE_URL  # prompts for value (keeps it off shell history)
```

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

Key names are returned; values are always masked unless you explicitly request them.

```sh
bella secrets list
bella secrets list --show-values   # requires elevated permissions
```

## Read a Secret

```sh
bella secrets get DATABASE_URL
```

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
bella secrets push .env            # push all key=value pairs
bella secrets push .env --dry-run  # preview without writing
```

## Export to `.env` File

```sh
bella pull                  # write .env in current directory
bella pull -o json          # write secrets.json
bella pull -o yaml          # write secrets.yaml
```

## Secret Versioning

When the underlying provider supports versioning (Vault, AWS), you can access historical values:

```sh
bella secrets get DATABASE_URL --version 3
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
