# Secret Rotation

Bella Baxter can automatically rotate secrets on a schedule, store the new value in your provider, and optionally revoke the old credential after a configurable grace period — with zero downtime.

## How It Works

```
Scheduler (every 15 min)
  → finds secrets due for rotation
  → dispatches TriggerSecretRotationCommand

Rotation handler
  → executes the chosen strategy (GenerateRandom or HttpWebhook)
  → stores new value in your provider (Vault, AWS, Azure, GCP)
  → updates NextRotationAt
  → schedules old-value revocation after grace period (HttpWebhook only)
```

The old secret value stays valid until the revocation delay elapses — giving your running services time to pick up the new value.

## Rotation Strategies

### GenerateRandom

Bella generates a new random value in-process. No external call is made.

| Format | Example output |
|--------|---------------|
| `uuid` | `550e8400-e29b-41d4-a716-446655440000` |
| `hex32` | `3d8e9f1a0b2c4d5e6f7a8b9c0d1e2f3a` |
| `base64-32` | `PY6fGgssTVhmz4x6iJ3yKQ==` |
| `alphanumeric-32` | `K7mXqR2wZ9cLpN0sT4vH8jYb1fDe5uAi` |

Use this strategy for internal API keys, session signing secrets, and any credential where you control both ends.

### HttpWebhook

Bella POSTs a signed request to **your function**. Your function provisions a new key at the external service and returns the new value.

Use this strategy to rotate third-party API keys (Stripe, OpenAI, Google Maps, etc.) or any credential managed by an external API.

#### Wire Contract

All requests are signed using HMAC-SHA256:

```
X-Bella-Signature: t={unix-epoch-seconds},v1={hmac-sha256-hex}
```

This is the same signing format used for Bella webhooks and Custom HTTP Providers.

**Rotate request:**

```json
POST https://your-function.example.com/rotate
X-Bella-Signature: t=1720000000,v1=abc123...
{ApiKeyHeader}: {ApiKey}   // optional

{
  "action": "rotate",
  "secretKey": "STRIPE_API_KEY",
  "projectSlug": "my-app",
  "environmentSlug": "production",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Rotate response:**

```json
{
  "newValue": "sk_live_new_key_value",
  "newHandle": "stripe-key-id-abc123"
}
```

`newHandle` is optional. If returned, Bella stores it and passes it as `oldHandle` in the revoke call.

**Revoke request** (after sunset period, only if `newHandle` was returned):

```json
{
  "action": "revoke",
  "secretKey": "STRIPE_API_KEY",
  "projectSlug": "my-app",
  "environmentSlug": "production",
  "oldHandle": "stripe-key-id-abc123",
  "requestId": "7e98d73e-..."
}
```

**Revoke response:**

```json
{ "success": true }
```

**Error response** (return any non-2xx status):

```json
{ "error": "Rate limit exceeded — try again later" }
```

## Configuring Rotation

### Via WebApp

1. Open **Environment → Secrets**
2. Find the secret you want to auto-rotate
3. Click the rotation badge (or the **Set Rotation Policy** button)
4. Fill in the dialog:
   - **Interval** — how often to rotate (e.g. every 30 days)
   - **Revoke previous after** — grace period before revoking the old value (HttpWebhook only)
   - **Strategy** — `Generate Random` or `HTTP Webhook`
   - For **HTTP Webhook**: endpoint URL, signing secret, optional API key
   - For **Generate Random**: value format
5. Save. Bella schedules the first rotation.

### Via API

```http
PUT /api/v1/projects/{project}/environments/{env}/providers/{provider}/secrets/{key}/rotation-policy
Authorization: Bearer <token>
Content-Type: application/json

{
  "enabled": true,
  "intervalDays": 30,
  "strategy": "HttpWebhook",
  "endpoint": "https://your-function.example.com/rotate",
  "signingSecret": "your-hmac-secret",
  "revokePreviousAfterDays": 7
}
```

For `GenerateRandom`:

```json
{
  "enabled": true,
  "intervalDays": 90,
  "strategy": "GenerateRandom",
  "randomFormat": "hex32"
}
```

## Building a Rotation Function

Use the [rotation function templates](https://github.com/Cosmic-Chimps/bella-baxter/tree/main/apps/templates/rotator) as a starting point. Templates are available for:

- **AWS Lambda** — Node.js/TypeScript
- **GCP Cloud Run** — Node.js/TypeScript
- **Azure Functions** — Node.js/TypeScript

All templates use `@bella-baxter/sdk` for signature verification. You only need to implement `rotateSecret()` (and optionally `revokeSecret()`).

### Signature verification

```typescript
import { verifyWebhookSignature, type BellaRotationRequest } from '@bella-baxter/sdk';

const rawBody = await req.text();
const valid = await verifyWebhookSignature(
  process.env.BELLA_SIGNING_SECRET!,
  req.headers.get('x-bella-signature') ?? '',
  rawBody,
);
if (!valid) return { status: 401, body: '{"error":"Invalid signature"}' };

const bellaReq = JSON.parse(rawBody) as BellaRotationRequest;
```

The WebApp shows a ready-to-run template snippet when you select **Strategy: HTTP Webhook** in the rotation policy dialog.

## Manual Rotation

Trigger an immediate rotation from the WebApp by clicking **Rotate Now** on a secret, or via CLI:

```sh
bella secrets rotate \
  --project my-app \
  --env production \
  --provider my-vault \
  --key STRIPE_API_KEY
```

The rotation runs asynchronously. The status badge updates to **Rotating…** until the new value is stored.

## Rotation Status

Each secret with rotation configured shows a status badge:

| Badge | Meaning |
|-------|---------|
| ✅ Up to date | Rotation not due yet |
| ⚠️ Due soon | Rotation due within 7 days |
| 🔴 Overdue | Rotation is past due (scheduler will pick it up within 15 min) |
| 🔵 Rotating… | Active rotation in progress |
| ⏳ Pending revocation | New value stored, waiting for grace period to revoke old handle |
| 🔴 Error | Last rotation attempt failed |

## Zero-Downtime Rotation

Bella uses a two-phase approach to avoid breaking running services:

1. **Phase 1 — New value:** The new value is generated/retrieved and stored in your provider. Running services that reload secrets (via SDK refresh or `bella run --watch`) pick up the new value automatically.

2. **Phase 2 — Revoke old** *(HttpWebhook only)*: After the grace period, Bella calls your function with `action=revoke` and the stored `oldHandle`. Set `revokePreviousAfterDays: 0` for immediate revocation (not recommended for production).

## Security

- **Signing secrets and API keys are encrypted at rest** using ASP.NET Data Protection (AES-256-CBC + HMAC-SHA256) before being written to the event stream.
- **Sensitive fields are never returned by the API.** Rotation policy responses mask them as `***ENCRYPTED***`.
- **All rotations are audit logged** — actor, timestamp, strategy, outcome.

## FAQ

**Does rotation work with the Bella CLI?**
Yes. When `bella run` or `bella agent` is active, secrets are refreshed according to their poll interval. New rotated values are picked up automatically.

**What happens if a rotation fails?**
Bella marks the secret as `Error` and retries with exponential backoff. Your existing value continues to work.

**What if I don't want to revoke the old key?**
Don't return `newHandle` from your rotate function. Bella will never call revoke.

## Related

- [Secrets](./secrets.md) — managing secrets in environments
- [Providers](./providers.md) — connecting Vault, AWS, Azure, GCP, or a custom HTTP backend
- [Custom HTTP Provider](./providers.md#httprest-custom-http-provider) — build your own secret backend
- [Notifications](./notifications.md) — get alerted when rotation fails

