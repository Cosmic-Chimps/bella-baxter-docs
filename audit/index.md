# Audit Logs

Bella Baxter records access to secrets and the administrative actions around them: reads, writes and deletes of secrets, token and workload identity exchanges, refused requests, share activity, and changes to members and their roles. Some operations are not recorded yet; see [What is not recorded](#what-is-not-recorded).

## Access the Audit Log

From the WebApp: **Project → Audit Logs**

::: warning Planned — not in the CLI yet
`bella audit list` is on the roadmap and is not in the CLI yet. Until then, read the audit log in the WebApp (**Project → Audit Logs**) or through the [REST API](/api-reference/).
:::

```sh
curl "$BELLA_URL/api/v1/access-logs?projectSlug=my-api&from=2026-03-01T00:00:00Z" \
  -H "Authorization: Bearer $TOKEN"
```

The listing is paged (`page`, `size`; 50 rows by default, newest first). See [Filtering](#filtering) for the filters it accepts.

An organisation administrator reads every row. Anyone else reads only the rows of the projects and environments they can reach, and the response says so with `scopeLimited: true`.

## Log Entry Fields

Each row is a flat record:

| Field | Description |
|-------|-------------|
| `timestamp` | UTC timestamp |
| `action` | What happened, for example `get`, `update`, `export_all` or `secret_access_denied`. See [Actions](#actions) |
| `actorType` | `user`, `api_key`, `assistant`, `workload` or `anonymous`, or one of Bella's own components: `scheduler`, `cert-manager`, `internal_service` |
| `userId` / `userName` | The person who acted, when the actor is a user |
| `apiKeyId` / `apiKeyName` | The API key that acted, when the actor is a key |
| `ipAddress` | The caller's IP address — see [Which address is recorded](#which-address-is-recorded) |
| `userAgent` | The caller's `User-Agent` header |
| `bellaClient` / `appClient` | Client labels reported by the caller — see below |
| `projectSlug` / `environmentSlug` | Project and environment. Empty on rows that belong to neither |
| `secretKey` | The name of the secret the action touched, when there is one. Never the value |
| `detail` | Free-text detail of the action |
| `deviceFingerprint` | The registered device that made the call, when the caller presented one |
| `country` / `city` / `countryCode` | Present only when location lookups are on — see [Country and city labels](#country-and-city-labels-and-what-they-disclose) |

A row has no `outcome` field and no request ID. A refusal is recorded as its own action (`secret_access_denied`, `secret_scope_denied`, `oidc_exchange_refused`). The envelope streamed to a SIEM adds an `outcome` of `success` or `denied`, derived from the action.

Some rows written by Bella's own components carry `internal-service`, with a hyphen, as the actor type. Match both spellings in a rule.

### The "App" label is reported by the client, not verified

The console's **App** column, and the `bellaClient` / `appClient` fields of a streamed audit record (`client.bellaClient` and `client.app` in the envelope), are what the caller *said* it was, taken from the `X-Bella-Client` and `X-App-Client` request headers. Bella does not verify them, so do not write a rule that treats either as proof of who called; the actor, API key or user id and the IP address are the fields Bella establishes.

Bella limits what a caller can put there. `bellaClient` is one of Bella's own clients (`bella-cli`, `bella-webapp`, `bella-mcp`, `bella-dotnet-sdk`, `bella-js-sdk`, and the other `bella-*-sdk` names), or the literal `unrecognised` when the caller sent anything else; it is empty only when the caller sent nothing. `appClient` is the name you gave your own application (`bella exec --app`), with control characters removed and cut to 64 characters.

## Actions

The most common actions. This is not the full list: write rules against the action names you see in your own log.

| Action | Recorded when |
|--------|---------------|
| `get` | One secret's value was read |
| `list` | The keys held in a provider were listed |
| `create`, `update`, `delete` | A secret was created, updated or deleted |
| `export_all` | All of an environment's secrets were fetched together (for example `bella pull`) |
| `import`, `upload` | Secrets were imported in bulk, or from an uploaded file |
| `version_get`, `version_list` | An earlier version of a secret was read, or its history was listed |
| `secret_access_denied` | A secret operation was attempted and refused |
| `secret_scope_denied` | A scoped token was refused a secret outside its scopes, or was shown a narrowed listing |
| `token_minted` | A short-lived scoped token was issued (`bella issue`) |
| `oidc_token_exchanged`, `oidc_exchange_refused` | An OIDC token exchange was accepted or refused |
| `svid_issued`, `jwt_svid_issued`, `attestation_denied` | A workload identity was issued, or a workload's attestation was refused |
| `lease_revoked` | A workload lease was revoked |
| `share_create`, `share_view`, `share_unlock`, `share_revoke` | [Secure share](/features/secure-shares) activity |
| `member_role_changed`, `member_removed`, `member_suspended`, `member_restored` | A member's role or standing changed — see [Team members](/features/team-members) |
| `security_insight_acknowledged`, `security_insight_acknowledgement_withdrawn` | A security finding was acknowledged, or the acknowledgement was undone |
| `project_deleted` | A project was deleted |

## What is not recorded

These operations do not write an audit row today:

- **Adding a member, and invitations.** Adding a person to a project or to an environment, inviting someone to the organisation and accepting an invitation write no row. Removing a member and changing a role are recorded.
- **API keys created or revoked by a person.**
- **Revoking a registered device.** The key rotation a person can start afterwards is recorded as `device_key_rotation_started`, `device_key_rotation_completed` or `device_key_rotation_refused`. The revocation itself is not.
- **Revoking a secret lease.** Revoking a workload lease is recorded as `lease_revoked`. See [Secret Leases](/features/secret-leases).
- **Certificates issued through the ACME endpoint.** Issuing or revoking a certificate through the API or the WebApp is recorded in the PKI log.

If one of your controls depends on evidence of these operations, keep that evidence outside Bella for now.

## Filtering

The listing accepts these query parameters, alone or combined:

| Parameter | Filters by |
|-----------|-----------|
| `projectSlug`, `environmentId` | Project or environment |
| `action` | One action name |
| `actorType` | One actor type |
| `apiKeyId` | One API key |
| `deviceFingerprint` | One registered device |
| `from`, `to` | Time range (ISO 8601) |
| `search` | Free text |

```sh
# Only reads of single secrets in one project
curl "$BELLA_URL/api/v1/access-logs?projectSlug=my-api&action=get" \
  -H "Authorization: Bearer $TOKEN"

# Refused secret operations (worth an alert)
curl "$BELLA_URL/api/v1/access-logs?action=secret_access_denied" \
  -H "Authorization: Bearer $TOKEN"
```

## The four logs

Bella keeps four separate logs. Everything above describes the first, which is the one the console's **Audit Logs** page shows.

| Log | What it records | REST listing |
|-----|-----------------|--------------|
| Secret access log | Access to secrets and the administrative actions described on this page | `GET /api/v1/access-logs` |
| SSH log | SSH keys signed and SSH role changes (`ssh_sign`, `ssh_role_create`, `ssh_role_delete`) | `GET /api/v1/ssh/logs` |
| PKI log | Certificates issued or revoked through the API or the WebApp, and PKI role changes (`pki_cert_issue`, `pki_cert_revoke`, `pki_role_create`, `pki_role_delete`) | `GET /api/v1/pki/logs` |
| Certificate rotation log | Certificate rotation runs, on self-hosted deployments that use certificate rotation | `GET /api/v1/cert-rotation/logs` |

## Compliance

The audit log supports common compliance requirements:

- **SOC 2** — access control evidence, change management trail
- **ISO 27001** — access logging, incident trail
- **HIPAA** — audit controls for covered entities
- **GDPR** — data access trail for subject access requests

Audit log streaming to SIEM systems (Splunk, Datadog, Azure Monitor) is an Enterprise feature.

### What a SIEM receives, and what CEF cannot carry

The JSON destinations (generic HTTPS, Splunk HEC, Datadog, Azure Monitor) receive every event as one JSON
envelope whose `raw` member holds the whole stored audit row. A few of its members matter for detection rules:

- `raw.scopeNarrowing` (`{ "providerKeys": n, "globalKeys": n }`) is present on a `secret_scope_denied` event written when a
  token limited to some scopes listed secrets and some were left out. The counts are how many keys were hidden per layer
  (`null` where that layer was not queried, never `0` for "not asked"); key names are never included. A `secret_scope_denied`
  event **without** it is a refused read of one named secret.
- `raw.trustDomainId`, `raw.presentedAudiences` and `raw.audienceMatched` describe a token exchange or workload
  attestation: which trust domain was evaluated, which audiences the caller presented, and whether they matched.
  The presented audiences are values the caller supplied and Bella did not verify: at most 8 values of 256 characters,
  with control characters replaced. Treat them as untrusted input when you display them (events stored before this
  protection existed are not rewritten).

**The CEF (syslog over TLS) destination carries only the promoted fields and no `raw`.** It therefore cannot tell a
narrowed listing from a refused read, and it does not carry the trust domain or the presented audiences. If a rule
depends on those, use a JSON destination.

## Retention

Bella has no automatic retention or purge for audit rows, and no setting to configure one. Rows stay by default. That is the absence of a policy, not a retention guarantee: on a self-hosted instance, whoever operates the database can still delete rows. If you need a fixed retention period, or a copy outside Bella, stream the log to your SIEM and apply the retention there.

## Which address is recorded

`ipAddress` is the address of the **caller**, not of the reverse proxy or CDN in front of Bella.

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
