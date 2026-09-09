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
| `actor.ip` | The caller's IP address — see [Which address is recorded](#which-address-is-recorded) |
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

## Which address is recorded

`actor.ip` is the address of the **caller**, not of the reverse proxy or CDN in front of Bella.

Bella reads the standard forwarding chain, and it believes an asserted originating address only when
it arrives from a hop the deployment has declared trusted. Two consequences worth knowing:

- **A caller cannot change what is recorded about it.** Sending your own `X-Forwarded-For` header does
  nothing: each hop appends, and the chain is walked from the connecting end until it reaches a sender
  that is not a declared hop — which is you. The same rule is what stops a caller obtaining extra
  rate-limit allowance by varying a claimed address.
- **If a deployment's trust is not configured, addresses degrade toward the proxy's** — the older
  behaviour — never toward a value a caller supplied.

### Operator configuration

Most deployments need none.

| Your setup | What to configure |
|---|---|
| Clients reach your own reverse proxy directly (DNS-only in front) | **Nothing.** DNS is not a hop. |
| A CDN or WAF fronts your proxy | **One setting:** `ClientAddress__TrustedEdge=cloudflare` |

Without the second one, rows on a CDN-fronted deployment carry the CDN edge's address rather than your
customer's — which is the safe direction to fail in, but not the one you want.

## Country and city labels, and what they disclose

The console can show a country and city beside an address. Doing so means **sending that address to a
third-party location provider**, so it is **off by default** and stays off until an operator configures
a provider endpoint.

- Turn it on with `ClientAddress__GeolocationEnabled=true` and
  `ClientAddress__GeolocationEndpoint=https://<your-provider>/…`. The endpoint must be `https`; a plain
  `http` endpoint is refused at startup, and the process will not boot with one.
- **Turn it off at any time** by removing `ClientAddress__GeolocationEnabled`. Lookups stop
  immediately; nothing else changes. Whether lookups are on or off never affects whether an access is
  recorded.
- **Internal addresses are never sent.** Private, loopback, link-local, carrier-shared and reserved
  addresses — including ones written in an alternate notation such as `::ffff:10.0.0.1` — are excluded
  before any request is made.
- A failed, refused or slow lookup never delays or fails the operation being audited. The row is
  written with its address and no city.
