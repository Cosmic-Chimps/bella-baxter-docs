# Webhooks

Webhooks let you receive an HTTP POST when something happens in Bella Baxter — a secret is written,
rotated or about to expire, an environment is created, a lease is granted, a security scan finds a new
risk, a certificate rotation finishes. Every delivery is signed so you can verify it came from Bella.

---

## Create a Webhook

From the console: the **Webhooks** tab of a project or an environment, or **Settings** for a
tenant-wide webhook.

Or through the API:

```sh
curl -X POST "$BELLA_URL/api/v1/webhooks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Secret change notifications",
    "targetUrl": "https://your-service.example.com/webhooks/bella",
    "eventTypes": ["secret.created", "secret.updated", "secret.deleted"],
    "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "environmentId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }'
```

The response carries the **signing secret** (`whsec-…`). It is shown once and cannot be retrieved
again — store it where your receiver can read it.

`projectId` and `environmentId` are IDs, not slugs, and together they set the webhook's **scope**:

| Scope | Request body | Receives |
|-------|--------------|----------|
| Tenant-wide (tenant `ADMIN` only) | neither | subscribed events from the whole tenant |
| Project | `projectId` | subscribed events for that project |
| Environment | `projectId` + `environmentId` | subscribed events for that environment only |

::: tip Some events carry no project, or no environment
`lease.expired` and `api_key.expired` carry no project, so only a **tenant-wide** webhook receives
them. The `global_secret.*` events, and `security.scan.risk_detected` for a project's global secrets,
carry no environment, so a tenant-wide or **project** webhook receives them and an environment webhook
does not.
:::

---

## Event Types

Subscribe with the exact names below. Names are case-sensitive and matched exactly at delivery.

| Event | Fires when | What `data` carries |
|-------|------------|---------------------|
| `secret.created` | A secret is created in an environment | `key`; `resourceId` = the key |
| `secret.updated` | A secret in an environment is updated | `key`; `resourceId` = the key |
| `secret.deleted` | A secret is deleted from an environment | `key`; `resourceId` = the key |
| `global_secret.created` | A project-level (global) secret is created | `key`; `resourceId` = the key; no environment |
| `global_secret.updated` | A global secret is updated | `key`; `resourceId` = the key; no environment |
| `global_secret.deleted` | A global secret is deleted | `key`; `resourceId` = the key; no environment |
| `secret.rotation.succeeded` | A rotation policy rotated a secret and the new value reached the provider | `key`; `metadata.newKeyHandle` |
| `secret.rotation.failed` | A rotation attempt failed | `key`; `metadata.errorMessage`, `metadata.retryCount` |
| `secret.rotation.revoked` | A rotated secret's previous value was revoked at the end of its grace period | `key`; `metadata.revokedKeyHandle` |
| `secret.expiry.warning` | A secret's expiry date falls inside its warning window | `key`; `resourceId` = the secret id; `metadata.expiresAt`, `metadata.daysUntilExpiry` |
| `secret.expired` | A secret's expiry date has passed | `key`; `resourceId` = the secret id; `metadata.expiresAt`, `metadata.daysUntilExpiry` |
| `environment.created` | An environment is created | `resourceId` = the environment id |
| `environment.deleted` | An environment is deleted | `resourceId` = the environment id |
| `environment.restored` | A deleted environment is restored | `resourceId` = the environment id |
| `lease.granted` | A secret lease is granted | `resourceId` = the lease id; `metadata.holderName`; no slugs |
| `lease.expired` | A lease passes its expiry (checked every 15 minutes) | `resourceId` = the lease id; no project or environment |
| `api_key.expired` | An API key passes its expiry date (checked hourly) | `resourceId` = the API key id; no project or environment |
| `ssh_role.created` | An SSH signing role is created in an environment | `resourceId` = the role name |
| `ssh_key.signed` | An SSH public key is signed | `resourceId` = the role name used |
| `security.scan.risk_detected` | A security scan finds risk **and its verdict changed** since the previous scan | `metadata.overallRisk`, `critical`, `high`, `medium`, `low`, `totalScanned` |
| `certificate.rotation.succeeded` | A certificate rotation completed — every eligible host is serving the new certificate | `key` = the primary domain; see below |
| `certificate.rotation.partial` | Some hosts are serving the new certificate and some are not; the target needs attention | `key` = the primary domain; see below |
| `certificate.rotation.failed` | A rotation failed. The previous certificate is untouched and still being served | `key` = the primary domain; see below |
| `certificate.rotation.missed` | A scheduled rotation came due but could not start | `key` = the primary domain; see below |

Notes on individual events:

- **Expiry alerts** are checked hourly and sent once per expiry date. They are not sent for secrets
  with rotation enabled — the rotation policy owns their lifecycle. Changing a secret's expiry date
  re-arms both alerts.
- **`security.scan.risk_detected`** fires on a change of verdict, not on every scan. Scans re-run after
  every secret write and periodically, and repeating an unchanged finding would bury the new ones. A
  scan of a project's global secrets reports `environmentSlug` `_global` and `metadata.scope` `global`.
- **Secret values are never in a payload.** A secret event tells you *that* something changed, never
  what it changed to.

### Certificate rotation payloads

One event per **rotation**, never per host or per certificate — a bulk appliance run over fifty
certificates is a single event carrying counts. Per-certificate detail stays in the rotation history
and the rotation report.

`metadata` carries: `outcome`, `targetId`, `rotationId` (absent for `.missed`), `primaryDomain`,
`sanList`, `trigger`, `occurredAt`; `hostsSucceeded`/`hostsFailed` for multi-host targets;
`certificatesEvaluated`/`certificatesDeployed`/`certificatesUnchanged`/`certificatesFailed` for bulk
appliance runs; `failureCategory` and `failureDetail` on failure; `missedReason` and
`occurrenceDueAt` for a missed occurrence; `notAfter` (the new expiry) on success. `resourceId` is the
certificate target's id.

Payloads are metadata only. They never contain certificate material, private keys, passphrases,
secret values or vault paths.

> **If you stream business events to a SIEM.** An audit-stream destination with the business-event
> mirror enabled will now receive these four types **in addition to** the certificate rotation audit
> rows it already receives. The two describe the same rotation from different angles: an audit row is
> per host / per certificate, a business event is per rotation. No existing envelope changes; this is
> new volume on an existing feed, so rules that count events may need adjusting.

### Names that are refused, and names that deliver nothing

A name the platform does not recognise is **refused** with `400 Bad Request`, and the error lists the
valid names. Editing an existing webhook re-checks only the names you are adding, so a webhook created
before names were validated can still be edited, or have a dead name removed.

A few names are **accepted but never delivered** to a webhook. Do not subscribe to them:

- `secret.rotated`, `provider.created`, `provider.deleted` — nothing in the product sends them. For
  rotations use `secret.rotation.succeeded`.
- `secret.changed`, `scan.environment.complete`, `scan.project.complete` — these are live-update
  messages for the console, not webhook events, although the validator currently accepts them.

> **Retired in 2026-09.** `cert_rotation.completed` and `cert_rotation.failed` appeared in the
> subscription picker between 2026-05-03 and 2026-09-15 but were never emitted by any part of the
> product — a subscription naming either has always received nothing. A new subscription naming them
> is refused; existing ones keep them and keep receiving nothing. Subscribe to the
> `certificate.rotation.*` types above instead.

---

## Webhook Payload

Every delivery is a `POST` with `Content-Type: application/json`, the `X-Bella-Signature` header (see
below) and an `X-Bella-Event` header that repeats the event name.

```json
{
  "id": "whevt_7e98d73e4f0a4b1c9d2e3f4a5b6c7d8e",
  "type": "secret.updated",
  "tenantId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "timestamp": "2026-03-18T10:30:00Z",
  "data": {
    "resourceId": "DATABASE_URL",
    "projectId": "…",
    "environmentId": "…",
    "projectSlug": "my-api",
    "environmentSlug": "production",
    "key": "DATABASE_URL",
    "metadata": null
  }
}
```

| Field | Meaning |
|-------|---------|
| `id` | Unique per event (`whevt_` prefix). Use it to de-duplicate. |
| `type` | The event name from the table above. |
| `data.resourceId` | What the event is about — see the table for each event. |
| `data.projectId` / `data.environmentId` | Set when the event belongs to a project / an environment; `null` otherwise. |
| `data.projectSlug` / `data.environmentSlug` | Slugs, when the event carries them. |
| `data.key` | The secret key for secret events, the primary domain for certificate events; `null` otherwise. |
| `data.metadata` | The event-specific fields listed in the table, or `null`. |

::: warning Secret values are never included
Webhook payloads contain metadata only — never secret values.
:::

---

## Webhook Security (HMAC Signature)

Every request includes an `X-Bella-Signature` header for authentication:

```
X-Bella-Signature: t=1710760200,v1=abc123def456...
```

**Signature algorithm:**

```
signing_input = "{t}.{rawBodyJson}"          # timestamp dot raw body (UTF-8)
hmac          = HMAC-SHA256(UTF8(secret), UTF8(signing_input))
v1            = lowercase_hex(hmac)
```

The HMAC key is the raw `whsec-xxx` string (UTF-8 encoded) — **not** hex-decoded.

A **5-minute replay window** is enforced: reject requests where `|now - t| > 300 seconds`.

**Always read the raw body bytes before any framework parsing** — body parsers may re-serialise JSON differently, breaking the HMAC.

---

## Receiving Webhooks

::: code-group

```typescript [JavaScript / TypeScript]
// Express — uses @bella-baxter/sdk for verified signature check
import express from 'express'
import { verifyWebhookSignature } from '@bella-baxter/sdk'

const app = express()
const secret = process.env.BELLA_WEBHOOK_SECRET ?? ''

app.post('/webhooks', express.raw({ type: '*/*' }), async (req, res) => {
  const rawBody = req.body as Buffer          // express.raw() gives us a Buffer
  const signature = req.headers['x-bella-signature'] as string ?? ''

  if (secret) {
    const valid = await verifyWebhookSignature(secret, signature, rawBody)
    if (!valid) return res.status(401).json({ error: 'Invalid signature' })
  }

  const payload = JSON.parse(rawBody.toString())
  console.log('Event received:', payload.type, payload.data?.key)

  res.json({ received: true })
})

app.listen(3000)
```

```python [Python]
# FastAPI — uses bella_baxter.webhook_signature
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from bella_baxter.webhook_signature import verify_webhook_signature
import os, json

app = FastAPI()
SECRET = os.environ.get('BELLA_WEBHOOK_SECRET', '')

@app.post('/webhooks')
async def receive_webhook(request: Request):
    raw_body = await request.body()           # bytes — must read before any parsing
    signature = request.headers.get('x-bella-signature', '')

    if SECRET:
        valid = verify_webhook_signature(
            secret=SECRET,
            signature_header=signature,
            raw_body=raw_body,
        )
        if not valid:
            return JSONResponse({'error': 'Invalid signature'}, status_code=401)

    payload = json.loads(raw_body)
    print(f"Event: {payload.get('type')} / {payload.get('data', {}).get('key')}")

    return {'received': True}
```

```go [Go]
// net/http — uses github.com/cosmic-chimps/bella-baxter-go/bellabaxter
package main

import (
    "encoding/json"
    "io"
    "net/http"
    "os"

    "github.com/cosmic-chimps/bella-baxter-go/bellabaxter"
)

var secret = os.Getenv("BELLA_WEBHOOK_SECRET")

func webhookHandler(w http.ResponseWriter, r *http.Request) {
    rawBody, err := io.ReadAll(r.Body)        // read raw bytes before any parsing
    if err != nil {
        http.Error(w, "read error", http.StatusInternalServerError)
        return
    }

    if secret != "" {
        sig := r.Header.Get("X-Bella-Signature")
        if !bellabaxter.VerifyWebhookSignature(secret, sig, rawBody) {
            http.Error(w, `{"error":"Invalid signature"}`, http.StatusUnauthorized)
            return
        }
    }

    var payload map[string]any
    _ = json.Unmarshal(rawBody, &payload)
    // handle payload...

    w.Header().Set("Content-Type", "application/json")
    w.Write([]byte(`{"received":true}`))
}

func main() {
    http.HandleFunc("/webhooks", webhookHandler)
    http.ListenAndServe(":8080", nil)
}
```

```csharp [.NET]
// ASP.NET Core minimal API — uses BellaBaxter.Client.WebhookSignatureVerifier
using BellaBaxter.Client;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var secret = app.Configuration["BELLA_WEBHOOK_SECRET"]
             ?? Environment.GetEnvironmentVariable("BELLA_WEBHOOK_SECRET");

app.MapPost("/webhooks", async (HttpContext ctx) =>
{
    // Read raw bytes BEFORE any middleware processes the body
    using var ms = new MemoryStream();
    await ctx.Request.Body.CopyToAsync(ms);
    var rawBody = ms.ToArray();

    if (!string.IsNullOrEmpty(secret))
    {
        var signature = ctx.Request.Headers["X-Bella-Signature"].FirstOrDefault() ?? "";
        var valid = WebhookSignatureVerifier.Verify(secret, signature, rawBody);
        if (!valid) return Results.Json(new { error = "Invalid signature" }, statusCode: 401);
    }

    // Parse payload
    var payload = System.Text.Json.JsonSerializer.Deserialize<BellaWebhookPayload>(rawBody);
    Console.WriteLine($"Event: {payload?.Type} / {payload?.Data?.Key}");

    return Results.Json(new { received = true });
});

app.Run();
```

```java [Java]
// Spring Boot — WebhookSignatureVerifier (copy from sample or use SDK when published)
@RestController
@RequestMapping("/webhooks")
public class WebhookController {

    private final String secret = System.getenv("BELLA_WEBHOOK_SECRET");

    @PostMapping(consumes = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<?> receive(
            @RequestBody byte[] rawBody,          // raw bytes — don't use String binding
            @RequestHeader("X-Bella-Signature") String signature) {

        if (secret != null && !secret.isEmpty()) {
            String rawBodyStr = new String(rawBody, StandardCharsets.UTF_8);
            boolean valid = WebhookSignatureVerifier.verify(secret, signature, rawBodyStr);
            if (!valid) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid signature"));
            }
        }

        // Parse and handle payload
        // ObjectMapper objectMapper = new ObjectMapper();
        // ReceivedEvent event = objectMapper.readValue(rawBody, ReceivedEvent.class);

        return ResponseEntity.ok(Map.of("received", true));
    }
}
```

```ruby [Ruby]
# Rails controller — uses BellaBaxter::WebhookSignature from bella_baxter gem
class WebhooksController < ActionController::Base
  protect_from_forgery with: :null_session   # webhooks don't have CSRF tokens

  def receive
    raw_body   = request.body.read           # must read raw before framework parsing
    sig_header = request.headers['X-Bella-Signature'].to_s
    secret     = ENV['BELLA_WEBHOOK_SECRET']

    if secret.present?
      begin
        valid = BellaBaxter::WebhookSignature.verify(
          secret:           secret,
          signature_header: sig_header,
          raw_body:         raw_body
        )
      rescue BellaBaxter::WebhookSignatureError
        render json: { error: 'Invalid signature' }, status: :unauthorized and return
      end

      unless valid
        render json: { error: 'Invalid signature' }, status: :unauthorized and return
      end
    end

    payload = JSON.parse(raw_body, symbolize_names: true)
    Rails.logger.info "Webhook: #{payload[:type]} / #{payload.dig(:data, :key)}"

    render json: { received: true }
  end
end
```

```php [PHP]
<?php
// Laravel controller — uses BellaBaxter\WebhookSignatureVerifier from bella-baxter package

namespace App\Http\Controllers;

use BellaBaxter\WebhookSignatureVerifier;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function receive(Request $request)
    {
        $rawBody   = $request->getContent();    // raw string — not parsed by Laravel
        $sigHeader = $request->header('X-Bella-Signature', '');
        $secret    = env('BELLA_WEBHOOK_SECRET', '');

        if ($secret !== '') {
            $valid = WebhookSignatureVerifier::verify($secret, $sigHeader, $rawBody);
            if (!$valid) {
                return response()->json(['error' => 'Invalid signature'], 401);
            }
        }

        $payload = json_decode($rawBody, true) ?? [];
        $type    = $payload['type'] ?? 'unknown';
        $key     = $payload['data']['key'] ?? null;

        logger("Webhook: {$type} / {$key}");

        return response()->json(['received' => true]);
    }
}
```

:::

---

## Signature Verification (Manual / No SDK)

If you're not using an SDK, implement verification in any language:

```
1. Parse header:  "t=1710760200,v1=abc123..."
   → timestamp = 1710760200
   → v1        = abc123...

2. Reject if |now() - timestamp| > 300 seconds   (replay protection)

3. Compute HMAC:
   signing_input = "{timestamp}.{rawBodyString}"
   expected      = HMAC-SHA256(key=UTF8(whsec-xxx), msg=UTF8(signing_input))
   expected_hex  = lowercase_hex(expected)

4. Compare expected_hex == v1  using constant-time comparison
```

::: tip HMAC key is NOT hex-decoded
Use the raw `whsec-xxx` string as the HMAC key (UTF-8 bytes). Do not base64- or hex-decode it first.
:::

---

## Local Development with ngrok

To test webhooks on your local machine, expose your endpoint with [ngrok](https://ngrok.com):

```sh
# 1. Start your local server
npm run dev          # or: uvicorn app:app, go run ., dotnet run, etc.

# 2. Expose it publicly
ngrok http 3000      # replace 3000 with your server port

# Ngrok will print something like:
#   Forwarding  https://a1b2c3d4.ngrok-free.app → http://localhost:3000

# 3. Register the ngrok URL as your webhook endpoint in Bella Baxter:
curl -X POST "$BELLA_URL/api/v1/webhooks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Local dev",
    "targetUrl": "https://a1b2c3d4.ngrok-free.app/webhooks",
    "eventTypes": ["secret.created", "secret.updated"],
    "projectId": "<project id>",
    "environmentId": "<dev environment id>"
  }'

# 4. Copy the signing secret from the response ("signingSecret": "whsec-...")
export BELLA_WEBHOOK_SECRET="whsec-..."
```

---

## Full Sample Apps

Each sample is a complete runnable receiver with a live HTML dashboard (auto-refreshes every 3 s) that shows incoming events, signature validation status, and full payload inspection.

| Language | Framework | Link |
|----------|-----------|------|
| JavaScript / TypeScript | Express | [apps/webhooks/js](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/webhooks/js) |
| Python | FastAPI | [apps/webhooks/python](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/webhooks/python) |
| Go | net/http | [apps/webhooks/go](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/webhooks/go) |
| .NET | ASP.NET Core (minimal API) | [apps/webhooks/dotnet](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/webhooks/dotnet) |
| Java | Spring Boot | [apps/webhooks/java](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/webhooks/java) |
| Ruby | Rails | [apps/webhooks/ruby](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/webhooks/ruby) |
| PHP | Laravel (Lumen) | [apps/webhooks/php](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/webhooks/php) |

All samples read `BELLA_WEBHOOK_SECRET` from the environment. If the variable is not set, signature validation is skipped — convenient for initial local testing.

---

## Delivery & Retries

A delivery that fails with a `5xx` response or a network error is retried three times — after 30
seconds, 5 minutes and 30 minutes. A `4xx` response is treated as permanent and is not retried, so
answer `2xx` as soon as you have accepted the event and process it afterwards.

Every attempt is recorded. View them in the console's webhook list, or through the API:

```sh
curl "$BELLA_URL/api/v1/webhooks/<webhook-id>/deliveries" -H "Authorization: Bearer $TOKEN"
```

---

## Manage Webhooks

| Action | Request |
|--------|---------|
| List a project's / an environment's webhooks | `GET /api/v1/projects/{projectId}/webhooks`, `GET /api/v1/environments/{environmentId}/webhooks` |
| Get one | `GET /api/v1/webhooks/{id}` |
| Change name, URL or event types | `PUT /api/v1/webhooks/{id}` with any of `name`, `targetUrl`, `eventTypes` |
| Pause / resume | `POST /api/v1/webhooks/{id}/deactivate`, `POST /api/v1/webhooks/{id}/reactivate` |
| Rotate the signing secret | `POST /api/v1/webhooks/{id}/rotate-secret` |
| Delete | `DELETE /api/v1/webhooks/{id}` |

A `PUT` that changes `eventTypes` replaces the whole list — send every name you want to keep.

