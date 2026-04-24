# API Key Rotation

Bella Baxter can automatically rotate third-party API keys (Stripe, Anthropic, OpenAI, Google Maps, etc.) on a schedule, push the new value into your secret provider, and revoke the old key after a configurable grace period — with zero downtime.

## How It Works

```
Scheduler (every 15 min)
  → finds secrets due for rotation
  → publishes TriggerSecretRotationCommand via RabbitMQ

RotatorService (worker)
  → calls the 3rd-party API to create a new key
  → returns the new key value

Baxter API
  → stores new value in your provider (Vault, AWS, Azure, GCP)
  → updates the secret's NextRotationAt
  → schedules old key revocation after grace period
```

The old API key stays valid until the revocation delay elapses — giving your running services time to pick up the new value before the old one stops working.

## Supported Rotators

| Rotator | Service | How It Rotates |
|---------|---------|----------------|
| `stripe-api-key` | Stripe | Creates a new restricted/secret key via Stripe API, revokes old |
| `anthropic-api-key` | Anthropic | Generates new API key via Anthropic API, revokes old |
| `openai-api-key` | OpenAI | Creates new project key via OpenAI API, revokes old |
| `google-maps-api-key` | Google Maps Platform | Calls GCP Cloud Function (service account impersonation) |

Custom rotators can be registered by your operator via the Backoffice.

## Configuring Rotation

### Via WebApp

1. Open **Environment → Secrets**
2. Find the secret you want to auto-rotate
3. Click the rotation badge (or the **Set Rotation Policy** button)
4. Fill in the **Rotation Policy** dialog:
   - **Rotator** — pick the service (e.g. "Stripe API Key")
   - **Credentials** — provide the admin key or service account needed to perform rotation
   - **Rotation interval** — e.g. every 90 days
   - **Revoke previous key after** — e.g. 7 days (grace period for running services)
5. Save. Bella schedules the first rotation.

Credentials are encrypted with your tenant's Data Protection key — Bella never logs or exposes them in API responses.

### Via API

```http
PUT /api/v1/projects/{project}/environments/{env}/providers/{provider}/secrets/{key}/rotation-policy
Authorization: Bearer <token>
Content-Type: application/json

{
  "enabled": true,
  "intervalDays": 90,
  "rotatorDefinitionId": "stripe-api-key",
  "credentials": {
    "adminApiKey": "sk_live_..."
  },
  "params": {},
  "revokePreviousAfterDays": 7
}
```

## Manual Rotation

Trigger an immediate rotation from the WebApp by clicking **Rotate Now** on a secret, or via CLI:

```sh
bella secrets rotate \
  --project my-api \
  --env production \
  --provider my-vault \
  --key STRIPE_API_KEY
```

The rotation runs asynchronously. The secret's rotation badge updates to **Rotating…** until the new value is stored.

## Rotation Status

Each secret with rotation configured shows a status badge:

| Badge | Meaning |
|-------|---------|
| ✅ Up to date | Rotation not due yet |
| ⚠️ Due soon | Rotation due within 7 days |
| 🔴 Overdue | Rotation is past due (scheduler will pick it up within 15 min) |
| 🔵 Rotating… | Active rotation in progress |
| ⏳ Pending revocation | New key stored, waiting for grace period to revoke old key |
| 🔴 Error | Last rotation attempt failed |

## Zero-Downtime Rotation

Bella uses a two-phase approach to avoid breaking running services:

1. **Phase 1 — Generate new key:** New key is created and stored in your provider (overwriting the current value). Running services that reload secrets (via SDK refresh, `bella run --watch`, or `bella agent`) will automatically pick up the new value.

2. **Phase 2 — Revoke old key:** After the grace period (default: 7 days), Bella revokes the original key at the 3rd-party API. Services that loaded the new key during Phase 1 are unaffected.

Set `revokePreviousAfterDays: 0` if you want immediate revocation (not recommended for production).

## Security

- **Credentials are encrypted at rest** using ASP.NET Data Protection (AES-256-CBC + HMAC-SHA256). The encrypted blob is stored in your tenant's event stream — never in plaintext.
- **Credentials are never returned by the API.** The rotation policy endpoint masks credential fields as `***ENCRYPTED***`.
- **Rotation runs in an isolated worker** (`BellaBaxter.RotatorService`) — the worker receives only the encrypted credentials and the secret metadata needed to perform a single rotation. It has no access to other tenant data.
- **All rotations are audit logged** — actor, timestamp, old key handle, new key resource name.

## FAQ

**Are my rotation credentials (admin API key etc.) stored securely?**
Yes. They are encrypted with your tenant's Data Protection key before being written to the database. The key never appears in API responses, logs, or error messages.

**What happens if a rotation fails?**
Bella marks the secret as `Error` and schedules a retry with exponential backoff (via Wolverine/RabbitMQ). Your existing key continues to work. After 3 failed attempts, the status stays `Error` and an alert is raised. You can trigger a manual rotation once the underlying issue is resolved.

**Can I use rotation without a supported rotator?**
Yes — your operator can register a custom `HttpWebhook` rotator. Bella will POST a JSON payload to your endpoint with the credential context; your endpoint creates the new key and returns the value. See your operator docs for the webhook schema.

**What if my service doesn't support key reload?**
Set `revokePreviousAfterDays` to a value longer than your deployment cycle (e.g. 30 days). This gives you a full cycle to deploy a new version that reads the new key before the old one is revoked.

**Does rotation work with the Bella CLI?**
Yes. When `bella run` or `bella agent` is active, secrets are refreshed according to their `--poll-interval`. New rotated values are picked up automatically without redeployment.

## Related

- [Secrets](./environments.md) — managing secrets in environments
- [Providers](./providers.md) — connecting Vault, AWS Secrets Manager, etc.
- [Notifications](./notifications.md) — get alerted when rotation fails
