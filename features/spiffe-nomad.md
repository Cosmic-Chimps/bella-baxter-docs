# Workload identity on Nomad

A task on HashiCorp Nomad can prove where it runs with a **Nomad workload identity**: a JWT that the Nomad servers sign and the client writes into the task's secrets directory. Bella checks the signature against the keys your Nomad cluster publishes, then issues the workload an X.509 or JWT SVID.

Bella checks every presented token. A token is admitted only when:

- its issuer is exactly your cluster's;
- its audience is exactly the value this environment expects (always enforced; there is no observe-only mode for Nomad);
- it is current, and it lives **24 hours or less** (`exp - iat`). A token without `iat` is refused, because its lifetime cannot be shown.

A refusal never tells the caller why. The reason is in the access log: `node_token_expired`, `node_token_not_yet_valid`, `node_token_no_expiry`, `node_token_too_long_lived`, `node_token_audience_mismatch`, `node_token_issuer_mismatch` or `node_token_signature_invalid`.

## Before you start

- **Turn on OIDC discovery in Nomad.** Set `oidc_issuer` in the server stanza of every server:

  ```hcl
  server {
    oidc_issuer = "https://nomad.example.com"
  }
  ```

  Nomad then serves `/.well-known/openid-configuration` and its signing keys, and signs that issuer into every identity. **Changing `oidc_issuer` later invalidates every identity already issued**: their `iss` no longer matches, and Bella refuses them until tasks get new ones.

- **Give Bella an https address it can reach.** Bella fetches `<address>/.well-known/openid-configuration` and the key set it names, and refuses an address that is not https. Nomad's HTTP API usually listens on plain `:4646`, so put a TLS front (a load balancer or reverse proxy) before it. The discovery document's `issuer` must equal the `oidc_issuer` above.

## 1. Give the task a named identity for Bella

Add an `identity` block **with a name** to the task. The default (unnamed) identity is minted for Nomad's own APIs, so its audience never matches and Bella refuses it.

```hcl
task "api" {
  identity {
    name = "bella"
    aud  = ["bella-spiffe/<environment-id>"]
    ttl  = "1h"
    file = true
  }
}
```

- `aud` is the audience this environment expects. Use the recommended value the environment shows you (`bella-spiffe/<environment-id>`, unique to the environment). The shared default `bella-spiffe` also works, but then every environment that keeps it and trusts this cluster accepts the same identities.
- `ttl` must be **24 hours or less**. Nomad renews the identity before it expires.
- `file = true` writes the token to `secrets/nomad_bella.jwt`. Nomad rewrites the file at every renewal, and the agent re-reads it at every attestation, so nothing restarts.
- `env = true` also exposes it as `NOMAD_TOKEN_bella`. Nomad refreshes that variable on renewal **only** with `change_mode = "restart"`, so prefer the file. The agent reads the file first.

## 2. Set the environment's Nomad settings

```sh
bella spiffe set-mode --strict \
  --nomad-oidc https://nomad.example.com \
  --nomad-audience-recommended
```

The console's SPIFFE tab has the same two fields. To clear them, use `--clear-nomad-oidc` and `--clear-nomad-audience`; clearing the audience goes back to the shared default. Node evidence is checked only in Strict mode.

## 3. Register the workload with Nomad constraints

```sh
bella spiffe add --name api \
  --node nomad:cluster=https://nomad.example.com \
  --selector nomad:namespace=default --selector nomad:job=api
```

The constraints Bella can verify from a Nomad identity are `nomad:cluster` (a node constraint: the verified issuer, matched exactly), and the workload selectors `nomad:namespace`, `nomad:job`, `nomad:task` and `nomad:alloc`. A workload cannot mix Nomad constraints with Kubernetes or AWS ones, because one attestation carries one kind of evidence. Nomad's identity carries no datacenter or node pool, so Bella offers no selector for them.

## 4. Run the agent in the task

```sh
export BELLA_BOOTSTRAP_TOKEN=bax-…
bella spiffe agent --environment-id <environment-id> --name api --node-type nomad
```

The agent finds the identity in this order:

1. `--nomad-identity-path` or `BELLA_NOMAD_IDENTITY_PATH`, when you name a file. If that file is missing, the agent stops; it never falls back to another identity.
2. `$NOMAD_SECRETS_DIR/nomad_<name>.jwt`.
3. `NOMAD_TOKEN_<name>`.

`<name>` is `bella` unless you set `--nomad-identity` or `BELLA_NOMAD_IDENTITY`. The agent never reads `NOMAD_TOKEN` (your ACL token), never takes these settings from a `.bella` file, and only ever sends a JWT.

It prints where the identity comes from, never the token:

```
Node evidence: nomad identity 'bella' from /alloc/…/secrets/nomad_bella.jwt (source: secrets-file); re-read at every attestation.
```

To check what the task would present without starting the agent:

```sh
bella spiffe whoami --node-type nomad
```

It shows the source, issuer, audience, expiry, lifetime and the `nomad_*` claims, decoded locally and marked unverified. Bella has not checked them yet.
