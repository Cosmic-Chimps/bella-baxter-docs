# End-to-End Encryption & Zero-Knowledge Encryption

Every secret fetched through a Bella Baxter SDK is **encrypted end-to-end** between the server and your application — not just protected by TLS. Zero-Knowledge Encryption (ZKE) extends this with a persistent device key for stronger audit trails and DEK lease caching.

::: warning What "zero-knowledge" does and does not mean here
**Bella can read your secret values.** The server decrypts them to serve a request, and it is the
server that wraps the environment key.

What ZKE gives you is **device identity**: which machine read which secret, an audit trail that names
it, and the ability to withdraw one machine without rotating anything else. It is *not* a claim that
the platform is unable to read your secrets.

If you need that stronger property — encryption the server genuinely cannot reverse — it is separate
work and not what this page describes. This also appears at the end of the page; it is repeated here
because it belongs *before* you decide, not after.
:::

---

## Why E2EE on Top of TLS?

TLS protects secrets in transit against external eavesdroppers. E2EE adds a second layer:

- **TLS termination proxies** (load balancers, API gateways, service meshes) see plaintext after decrypting TLS. E2EE ensures secrets remain opaque even at those points.
- **SDK transport encryption** is independent of your infrastructure — it works the same whether you self-host on a bare VM or run behind a CDN.
- **Audit confidence** — a fetch made with a registered device key is tied to that device on the audit trail, not just to a bearer token. See [Registered devices](#registered-devices).

Bella's E2EE uses **ECDH key agreement (P-256) + AES-256-GCM** — the same primitives used by Signal and TLS 1.3.

---

## Two Modes

### Default: Ephemeral E2EE

Out of the box, every SDK generates a **fresh P-256 keypair** for each secrets request:

```
App                        Bella API
 │                              │
 │── X-E2E-Public-Key: <pub> ──▶│  Server generates shared secret via ECDH
 │                              │  Encrypts each secret value with AES-GCM
 │◀─── encrypted body ─────────│
 │                              │
 │  SDK decrypts locally        │
```

The ephemeral key is discarded after each request. No configuration needed — this is the default.

### Optional: ZKE with Persistent Device Key

With ZKE, you supply a **persistent PKCS#8 P-256 private key** (your "device key"). The server uses the same key for every request from that device:

```
App                        Bella API
 │                              │
 │── X-E2E-Public-Key: <persistent pub> ──▶│
 │                              │  Wraps the per-environment DEK with your public key
 │◀─── X-Bella-Wrapped-Dek ────│  (in addition to the encrypted body)
 │◀─── encrypted body ─────────│
 │                              │
 │  SDK decrypts body AND       │
 │  caches the wrapped DEK      │
```

**What you gain:**

| Benefit | Details |
|---------|---------|
| **Device audit trail** | A fetch made with a **registered** device key carries that device's fingerprint on the audit row, so "which machine read this?" is answerable |
| **DEK lease caching** | The wrapped DEK has a TTL; subsequent fetches reuse it without round-trips |
| **Revocation** | Withdraw one machine without rotating API credentials — effective on that machine's next request |

> The wrapped DEK is released **only to a registered device** (or to the public key recorded against an
> API key at creation). An unregistered key still receives the secret values; it just does not receive
> the environment key. Treat `X-Bella-Wrapped-Dek` as optional — every SDK already does.

---

## Getting Started with ZKE

### 1. Register this machine

```sh
bella auth setup
```

This generates a P-256 keypair, stores the private half in an encrypted file at
`~/.config/bella-cli/zke-private-key.dat` with owner-only permissions, and **registers the public half
with Bella**. It prints the device's fingerprint:

```
✅ Device registered.
   Fingerprint: SHA256:mF2v7Q9x0Zk1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P
   Label:       MacBook Pro
   Tenant:      acme
```

That fingerprint is what the console's **Devices** page and the audit trail show, so you can match a row
to a machine by eye. The private key never leaves the machine — keep it as you would a private SSH key.

Registration is **per tenant**: the same laptop registers separately in each tenant it works in. The
command is safe to re-run (it updates the label and nothing else), and `--force` generates a *new*
device, leaving the previous one registered until you revoke it.

### 2. Set the environment variable (for SDKs)

```sh
export BELLA_BAXTER_PRIVATE_KEY="$(bella auth setup --print-key 2>/dev/null || cat ~/.config/bella-cli/zke-private-key.dat)"
```

The CLI reads the stored key itself — this variable is for SDK processes that are not launched through
`bella run` / `bella sdk run` (both inject it for you).

**All SDK framework integrations read this variable automatically.** No code changes required for Django, FastAPI, Flask, Rails, Laravel, Spring Boot, ASP.NET Core, etc.

### 3. Optionally receive the wrapped DEK

If you want to log or cache the DEK lease, add a callback. Example in TypeScript:

```typescript
const client = await createBaxterClient({
  baxterUrl: process.env.BELLA_BAXTER_URL!,
  apiKey: process.env.BELLA_BAXTER_API_KEY!,
  onWrappedDekReceived(project, env, wrappedDek, leaseExpires) {
    // leaseExpires is a Date — the DEK is valid until then
    console.log(`DEK for ${project}/${env} cached until ${leaseExpires}`)
  },
})
```

---

## Registered devices

A **device** is one machine's public key, registered by a person. Registration is what makes the
setting below mean something: before it existed, "ZKE enforcement" accepted any key a client happened
to send, including one generated seconds earlier by a machine nobody had ever set up.

```sh
bella auth devices list           # your devices in this tenant
bella auth devices list --all     # every device in the tenant (Owner/Admin)
bella auth devices revoke <id|fingerprint>
```

The console shows the same list under **Settings → Devices**.

**Revocation is effective on that machine's next request** — there is no cache to wait out. What it does
*not* do is un-share knowledge: an environment key already cached on that machine still decrypts the
values it decrypted before. Rotate the environment key if that matters.

A machine credential is a device too: an API key registers its public key when the key is *created*
(`publicKey` on `createApiKey`). A key created without one is refused where enforcement is on, and the
console marks it "no registered key".

---

## ZKE enforcement

A tenant Owner can require a registered device for every secret read **and for every credential the
platform issues** (**Settings → Encryption → ZKE enforcement**). With it on:

- a CLI or SDK presenting a **registered** device key reads and obtains credentials normally;
- anything else — no key, a malformed key, an unregistered key, a revoked device, or a device whose
  owner has left the tenant — is refused with `403` and told to run `bella auth setup`;
- the console is exempt (a browser session holds no device key);
- an assistant connected over MCP reads only through an API key with a registered public key.

### What "credential" covers

Five classes, governed identically on every surface — the console, the CLI, the SDKs and the
assistant:

| Credential | Obtained by |
|---|---|
| **second-factor code** | `getTotpCode`, `get_totp_code` |
| **SSH certificate** | `signSshKey`, `sign_ssh_key`, `bella ssh sign` |
| **access token** | `issueEnvironmentToken`, `bella_issue_token` |
| **TLS certificate** | `issuePkiCertificate` |
| **database credential** | `generateDynamicCredentials` |

The last two joined the set after spec 039 shipped: both hand back live secret material — a private
key, and a database password — and both were reachable from a machine that had never registered
anything. Nothing about them was ever meant to be outside enforcement; they were missing from the
declared inventory, which is why the guard tests passed over them.

**Creating** an access key is not in this set. It is an administrative act gated by its own
permissions, and it is the act through which a machine's device key is first recorded — requiring a
device to register a device would lock every new machine out permanently.

> **Migration note.** With enforcement on, `bella ssh sign` and `bella ssh connect` stop working from a
> machine that has no registered device. Run `bella auth setup` on the machines that need them. An
> access key created without a recorded public key is likewise refused for credentials — as it already
> was for secret reads.

Before enabling it, the console shows how many members and API keys would be locked out.

---

## Backward Compatibility

ZKE is **fully opt-in**. If `BELLA_BAXTER_PRIVATE_KEY` is not set:
- The SDK uses ephemeral E2EE (existing behavior, unchanged)
- No code changes or configuration needed
- Existing applications continue to work without modification

---

## What ZKE Does NOT Change

- **The server still authorizes every request** via your API key — ZKE is a transport and device-identity
  layer, not an auth bypass, and enforcement narrows who may read rather than widening it.
- **Secret values are decrypted by the SDK** before being returned to your app code in both modes — your
  application always receives plaintext strings.
- **TLS is still required** — E2EE and ZKE complement TLS, they don't replace it.
- **The platform can still read your secrets.** Bella decrypts values server-side to serve them, and the
  environment key is wrapped *by* the server. ZKE gives you device identity, an attributable audit trail
  and revocation; it is not a claim that Bella cannot see your secrets. Anything that says otherwise is
  wrong.

---

## Per-SDK Reference

| SDK | Env var | Options field | Callback parameter |
|-----|---------|---------------|--------------------|
| JavaScript / TypeScript | `BELLA_BAXTER_PRIVATE_KEY` | `privateKey` | `onWrappedDekReceived(project, env, wrappedDek, leaseExpires)` |
| .NET | `BELLA_BAXTER_PRIVATE_KEY` | `options.PrivateKey` | — (logged internally) |
| Python | `BELLA_BAXTER_PRIVATE_KEY` | `private_key=` | `on_wrapped_dek_received(project, env, wrapped_dek, lease_expires)` |
| Go | `BELLA_BAXTER_PRIVATE_KEY` | `Options.PrivateKeyPEM` | `Options.OnWrappedDEK(project, env, wrappedDEK, leaseExpires)` |
| Ruby | `BELLA_BAXTER_PRIVATE_KEY` | `private_key:` | `on_wrapped_dek_received:` |
| PHP | `BELLA_BAXTER_PRIVATE_KEY` | `$options->privateKey` | `$options->onWrappedDekReceived` |
| Swift | set manually | `BellaClientOptions(privateKey:)` | `onWrappedDekReceived:` |
| Java | `BELLA_BAXTER_PRIVATE_KEY` | `.privateKeyPem()` | `.onWrappedDekReceived()` |
| Dart | set manually | `BellaClientOptions(privateKey:)` | `onWrappedDekReceived:` |

→ See each SDK's page for a full code example.
