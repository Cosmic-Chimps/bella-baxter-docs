# Secret Leases

A secret lease is a **record** that a caller fetched all of an environment's secrets: who fetched them, when, which keys were returned, and until when the record stays active. Bella writes one automatically after each bulk fetch, such as `bella pull`. Leases show who is holding a copy of an environment's secrets. They do not control access.

::: warning A secret lease does not limit access
Bella does not check leases when it authorises a read. After a lease expires or is revoked, the caller that held it can fetch the same secrets again with the same credentials, and a new lease is recorded. To take access away, remove the member or revoke the API key. For access that ends by itself, issue a [scoped token](#time-limited-access-with-bella-issue). If a copy of a value may already be out, rotate the value at the provider.

This applies to secret leases only. A [workload lease](#workload-leases) is a credential, and revoking it does end that access.
:::

## What a lease records

| Field | Description |
|-------|-------------|
| Holder | The user or API key that fetched the secrets |
| Granted, expires | When the fetch happened, and when the lease stops being active: the grant time plus the environment's [lease policy](#lease-policy-on-an-environment) |
| Keys | The names of the secrets that were returned. Never the values |
| Status | `Active`, `Expired` or `Revoked` |

The lease is written after the secrets have been returned, so a fetch succeeds even if the lease cannot be written. The fetch itself is recorded in the [audit log](/audit/) as `export_all`.

## Lease Policy on an Environment

Each environment has a lease policy with three settings:

| Setting | Default | Effect |
|---------|---------|--------|
| `defaultTtlMinutes` | `60` | How long a new secret lease stays active. 1 to 10080 (7 days) |
| `maxTtlMinutes` | `480` | Upper bound for `defaultTtlMinutes`. It also caps the lifetime of [workload leases](#workload-leases) issued in the environment. 1 to 10080 |
| `allowRenewal` | `true` | Stored, but nothing uses it yet: there is no renew operation |

Set it with the [REST API](/api-reference/). It needs permission to administer the environment:

```http
PUT /api/v1/projects/{project}/environments/{env}/lease-policy
Content-Type: application/json

{ "defaultTtlMinutes": 1440, "maxTtlMinutes": 10080, "allowRenewal": true }
```

The policy changes how long lease records stay active. It does not make secrets or credentials expire, and it does not apply to scoped tokens.

## Notifications

[Webhooks](/features/webhooks) and [notification channels](/features/notifications) can subscribe to `lease.granted` and `lease.expired`. Expiry is checked every 15 minutes, so `lease.expired` can arrive up to 15 minutes after the lease's expiry time. There is no warning before a lease expires.

## List and Revoke Leases

In the WebApp, open the environment's **Leases** tab. With the REST API:

```http
GET    /api/v1/projects/{project}/environments/{env}/leases?status=Active
DELETE /api/v1/projects/{project}/environments/{env}/leases/{leaseId}
```

The list returns active leases unless you pass another `status`. Listing needs permission to administer the environment.

Revoking a secret lease marks the record as `Revoked` and does nothing else:

- No credential is invalidated. The holder can fetch the secrets again.
- The reason asked for in the WebApp is not stored.
- No audit row is written.

An organisation administrator, or an owner or manager of the environment, can revoke any lease. Anyone else can revoke only their own.

::: warning Planned — not in the CLI yet
The `bella leases` commands and `bella environments set-lease-policy` are on the roadmap and are not in the CLI yet. Until then, use the WebApp or the [REST API](/api-reference/).
:::

## Workload Leases

The same list includes workload leases: the short-lived credentials Bella issues to a workload that has proved its identity (see [Workload identity on EC2](/features/spiffe-ec2) and [Workload identity on Nomad](/features/spiffe-nomad)). Unlike a secret lease, a workload lease is a credential. Revoking it revokes that credential, and the revocation is recorded in the audit log as `lease_revoked`. Only an organisation administrator, or an owner or manager of the environment, can revoke one.

## Time-limited access with `bella issue`

To give a job, an agent or a person access that ends by itself, issue a short-lived scoped token:

```sh
bella issue --scope stripe,payment --ttl 30 --reason "Refund agent"
```

The token reaches only the secrets tagged with one of the named scopes and expires after `--ttl` minutes: 15 by default, 480 at most. Issuing it is recorded in the audit log as `token_minted`, with the scopes and the expiry. `--reason` becomes the token's name.

See [CLI — Issuing Scoped Tokens](/cli/#issuing-scoped-tokens) for full flag reference.
