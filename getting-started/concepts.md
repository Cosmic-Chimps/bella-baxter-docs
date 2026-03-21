# Core Concepts

Understanding how Bella Baxter organises your secrets.

## Architecture Overview

Bella Baxter is a **gateway**, not a secret store. Your secret values live in the external provider you already operate. Bella Baxter manages access, context, and identity — it never holds the raw secret values.

```
Your App
  └── Bella CLI / SDK
        └── Bella Baxter API
              └── Secret Provider (Vault, AWS, Azure, GCP...)
                    └── Your secret values (stored here, not in Bella)
```

---

## Key Concepts

### Tenant

The top-level isolation boundary. When you sign up (or deploy a self-hosted instance), you get one tenant. Your team, projects, and providers all live inside your tenant.

Multi-tenant setups (running Bella for multiple organisations on one instance) are an Enterprise feature.

### Provider

A **Provider** is a connection to an external secret store. You configure it once with credentials and a URL. Bella uses it to read and write secrets on your behalf.

Supported provider types:

| Type | Description |
|------|-------------|
| `Vault` / OpenBao | HashiCorp Vault or OpenBao — the default system provider |
| `AwsSecretsManager` | AWS Secrets Manager |
| `AwsParameterStore` | AWS Systems Manager Parameter Store |
| `AzureKeyVault` | Azure Key Vault |
| `GoogleSecretManager` | GCP Secret Manager |
| `HttpRest` | Any generic HTTP secret API |

Every tenant automatically gets a **System Provider** — a Bella-managed OpenBao instance. You can use it immediately without any configuration.

### Project

A **Project** is a logical grouping of secrets, usually corresponding to one application or service. Projects have members with roles (Owner, Manager, Member, Consumer).

Projects are assigned one or more Providers. Secrets for a project are stored in those providers.

### Environment

An **Environment** is a slice of a project for a deployment stage: `dev`, `staging`, `production`, etc. Each environment:
- Has its own set of secrets (isolated from other environments)
- Can be assigned a subset of the project's providers
- Can have its own member access list

A secret for `DATABASE_URL` in `dev` is completely separate from `DATABASE_URL` in `production`.

### Secret

A **Secret** is a key-value pair stored in a provider. Bella Baxter never stores the value itself — it proxies reads and writes to the provider.

Secret values can be:
- Plain strings (`my-api-key`)
- JSON objects (useful for structured config)
- Binary data

### API Key

An **API Key** (`bax-...`) is a long-lived machine credential scoped to one project+environment. Use API keys in CI/CD pipelines, servers, and SDK clients.

Short-lived tokens can be issued from an API key using `bella issue` for zero-trust patterns.

### Trust Domain

A **Trust Domain** enables **keyless authentication** — no static API key required. Workloads present a short-lived OIDC token (from GitHub Actions, Kubernetes, etc.) and Bella exchanges it for a scoped secret token. No secrets in your CI/CD YAML.

---

## Data Hierarchy

```
Tenant
 └── Providers (tenant-scoped, reusable across projects)
 └── Projects
      └── Providers (assigned to this project)
      └── Members (with roles)
      └── Environments (dev, staging, production…)
           └── Providers (subset of project providers)
           └── Members (optional per-environment access)
           └── Secrets (stored in the environment's provider)
```

---

## How `bella pull` Works

1. CLI reads your context (project + environment from `.bella` file or `BELLA_BAXTER_API_KEY`)
2. Sends a request to the Bella Baxter API
3. API resolves the provider for your environment
4. API fetches secrets from the external provider (Vault, AWS…)
5. Secrets are returned to the CLI
6. CLI writes them to `.env` or injects them into a child process

The secret values travel from provider → API → CLI. They are **never stored in Bella's database**.
