# Webhooks

Webhooks let you receive HTTP POST notifications when events happen in Bella Baxter — secret changes, lease expirations, API key rotation, and more.

## Create a Webhook

```sh
bella webhooks create \
  --url https://your-service.example.com/webhooks/bella \
  --events SecretCreated,SecretUpdated,SecretDeleted \
  --project my-api \
  --environment production \
  --name "Secret change notifications"
```

Or from the WebApp: **Project → Settings → Webhooks → Add Webhook**

## Event Types

| Event | Description |
|-------|-------------|
| `SecretCreated` | A secret was created |
| `SecretUpdated` | A secret value was changed |
| `SecretDeleted` | A secret was deleted |
| `EnvironmentCreated` | A new environment was created |
| `EnvironmentDeleted` | An environment was deleted |
| `LeaseIssued` | A new lease was issued |
| `LeaseExpired` | A lease expired |
| `LeaseRevoked` | A lease was manually revoked |
| `ApiKeyCreated` | A new API key was created |
| `ApiKeyRevoked` | An API key was revoked |
| `MemberAdded` | A user was added to a project or environment |
| `MemberRemoved` | A user was removed |
| `SecurityScanFailed` | A security intelligence scan detected an issue |

## Webhook Payload

```json
{
  "event": "SecretUpdated",
  "timestamp": "2026-03-18T10:30:00Z",
  "tenantId": "...",
  "projectId": "...",
  "projectSlug": "my-api",
  "environmentId": "...",
  "environmentSlug": "production",
  "data": {
    "key": "DATABASE_URL",
    "actor": {
      "type": "User",
      "id": "...",
      "email": "alice@example.com"
    }
  }
}
```

**Secret values are never included in webhook payloads.**

## Webhook Security (HMAC Signature)

Every webhook request includes an `X-Bella-Signature` header — an HMAC-SHA256 of the request body signed with your webhook secret:

```
X-Bella-Signature: sha256=abc123...
X-Bella-Webhook-Id: wh-xxx
X-Bella-Timestamp: 1710760200
```

Verify in your endpoint:

```javascript
const hmac = crypto.createHmac('sha256', webhookSecret)
hmac.update(rawBody)
const expected = `sha256=${hmac.digest('hex')}`
if (signature !== expected) return res.status(401).send('Invalid signature')
```

## Delivery Log

View recent delivery attempts in the WebApp: **Project → Settings → Webhooks → View Log**

Or via CLI:

```sh
bella webhooks deliveries list <webhook-id>
bella webhooks deliveries retry <delivery-id>   # manually retry a failed delivery
```

Failed deliveries are retried automatically up to 5 times with exponential backoff.

## Manage Webhooks

```sh
bella webhooks list
bella webhooks get <webhook-id>
bella webhooks update <webhook-id> --active false   # pause
bella webhooks delete <webhook-id>
```
