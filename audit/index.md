# Audit Logs

Every operation in Bella Baxter is logged — secret reads, writes, deletes, authentication events, key rotations, and administrative changes.

## Access the Audit Log

From the WebApp: **Project → Audit Logs**

```sh
bella audit list --project my-api
bella audit list --project my-api --environment production
bella audit list --project my-api --since 2026-03-01
bella audit list --project my-api --actor alice@example.com
bella audit list --project my-api --event SecretRead
```

## Log Entry Fields

Each log entry contains:

| Field | Description |
|-------|-------------|
| `timestamp` | UTC timestamp |
| `event` | Event type (e.g. `SecretRead`, `SecretUpdated`, `ApiKeyRevoked`) |
| `actor.type` | `User`, `ApiKey`, `TrustToken` |
| `actor.email` / `actor.name` | Who performed the action |
| `actor.ip` | IP address |
| `projectSlug` | Project |
| `environmentSlug` | Environment |
| `resource` | What was acted upon (secret key name, provider name, etc.) |
| `outcome` | `Success` or `Denied` |
| `requestId` | Correlation ID for tracing |

## Event Types

| Event | Description |
|-------|-------------|
| `SecretRead` | A secret value was read |
| `SecretCreated` | A secret was created |
| `SecretUpdated` | A secret was updated |
| `SecretDeleted` | A secret was deleted |
| `SecretsBulkPulled` | All secrets fetched (e.g. `bella pull`) |
| `ApiKeyCreated` | An API key was created |
| `ApiKeyRevoked` | An API key was revoked |
| `UserLogin` | A user logged in |
| `UserLoginFailed` | A failed login attempt |
| `TrustTokenIssued` | A keyless OIDC exchange was accepted |
| `TrustTokenRejected` | An OIDC exchange was rejected |
| `LeaseIssued` | A short-lived lease was issued |
| `LeaseRevoked` | A lease was revoked |
| `MemberAdded` | A user was added to a project or environment |
| `MemberRemoved` | A user was removed |
| `ProviderCreated` | A new provider was configured |
| `SshKeySigned` | An SSH public key was signed |

## Filtering

```sh
# All events for a specific user
bella audit list --actor alice@example.com

# Only secret reads in production
bella audit list --environment production --event SecretRead

# Denied access attempts (potential security issue)
bella audit list --outcome Denied

# Export as JSON
bella audit list --output json > audit.json

# Export as CSV
bella audit list --output csv > audit.csv
```

## Access Log vs Audit Log

Bella maintains two distinct logs:

| | **Access Log** | **Audit Log** |
|--|--------------|--------------|
| What it captures | Every API request (including reads) | All state changes + access (union of both) |
| Retention | 90 days (default) | 365 days (default) |
| Use for | Real-time monitoring | Compliance, investigations |

The **Access Log** is the raw per-request log. The **Audit Log** is the curated, event-typed log for compliance use.

## Compliance

The audit log supports common compliance requirements:

- **SOC 2** — access control evidence, change management trail
- **ISO 27001** — access logging, incident trail
- **HIPAA** — audit controls for covered entities
- **GDPR** — data access trail for subject access requests

Audit log streaming to SIEM systems (Splunk, Datadog, Azure Monitor) is an Enterprise feature.

## Retention

Default retention: 365 days. Contact your instance admin to adjust.
