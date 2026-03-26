# Webhooks

Webhooks let you receive HTTP POST notifications when events happen in Bella Baxter — secret changes, lease expirations, API key rotation, and more.

---

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

---

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

---

## Webhook Payload

```json
{
  "id": "evt-7e98d73e...",
  "type": "SecretUpdated",
  "timestamp": "2026-03-18T10:30:00Z",
  "tenantId": "...",
  "data": {
    "resourceId": "...",
    "projectId": "...",
    "projectSlug": "my-api",
    "environmentId": "...",
    "environmentSlug": "production",
    "key": "DATABASE_URL",
    "metadata": {}
  }
}
```

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
bella webhooks create \
  --url https://a1b2c3d4.ngrok-free.app/webhooks \
  --events SecretCreated,SecretUpdated \
  --project my-api \
  --environment dev

# 4. Copy your webhook secret from the CLI output:
#   Signing secret: whsec-...
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

Failed deliveries are retried automatically up to **5 times** with exponential backoff.

View recent delivery attempts in the WebApp: **Project → Settings → Webhooks → View Log**

Or via CLI:

```sh
bella webhooks deliveries list <webhook-id>
bella webhooks deliveries retry <delivery-id>   # manually retry a failed delivery
```

---

## Manage Webhooks

```sh
bella webhooks list
bella webhooks get <webhook-id>
bella webhooks update <webhook-id> --active false   # pause
bella webhooks delete <webhook-id>
```

