# Environments

An **Environment** represents a deployment stage (e.g., `dev`, `staging`, `production`) within a project. Each environment has its own isolated set of secrets.

## Create an Environment

```sh
bella environments create --project my-api --name "Production"
```

Environments have a slug used in API keys and CLI commands. You do not choose the slug: Bella derives it from the name (`Production` becomes `production`). If the project already has an environment with that slug, Bella adds a short suffix. Run `bella environments list --project my-api` to see the slug.

## Assign a Provider

Each environment must have at least one provider assigned before secrets can be stored. `--provider` takes the provider's slug (see `bella providers list`):

```sh
bella environments add-provider production \
  --project my-api \
  --provider aws-production
```

## Members and Access

Access to an environment is separate from access to its project. A person can reach an environment only if they are a member of it (directly or through a group), or if they are an organisation Owner or Admin. The person who creates an environment becomes its Owner. You choose who else can use it, which lets you keep a sensitive environment (e.g., `production`) to a subset of users:

::: warning Planned — not in the CLI yet
`bella environments add-member` and `remove-member` are on the roadmap and are not in the CLI yet. Until then, manage environment access in the WebApp or with the [REST API](/api-reference/). The examples below show the planned syntax.
:::

```sh
# Grant user access to this specific environment
bella environments add-member \
  --project my-api \
  --environment production \
  --user alice@example.com \
  --role ENVIRONMENT_MEMBER

# Remove user from environment
bella environments remove-member \
  --project my-api \
  --environment production \
  --user alice@example.com
```

| Role | Permissions |
|------|-------------|
| `ENVIRONMENT_OWNER` | Full control of this environment: change, delete or restore it, decide who belongs to it and which providers it uses, and manage its secrets |
| `ENVIRONMENT_MANAGER` | Manage the environment's secrets and other content, and administer the environment itself, the same as the Owner in practice |
| `ENVIRONMENT_MEMBER` | Read the environment's secrets |
| `ENVIRONMENT_VIEWER` | Read the environment's secrets |

Creating, changing and deleting secrets, assigning providers and managing members all need `ENVIRONMENT_OWNER` or `ENVIRONMENT_MANAGER` (or an organisation Owner or Admin). The `ENVIRONMENT_MEMBER` and `ENVIRONMENT_VIEWER` roles can read.

## Copy an Environment

Copy all secrets from one environment to another:

::: warning Planned — not in the CLI yet
`bella environments copy` is on the roadmap and is not in the CLI yet. Until then, use the WebApp or the [REST API](/api-reference/). The example below shows the planned syntax.
:::

```sh
bella environments copy \
  --from my-api/staging \
  --to my-api/production
```

::: warning
This copies secret values from one provider to another. Ensure both environments have compatible providers.
:::

## Lease Policy

Each environment has a lease policy. It sets how long the [lease](/features/secret-leases) recorded for each bulk fetch of the environment's secrets stays active, and it caps the lifetime of workload leases. It does not make secrets expire and it does not take access away.

::: warning Planned — not in the CLI yet
`bella environments set-lease-policy` is on the roadmap and is not in the CLI yet. Until then, set the lease policy with the [REST API](/api-reference/).
:::

```http
PUT /api/v1/projects/{project}/environments/{env}/lease-policy
Content-Type: application/json

{ "defaultTtlMinutes": 1440, "maxTtlMinutes": 10080, "allowRenewal": true }
```

See [Secret Leases](/features/secret-leases) for full details.

## Delete an Environment

```sh
bella environments delete --project my-api --environment staging
```

Deleting an environment archives it; it does not destroy it. The environment's secrets in the external provider are **not** deleted. Bella also withdraws the environment's own certificate authority: it can no longer issue certificates, but nothing is destroyed. You can restore the environment from the WebApp or with `POST /api/v1/projects/{projectRef}/environments/{envSlug}/restore`, and the authority works again. If the environment stays deleted for 30 days, Bella destroys the authority, and restoring the environment after that does not bring it back.

## Directory Context (`.bella` file)

The CLI uses a `.bella` file in your project directory to remember which project and environment to target — no need to pass `-p`/`-e` flags every time.

```sh
# Create a .bella file interactively (select project + environment)
bella context init

# Or write it manually
echo 'project = my-api\nenvironment = staging' > .bella
```

The `.bella` file is directory-scoped (like `.git`). The CLI walks up the directory tree to find it, so you can run bella commands from any subdirectory of your project.

```sh
# With a .bella file present — no flags needed
bella secrets list
bella run -- npm start
bella sdk run -- ./deploy.sh
```

To switch environments temporarily without editing the file, use a session context:

```sh
bella context use my-api/production   # sets $BELLA_BAXTER_PROJECT / $BELLA_BAXTER_ENV for the session
```

::: tip
`bella context use` requires the shell function installed by `bella shell init`. Without it, the env vars are set only in the CLI subprocess and don't affect your current shell session.
:::
