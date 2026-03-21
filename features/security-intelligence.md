# Security Intelligence

Security Intelligence scans your environments for security issues — weak passwords, exposed credentials, policy violations, and misconfigured secrets — and surfaces them in a unified security dashboard.

Security Intelligence is always free. Detecting a weak password should not require an enterprise contract.

## Security Dashboard

The WebApp security dashboard shows:
- Open security findings per project/environment
- Severity breakdown (Critical, High, Medium, Low)
- Finding trends over time
- Quick-fix actions

Navigate to: **WebApp → Security → Dashboard**

## Run a Scan

```sh
bella security scan --project my-api --environment production
```

Scans run automatically on:
- Secret creation/update
- Scheduled scan (configurable, default: daily)
- Manual trigger via CLI or WebApp

## Scan Rules

| Rule | Description | Severity |
|------|-------------|----------|
| Weak password | Entropy analysis — detects passwords like `password123` | High |
| Common password | Checks against HIBP top 10k passwords | High |
| Low entropy | Random-looking but short values | Medium |
| Default credential | Known default credentials (`admin/admin`, etc.) | Critical |
| Test/dummy value | Detects placeholder values in production (`changeme`, `todo`) | High |
| Secret in key name | Key name contains the value (e.g. `DATABASE_URL=DATABASE_URL`) | Critical |
| Unused secret | Secret not accessed in 90+ days (drift risk) | Low |
| No expiry policy | Environment has no lease policy | Medium |

## View Findings

```sh
bella security findings list --project my-api
bella security findings list --severity High,Critical
bella security findings get <finding-id>
```

## Dismiss a Finding

```sh
bella security findings dismiss <finding-id> --reason "Intentional test environment value"
```

Dismissed findings are logged with the reason and the dismissing user.

## Configure Scan Policy

```sh
bella security policy set \
  --project my-api \
  --min-entropy 3.5 \
  --require-lease-policy true \
  --scan-interval daily
```

## Notifications on Findings

Subscribe your Slack or Teams channel to receive alerts on new critical findings:

```sh
bella notifications subscribe \
  --channel "Security Teams" \
  --events SecurityScanFailed \
  --project my-api
```

See [Notifications](/features/notifications) for setup.

## API

```http
GET /api/v1/security/findings?projectId=...&severity=High

POST /api/v1/security/scans
Content-Type: application/json
{
  "projectId": "...",
  "environmentId": "..."
}
```
