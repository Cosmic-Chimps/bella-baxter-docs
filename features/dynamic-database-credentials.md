# Dynamic Database Credentials

A **dynamic secret** is a credential that is created on demand. Each requester gets their own username and password. The credential has a short lease, and the database removes it when the lease ends. Nobody keeps a long-lived password.

This is different from [fetching secrets at runtime](/features/dynamic-secrets), where a stored value is read when your application asks for it.

## How Bella does it

Bella uses a provider of type `VaultDatabase`. It calls the **Database secrets engine** of OpenBao (or Vault) and asks it for a new user on a role you configured there. Bella never stores the username or the password. It returns them once to the caller.

Setting it up:

1. Configure the Database secrets engine and at least one role in OpenBao.
2. Create a `VaultDatabase` provider in Bella. See [VaultDatabase configuration](/features/providers#vaultdatabase-dynamic-credentials-configuration).
3. Assign the provider to the environment.

## Request credentials

```http
POST /api/v1/projects/{projectRef}/environments/{envSlug}/providers/{providerSlug}/credentials/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "app-readwrite"
}
```

Leave `role` out to use the provider's `default_role`. The response:

```json
{
  "username": "v-approle-app-readwri-XXXXXX",
  "password": "A1B2-C3D4-E5F6",
  "expiresAt": "2026-03-17T17:00:00Z",
  "leaseDurationSeconds": 3600,
  "leaseId": "database/creds/app-readwrite/XXXX",
  "connectionUrl": "postgres://v-approle-app-readwri-XXXXXX:A1B2-C3D4-E5F6@db:5432/myapp"
}
```

- `connectionUrl` is present only when the provider has a `connection_url_template`.
- Every call creates a new database user.
- The caller needs read access to the environment. A caller whose device policy requires a registered device must use one. A scope-limited token is refused: it never issues credentials.
- If the provider is not assigned to the environment, the answer is `404`. A provider that is not a `VaultDatabase` provider is refused with `400`.

To list the roles that OpenBao has configured on the provider's mount:

```http
GET /api/v1/projects/{projectRef}/environments/{envSlug}/providers/{providerSlug}/credentials/roles
```

## The lease

The length of the lease comes from the role in OpenBao (`default_ttl` and `max_ttl`). The API accepts a `ttlSeconds` field, but Bella does not pass it on to OpenBao, so it does not change the lease.

When the lease ends, OpenBao revokes the credential. The response carries the `leaseId` so you can end a lease earlier in OpenBao yourself.

Bella does not track these leases. It has no operation to renew or revoke one, and they do not appear in the environment's **Leases** tab. That tab lists [secret leases](/features/secret-leases), which are records of who fetched an environment's secrets, and workload leases.

## Audit

Each generation writes an access-log entry with the action `generate-credentials` and the key `dynamic-creds/<role>`. The entry names who asked. It never holds the username or the password. See [audit](/audit/).
