# Secret Leases

Secret Leases add **time-limited access** to secrets. When a lease expires, the secret becomes unavailable until explicitly re-issued. Use leases for ephemeral access patterns — contractors, incident responders, automated jobs.

## Create a Lease

```sh
bella leases issue \
  --project my-api \
  --environment production \
  --scope "DATABASE_URL,REDIS_URL" \
  --ttl 4h \
  --reason "Contractor onboarding - Jane Doe"
```

This returns a short-lived `bax-...` token that:
- Only has access to the named secret keys
- Expires automatically after the TTL
- Is logged with the reason in the audit trail

## Lease Policy on an Environment

Configure automatic lease enforcement on an environment — all access tokens for that environment expire and must be renewed:

```sh
bella environments set-lease-policy \
  --project my-api \
  --environment production \
  --ttl 24h \
  --warn-before 2h
```

When a lease is about to expire, Bella sends a notification (if configured) 2 hours before expiry.

## List Active Leases

```sh
bella leases list --project my-api --environment production
```

## Revoke a Lease

```sh
bella leases revoke <lease-id>
```

Revocation is immediate. The token becomes invalid for all subsequent requests.

## Expire All Leases

Rotate credentials for an environment and revoke all outstanding leases:

```sh
bella leases expire-all --project my-api --environment production
```

## Use Cases

- **Contractor access** — issue a 7-day lease, it expires automatically. No manual cleanup.
- **Incident response** — issue elevated access for 1 hour, then revoke
- **Automated jobs** — issue a 15-minute token per job run. CI/CD never holds a long-lived key.
- **Secret rotation** — trigger rotation and expire all existing leases to force re-auth

## Relationship to `bella issue`

`bella issue` is the CLI command for creating short-lived scoped tokens (implemented via leases under the hood):

```sh
bella issue --scope stripe,payment --ttl 30 --reason "Refund agent"
```

See [CLI — Issuing Scoped Tokens](/cli/#issuing-scoped-tokens) for full flag reference.
