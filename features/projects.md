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
| `OWNER` | Full control — can delete the project, manage all members |
| `PROJECT_MANAGER` | Can manage environments, providers, and members |
| `MEMBER` | Can read and write secrets in assigned environments |
| `CONSUMER` | Read-only access to secrets |

```sh
bella projects add-member --project my-api --user alice@example.com --role MEMBER
bella projects remove-member --project my-api --user alice@example.com
```

## Assign Providers

Providers must be assigned to a project before they can be used by its environments:

```sh
bella providers assign --project my-api --provider "AWS Production"
```

Multiple providers can be assigned. Each environment picks which one to use.

## Drift Detection

Drift detection compares secrets across environments to flag inconsistencies — e.g., `DATABASE_URL` exists in `dev` but is missing in `production`.

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

```sh
# Export project config (providers, environments, members — no secret values)
bella projects export --project my-api > my-api.yaml

# Import into a new project
bella projects import my-api.yaml --project my-api-copy
```

## Delete a Project

```sh
bella projects delete my-api
```

Deleting a project removes it from Bella's database (soft delete). Secret values in the external provider are **not** deleted — they remain in Vault, AWS, etc. until explicitly removed from the provider side.
