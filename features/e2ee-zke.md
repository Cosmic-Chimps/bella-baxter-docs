# End-to-End Encryption & Zero-Knowledge Encryption

Every secret fetched through a Bella Baxter SDK is **encrypted end-to-end** between the server and your application — not just protected by TLS. Zero-Knowledge Encryption (ZKE) extends this with a persistent device key for stronger audit trails and DEK lease caching.

---

## Why E2EE on Top of TLS?

TLS protects secrets in transit against external eavesdroppers. E2EE adds a second layer:

- **TLS termination proxies** (load balancers, API gateways, service meshes) see plaintext after decrypting TLS. E2EE ensures secrets remain opaque even at those points.
- **SDK transport encryption** is independent of your infrastructure — it works the same whether you self-host on a bare VM or run behind a CDN.
- **Audit confidence** — each fetch is tied to a specific cryptographic key, not just a bearer token.

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
| **Device audit trail** | Every fetch is attributed to a specific key — visible in your audit log |
| **DEK lease caching** | The wrapped DEK has a TTL; subsequent fetches reuse it without round-trips |
| **Key identity** | Rotate or revoke a device key without rotating API credentials |

---

## Getting Started with ZKE

### 1. Generate your device key

```sh
bella auth setup
```

This generates a P-256 PKCS#8 private key, stores it in your OS keychain, and prints the PEM. Keep it secret — treat it like a private SSH key.

### 2. Set the environment variable

```sh
export BELLA_BAXTER_PRIVATE_KEY="$(cat ~/.bella/device-key.pem)"
```

**All SDK framework integrations read this variable automatically.** No code changes required for Django, FastAPI, Flask, Rails, Laravel, Spring Boot, ASP.NET Core, etc.

### 3. Optionally receive the wrapped DEK

If you want to log or cache the DEK lease, add a callback. Example in TypeScript:

```typescript
const client = new BaxterClient({
  baxterUrl: process.env.BELLA_BAXTER_URL!,
  apiKey: process.env.BELLA_BAXTER_API_KEY!,
  onWrappedDekReceived(project, env, wrappedDek, leaseExpires) {
    // leaseExpires is a Date — the DEK is valid until then
    console.log(`DEK for ${project}/${env} cached until ${leaseExpires}`)
  },
})
```

---

## Backward Compatibility

ZKE is **fully opt-in**. If `BELLA_BAXTER_PRIVATE_KEY` is not set:
- The SDK uses ephemeral E2EE (existing behavior, unchanged)
- No code changes or configuration needed
- Existing applications continue to work without modification

---

## What ZKE Does NOT Change

- **The server still authorizes every request** via your API key — ZKE is a transport enhancement, not an auth bypass.
- **Secret values are decrypted by the SDK** before being returned to your app code in both modes — your application always receives plaintext strings.
- **TLS is still required** — E2EE and ZKE complement TLS, they don't replace it.

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
