# Projects

A **Project** is a logical grouping of secrets and environments, typically corresponding to one application or service.

## Create a Project

```sh
bella projects create --name "My API" --slug my-api
```

Or from the WebApp: **Dashboard → New Project**

Projects have a slug (used in API calls and `.bella` files) and a human-readable name.

## Members and Roles

| Role | Permissions |
|------|-------------|
| `OWNER` | Full control, including deleting the project; manages all members |
| `PROJECT_MANAGER` | Can manage environments, providers, and members |
| `MEMBER` | Can read and write secrets in assigned environments |
| `CONSUMER` | Read-only access to secrets |

::: warning Planned — not in the CLI yet
`bella projects add-member` and `remove-member` are on the roadmap and are not in the CLI yet. Until then, manage project members in the WebApp or with the [REST API](/api-reference/). The example below shows the planned syntax.
:::

```sh
bella projects add-member --project my-api --user alice@example.com --role MEMBER
bella projects remove-member --project my-api --user alice@example.com
```

## Assign Providers

Providers must be assigned to a project before they can be used by its environments:

::: warning Planned — not in the CLI yet
`bella providers assign` is on the roadmap and is not in the CLI yet. Until then, assign providers in the WebApp (**Project → Providers → Assign Provider**) or with the [REST API](/api-reference/). The example below shows the planned syntax.
:::

```sh
bella providers assign --project my-api --provider "AWS Production"
```

Multiple providers can be assigned. Each environment picks which one to use.

## Drift Detection

Drift detection compares secrets across environments to flag inconsistencies — e.g., `DATABASE_URL` exists in `dev` but is missing in `production`.

::: warning Planned — not in the CLI yet
`bella projects drift` is on the roadmap and is not in the CLI yet. The CLI command available today is `bella secrets drift` (add `-p <project>` and `--json`), which prints a cross-environment key presence matrix. The example below shows the planned syntax.
:::

```sh
bella projects drift --project my-api
```

Output:

```
Drift report for my-api
─────────────────────────────────────────────
  ✅ DATABASE_URL    present in dev, staging, production
  ⚠️  FEATURE_FLAGS  present in dev, staging — MISSING in production
  ⚠️  DEBUG_MODE     present in dev only
```

Drift detection is available for all plans — it's a fundamental operational hygiene tool, not an enterprise feature.

## Global Secrets

Secrets set at the project level cascade to all environments unless overridden. Useful for non-sensitive config that is the same everywhere (e.g., `APP_NAME`, `LOG_FORMAT`).

## Export / Import

::: warning Planned — not in the CLI yet
`bella projects export` and `import` are on the roadmap and are not in the CLI yet. Until then, use the WebApp or the [REST API](/api-reference/). The example below shows the planned syntax.
:::

```sh
# Export project config (providers, environments, members — no secret values)
bella projects export --project my-api > my-api.yaml

# Import into a new project
bella projects import my-api.yaml --project my-api-copy
```

## Delete a Project

Deleting a project **deletes its secrets in the providers that hold them**, including providers in your own AWS, Azure,
GCP or Vault account, and the tenant's System Provider. It also deletes the project's data key, revokes its API keys, and
removes its environments, webhooks, notification channels, leases, trust domains, SSH roles and TOTP keys. None of it can
be restored from Bella. If a provider keeps deleted values for a while (a KV v2 soft delete, a cloud recovery window),
recovering them is done in that provider, not in Bella.

**Who may delete:** the project's Owner, or a tenant Owner or Admin. A Project Manager cannot, and no API key can,
whatever its kind: both get the same "not found" any caller without access gets.

**Before deleting, Bella shows what will be destroyed:** each provider that loses secrets, how many (environment and
project-wide), whether it is in your own account, the other resources with their counts, and whether a data key is
deleted. You confirm by typing the project's slug. The console's delete dialog and the CLI both work this way.

```sh
bella projects delete my-api                              # prints the summary, then asks you to type the slug
bella projects delete my-api --dry-run                    # prints the summary and stops
bella projects delete my-api --yes --confirm my-api       # unattended: no prompt, still prints the summary
bella projects delete my-api --yes --confirm my-api --json  # one JSON document: { "preview": …, "result": … }
```

`--yes` (or its older name `--force`) skips the prompt, never the summary, and always needs `--confirm <slug>`: the CLI
never takes the slug from the project argument. Without a terminal and without `--yes`, the command refuses. After a
delete, the clean-up in the providers runs in the background; its result is in **Audit Logs**, where the deletion itself
is recorded as `project_deleted` with the totals that were confirmed.

What is counted is what Bella holds for the project. Keys written straight into a store, never through Bella, are not
counted and not deleted. If a provider cannot be reached, or was already deleted in Bella, its secrets are still removed
from Bella, but their values stay in the store; the per-environment audit row says how many.

Over the API, preview with `GET /api/v1/projects/{projectRef}/deletion-preview`, then call
`DELETE /api/v1/projects/{projectRef}?confirmProjectSlug=<slug>&previewDigest=<digest from the preview>`. A missing or
wrong slug is refused with `422`, a digest from a preview the project has since outgrown with `409` (take a new preview),
and nothing is deleted in either case.
