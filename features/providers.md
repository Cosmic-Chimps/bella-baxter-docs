# Providers

A **Provider** is a connection to an external secret store. You configure it once with credentials; Bella proxies all secret reads and writes through it.

## Supported Provider Types

| Type | Description |
|------|-------------|
| `Vault` / OpenBao | HashiCorp Vault or OpenBao (KV secrets engine) |
| `VaultDatabase` | OpenBao / Vault Database secrets engine — ephemeral DB credentials |
| `AwsSecretsManager` | AWS Secrets Manager |
| `AwsParameterStore` | AWS Systems Manager Parameter Store |
| `AzureKeyVault` | Azure Key Vault |
| `GoogleSecretManager` | GCP Secret Manager |
| `HttpRest` | Custom HTTP endpoint — bring your own secret backend |

## System Provider

Every tenant automatically gets a **System Provider** — a Bella-managed OpenBao instance. It requires no configuration. Use it immediately after signing up.

The system provider's ID is well-known (`00000000-0000-0000-0000-000000000001`) and is pre-assigned to every new project.

## Create a Provider

::: code-group

```sh [CLI]
bella providers create \
  --name "AWS Production" \
  --type AwsSecretsManager \
  --region us-east-1 \
  --access-key-id AKIAXXXXXXXX \
  --secret-access-key secret
```

```http [API]
POST /api/v1/providers
Content-Type: application/json

{
  "name": "AWS Production",
  "type": "AwsSecretsManager",
  "configuration": {
    "region": "us-east-1",
    "accessKeyId": "AKIAXXXXXXXX",
    "secretAccessKey": "***"
  }
}
```

:::

Sensitive configuration values (access keys, tokens, client secrets) are **encrypted at rest** using ASP.NET Data Protection before storing. They are masked in all API responses as `***ENCRYPTED***`.

## Provider Scoping

Providers are **tenant-scoped** — they can be assigned to multiple projects:

```
Tenant
 └── "AWS Production" provider
       ├── assigned to "Project Alpha"
       └── assigned to "Project Beta"
```

## Assign a Provider to a Project

```sh
bella providers assign --project my-project --provider "AWS Production"
```

Or from the WebApp: **Project → Providers → Assign Provider**

## Assign a Provider to an Environment

Each environment within a project can use a specific provider:

```sh
bella environments assign-provider \
  --project my-project \
  --environment production \
  --provider "AWS Production"
```

Multiple providers can be assigned to one environment — Bella reads from the primary provider and optionally syncs to others.

## Test a Provider Connection

```sh
bella providers test my-provider-id
```

Verifies that credentials are valid and the API is reachable.

## Vault / OpenBao Configuration

```json
{
  "type": "Vault",
  "configuration": {
    "url": "https://vault.example.com",
    "mountPath": "secret",
    "authMethod": "AppRole",
    "roleId": "...",
    "secretId": "..."
  }
}
```

Supported Vault auth methods: `AppRole`, `Token`, `Kubernetes`, `GitHub`.

## AWS Secrets Manager Configuration

```json
{
  "type": "AwsSecretsManager",
  "configuration": {
    "region": "us-east-1",
    "accessKeyId": "AKIAXXXXXXXX",
    "secretAccessKey": "***"
  }
}
```

IAM role-based auth is also supported — omit `accessKeyId`/`secretAccessKey` when running on EC2 or ECS with an instance role.

## Azure Key Vault Configuration

```json
{
  "type": "AzureKeyVault",
  "configuration": {
    "vaultUrl": "https://my-vault.vault.azure.net",
    "tenantId": "...",
    "clientId": "...",
    "clientSecret": "***"
  }
}
```

Managed Identity is supported — omit credentials when running on Azure resources with a system-assigned identity.

## VaultDatabase (Dynamic Credentials) Configuration

The `VaultDatabase` provider type connects to OpenBao's **Database secrets engine** to generate
short-lived database credentials on demand. Unlike other provider types, it does not store static
secrets — it issues ephemeral credentials with an automatic TTL.

```json
{
  "type": "VaultDatabase",
  "configuration": {
    "server_url": "https://vault.example.com",
    "auth_method": "approle",
    "role_id": "...",
    "mount_path": "database",
    "default_role": "app-readwrite",
    "connection_url_template": "postgres://{username}:{password}@db.example.com:5432/myapp"
  }
}
```

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `server_url` | ✅ | — | Vault / OpenBao base URL |
| `auth_method` | ✅ | `approle` | `approle` or `token` |
| `role_id` | AppRole | — | AppRole role ID |
| `secret_id` | AppRole | — | AppRole secret ID (stored encrypted) |
| `root_token` | Token | — | Root / service token (stored encrypted) |
| `mount_path` | — | `database` | Mount path of the Database secrets engine |
| `default_role` | — | — | Default OpenBao role when none is specified |
| `connection_url_template` | — | — | Template with `{username}` / `{password}` placeholders |

When `connection_url_template` is set, the generate endpoint returns a ready-to-use
`connectionUrl` with credentials already substituted.

### Setting up OpenBao for dynamic credentials

Before configuring the Bella provider, enable and configure the Database secrets engine in OpenBao:

```sh
# Enable the database engine
vault secrets enable database

# Configure a Postgres connection
vault write database/config/my-postgres \
  plugin_name=postgresql-database-plugin \
  allowed_roles="app-readwrite" \
  connection_url="postgresql://{{username}}:{{password}}@postgres:5432/myapp" \
  username="vault-admin" \
  password="admin-password"

# Create a role (TTL 1 hour)
vault write database/roles/app-readwrite \
  db_name=my-postgres \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
  default_ttl="1h" \
  max_ttl="24h"
```

The Bella provider's AppRole policy must allow `read` on `database/creds/*`:

```hcl
path "database/creds/*" {
  capabilities = ["read"]
}

path "database/roles/*" {
  capabilities = ["list", "read"]
}
```

See [Dynamic Database Credentials](/features/dynamic-secrets#database-credentials) for usage.

## HttpRest — Custom HTTP Provider

The `HttpRest` provider type lets you connect any secret backend that you control. Bella sends a single signed POST request to your endpoint for every secret operation. Use it to:

- Keep secrets in your own database or internal API without granting Bella cloud credentials
- Proxy to a legacy secret store that doesn't have a native Bella adapter
- Self-host on-premises with a fully custom secret backend

### How It Works

```
Bella API
  └─ POST {your-endpoint}
       X-Bella-Signature: t={unix},v1={hmac-sha256-hex}
       {ApiKeyHeader}: {ApiKey}   // optional

       { "action": "list"|"get"|"set"|"delete", "path": "...", "key": "...", "value": "..." }
```

### Request / Response Contract

| Action   | Request body                                     | Response body                          |
|----------|--------------------------------------------------|----------------------------------------|
| `list`   | `{ action, path, requestId }`                    | `{ "secrets": { "KEY": "value" } }`   |
| `get`    | `{ action, path, key, requestId }`               | `{ "value": "..." }`                  |
| `set`    | `{ action, path, key, value, requestId }`        | `{ "success": true }`                 |
| `delete` | `{ action, path, key, requestId }`               | `{ "success": true }`                 |
| error    | —                                                | non-2xx + `{ "error": "message" }`    |

The `path` is composed as `{namespace_prefix}/{environment_slug}` (e.g. `myapp/production`).

### Signature Verification

Every request carries an `X-Bella-Signature` header using HMAC-SHA256 — the same format used by Bella webhooks and rotation functions:

```
X-Bella-Signature: t={unix-epoch-seconds},v1={hmac-sha256-hex}
```

Verify it in your function using `@bella-baxter/sdk`:

```typescript
import { verifyWebhookSignature } from '@bella-baxter/sdk';

const valid = await verifyWebhookSignature(
  process.env.BELLA_SIGNING_SECRET!,
  req.headers.get('x-bella-signature') ?? '',
  rawBody,
);
if (!valid) return { status: 401 };
```

### Configuration

```json
{
  "type": "HttpRest",
  "configuration": {
    "endpoint": "https://your-function.example.com/bella-secrets",
    "signing_secret": "openssl-rand-hex-32-output",
    "api_key_header": "X-Api-Key",
    "api_key": "your-api-key-or-ref:SECRET_NAME",
    "namespace_prefix": "myapp/production"
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `endpoint` | ✅ | HTTPS URL Bella will POST all operations to |
| `signing_secret` | Recommended | HMAC-SHA256 signing secret. Generate with `openssl rand -hex 32` |
| `api_key_header` | — | HTTP header name to send the API key in (e.g. `X-Api-Key`, `Authorization`) |
| `api_key` | — | API key value, or `ref:SECRET_NAME` to read from the system OpenBao provider |
| `namespace_prefix` | — | Prepended to all paths (e.g. `myapp/production`) |

The `api_key` field supports a secret reference. Use `ref:MY_API_KEY` to read the value from the system provider at `secret/data/_bella-baxter/provider-api-keys/{providerId}` — write it there via Vault CLI or Terraform to enable automatic rotation.

### Function Templates

Ready-to-use templates are available in the [repository](https://github.com/Cosmic-Chimps/bella-baxter/tree/main/apps/templates/custom-provider):

| Platform | Language | Template |
|----------|----------|----------|
| AWS Lambda | Node.js/TypeScript | [`aws-lambda/nodejs`](https://github.com/Cosmic-Chimps/bella-baxter/tree/main/apps/templates/custom-provider/aws-lambda/nodejs) |
| AWS Lambda | C# | [`aws-lambda/csharp`](https://github.com/Cosmic-Chimps/bella-baxter/tree/main/apps/templates/custom-provider/aws-lambda/csharp) |
| GCP Cloud Run | Node.js/TypeScript | [`gcp-cloud-run/nodejs`](https://github.com/Cosmic-Chimps/bella-baxter/tree/main/apps/templates/custom-provider/gcp-cloud-run/nodejs) |
| GCP Cloud Run | C# | [`gcp-cloud-run/csharp`](https://github.com/Cosmic-Chimps/bella-baxter/tree/main/apps/templates/custom-provider/gcp-cloud-run/csharp) |
| Azure Functions | Node.js/TypeScript | [`azure-functions/nodejs`](https://github.com/Cosmic-Chimps/bella-baxter/tree/main/apps/templates/custom-provider/azure-functions/nodejs) |
| Azure Functions | C# | [`azure-functions/csharp`](https://github.com/Cosmic-Chimps/bella-baxter/tree/main/apps/templates/custom-provider/azure-functions/csharp) |
| Docker | Node.js/TypeScript | [`docker/nodejs`](https://github.com/Cosmic-Chimps/bella-baxter/tree/main/apps/templates/custom-provider/docker/nodejs) |
| Docker | C# | [`docker/csharp`](https://github.com/Cosmic-Chimps/bella-baxter/tree/main/apps/templates/custom-provider/docker/csharp) |

The WebApp shows a template snippet preview directly in the provider form — pick a runtime, copy the snippet, download the full template, and implement `listSecrets()`, `getSecret()`, `setSecret()`, and `deleteSecret()`.

### Related

- [Secret Rotation](/features/api-key-rotation) — rotate secrets via an HttpWebhook function (same signing scheme)
- [Rotation Function Templates](https://github.com/Cosmic-Chimps/bella-baxter/tree/main/apps/templates/rotator) — templates for rotation functions


