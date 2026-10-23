# Environments

An **Environment** represents a deployment stage (e.g., `dev`, `staging`, `production`) within a project. Each environment has its own isolated set of secrets.

## Create an Environment

```sh
bella environments create --project my-api --name "Production" --slug production
```

Environments have a slug used in API keys and CLI commands.

## Assign a Provider

Each environment must have at least one provider assigned before secrets can be stored. `--provider` takes the provider's slug (see `bella providers list`):

```sh
bella environments add-provider production \
  --project my-api \
  --provider aws-production
```

## Members and Access

By default, project members inherit access to all environments. You can restrict a sensitive environment (e.g., `production`) to a subset of users:

::: warning Planned — not in the CLI yet
`bella environments add-member` and `remove-member` are on the roadmap and are not in the CLI yet. Until then, manage environment access in the WebApp or with the [REST API](/api-reference/). The examples below show the planned syntax.
:::

```sh
# Grant user access to this specific environment
bella environments add-member \
  --project my-api \
  --environment production \
  --user alice@example.com \
  --role MEMBER

# Remove user from environment
bella environments remove-member \
  --project my-api \
  --environment production \
  --user alice@example.com
```

| Role | Permissions |
|------|-------------|
| `ENVIRONMENT_OWNER` | Full control of this environment |
| `MEMBER` | Read and write secrets |
| `CONSUMER` | Read-only |

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

You can configure an automatic lease policy on an environment — secrets expire after a set duration and must be explicitly re-issued:

::: warning Planned — not in the CLI yet
`bella environments set-lease-policy` is on the roadmap and is not in the CLI yet. Until then, set the lease policy in the WebApp or with the [REST API](/api-reference/). The example below shows the planned syntax.
:::

```sh
bella environments set-lease-policy \
  --project my-api \
  --environment production \
  --ttl 24h \
  --warn-before 2h
```

See [Secret Leases](/features/secret-leases) for full details.

## Delete an Environment

```sh
bella environments delete --project my-api --environment staging
```

Secrets in the external provider are **not** deleted when an environment is removed from Bella.

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
