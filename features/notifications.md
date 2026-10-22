# Notifications

Get alerted on Slack, Discord, Teams, Telegram, or any HTTP endpoint when important events happen in Bella Baxter — without writing any webhook handling code.

## Create a Notification Channel

From the console: the **Notifications** tab of a project or an environment, or **Settings** for a
tenant-wide channel.

Or through the API. A channel names its type, its configuration and the events it subscribes to, all
in one request:

```sh
# Slack — alert when a production secret is deleted
curl -X POST "$BELLA_URL/api/v1/notifications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ops Slack",
    "channelType": "Slack",
    "configuration": { "webhook_url": "https://hooks.slack.com/services/T.../B.../xxx" },
    "eventTypes": ["secret.deleted", "secret.expired", "security.scan.risk_detected"],
    "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "environmentId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }'
```

`projectId` and `environmentId` are IDs, not slugs. Omit both for a tenant-wide channel (tenant
`ADMIN` only), omit `environmentId` for a project-wide one. Scope works exactly as it does for
[webhooks](/features/webhooks#create-a-webhook), including which events carry no project or no
environment.

## Supported Channels

| Type | `configuration` keys |
|------|----------------------|
| `Slack` | `webhook_url` — a Slack Incoming Webhook |
| `Discord` | `webhook_url` — a Discord webhook |
| `MicrosoftTeams` | `webhook_url` — a Teams Incoming Webhook |
| `Telegram` | `bot_token`, `chat_id` |
| `Custom` | `webhook_url`, optional `headers` (a JSON object, as a string) — a generic HTTP POST |

URLs, tokens and headers are stored in the secret store, never in Bella's database, and are masked in
every response. Only non-sensitive values such as the Telegram `chat_id` are returned.

A `Custom` channel receives this JSON body:

```json
{
  "event_type": "secret.deleted",
  "title": "🗑️ Secret Deleted",
  "message": "Secret `DATABASE_URL` was deleted",
  "project_name": "my-api",
  "environment_name": "production",
  "resource_id": "DATABASE_URL",
  "occurred_at": "2026-03-18T10:30:00Z"
}
```

Use a [webhook](/features/webhooks) instead when you need a signed request or the event's full
`metadata`.

## Set up a Discord channel

1. In Discord, open the channel's settings → **Integrations** → **Webhooks** → **New webhook**.
   Name it (the name signs the messages) and copy the URL.
2. In the console, open the **Notifications** tab of a project or an environment, or **Settings**
   for a tenant-wide channel. Create a channel of type **Discord**, paste the URL into `webhook_url`
   and pick the events.
3. Send the test. A "Bella Baxter Test Notification" message with the channel's name arrives in
   Discord.

> The webhook URL is a credential: anyone who has it can post to your channel. Don't paste it in
> chats, issues or tickets. If it leaks, delete the webhook in Discord and create a new one.

## Set up a Telegram channel

1. **Create the bot.** In Telegram, talk to `@BotFather` and send `/newbot`. Choose a name and a
   username (it must end in `bot`). BotFather returns the bot's **token**, which is a credential.
2. **Create the channel.** It can be private.
3. **Add the bot as an administrator with Post Messages.** In the channel's settings, open
   **Administrators** → **Add Admin** and search for the bot by its username. In the bot's admin
   card, expand **Manage Messages**, tick **Post Messages** and save.
   Without Post Messages the bot is in the channel, but Telegram rejects every send with a 400.
   The **Channel Admin Rights** you set in BotFather only define what the bot *asks for* when it is
   added. What counts is the administrator card in the channel.
4. **Get the `chat_id`.** A channel's ID is a negative number that starts with `-100`.
   1. Post any message in the channel.
   2. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` in your browser. The ID is in
      `channel_post.chat.id`. If the bot has a webhook configured, `getUpdates` returns nothing.
   3. Check it with `https://api.telegram.org/bot<TOKEN>/getChat?chat_id=<ID>`. It must answer
      `"ok": true` with the channel's title.
5. **Create the channel in Bella.** Choose type **Telegram**, fill in `bot_token` and `chat_id`, pick
   the events and send the test.

> These URLs contain the bot token. Open them only in your own browser and don't share them.

## Event Types

Channels subscribe to the same event types as [webhooks](/features/webhooks#event-types), with the
same exact, case-sensitive names. The message a channel receives:

| Event | Message |
|-------|---------|
| `secret.created` | 🔑 Secret Created — names the key |
| `secret.updated` | ✏️ Secret Updated — names the key |
| `secret.deleted` | 🗑️ Secret Deleted — names the key |
| `global_secret.created` | Generic "Bella Baxter Event" message naming the event |
| `global_secret.updated` | Generic "Bella Baxter Event" message naming the event |
| `global_secret.deleted` | Generic "Bella Baxter Event" message naming the event |
| `secret.rotation.succeeded` | 🔄 Secret Rotated — names the key |
| `secret.rotation.failed` | ❌ Rotation Failed — names the key and the error |
| `secret.rotation.revoked` | Generic "Bella Baxter Event" message naming the event |
| `secret.expiry.warning` | ⏰ Secret Expiring Soon — names the key and the days remaining |
| `secret.expired` | 🔴 Secret Expired — names the key |
| `environment.created` | 🌱 Environment Created |
| `environment.deleted` | 🗑️ Environment Deleted |
| `environment.restored` | Generic "Bella Baxter Event" message naming the event |
| `lease.granted` | Generic "Bella Baxter Event" message naming the event |
| `lease.expired` | Generic "Bella Baxter Event" message naming the event |
| `api_key.expired` | Generic "Bella Baxter Event" message naming the event |
| `ssh_role.created` | 🔐 SSH Role Created |
| `ssh_key.signed` | ✅ SSH Key Signed |
| `security.scan.risk_detected` | 🚨 Security Risk Detected — the environment, overall risk and the count per severity |
| `certificate.rotation.succeeded` | ✅ Certificate Rotated — the domain, project/environment and the new expiry |
| `certificate.rotation.partial` | ⚠️ Certificate Partially Rotated — how many hosts succeeded and failed |
| `certificate.rotation.failed` | ❌ Certificate Rotation Failed — the failure category |
| `certificate.rotation.missed` | ⏭️ Scheduled Rotation Did Not Start — why it could not start |

When each event fires, and which events reach which scope, is described in the
[webhook event table](/features/webhooks#event-types). The same names are refused, or accepted and
never delivered, as described [there](/features/webhooks#names-that-are-refused-and-names-that-deliver-nothing).

### Certificate rotation messages

A channel subscribed to these receives one message per **rotation** naming the domain, the
project/environment, the outcome and the host or certificate counts — not one message per host, and
not one per certificate in a bulk appliance run. Failure messages name the failure category; a missed
occurrence says why the rotation could not start.

Messages are metadata only: no certificate material, private keys, passphrases or secret values.

> **Retired in 2026-09.** `cert_rotation.completed` and `cert_rotation.failed` were offered by the
> channel picker between 2026-05-03 and 2026-09-15 but were never emitted — a channel subscribed to
> either has always received nothing. Subscribe to the `certificate.rotation.*` types above instead.

> **If you stream business events to a SIEM.** An audit-stream destination with the business-event
> mirror enabled will now also receive these four types alongside the certificate rotation audit rows
> it already receives — the same rotation seen per-rotation rather than per-host. New volume on an
> existing feed; no existing envelope changes.

## Test a Channel

```sh
curl -X POST "$BELLA_URL/api/v1/notifications/<channel-id>/test" -H "Authorization: Bearer $TOKEN"
```

Sends a test message straight to the channel to verify it is configured correctly. It needs no
subscription.

Channel delivery is best-effort: a message the destination refuses is not retried. Use a
[webhook](/features/webhooks#delivery-retries) when every event must arrive.

### If the test fails

| What you see | Cause | What to do |
|--------------|-------|------------|
| The console shows "Network Error"; the browser console shows a CORS error and a `502` on `POST …/notifications/{id}/test` | The destination refused the message. Bella answers 502, and that response carries no CORS header, so the browser hides the reason | Test the destination directly (see below) |
| Telegram: 400 on send, but `getChat` answers fine | The bot is not an administrator with **Post Messages** | Step 3 of [Set up a Telegram channel](#set-up-a-telegram-channel) |
| Telegram: `chat not found` | Wrong `chat_id`, or the bot is not in the channel | Step 4 of [Set up a Telegram channel](#set-up-a-telegram-channel) |

To test Telegram without Bella, open
`https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<ID>&text=test`. If it fails, the
`description` field says why. For Discord, send a `POST` with a JSON `content` field straight to the
webhook URL with `curl`.

## Manage Channels

| Action | Request |
|--------|---------|
| List a project's / an environment's channels | `GET /api/v1/projects/{projectId}/notifications`, `GET /api/v1/environments/{environmentId}/notifications` |
| Get one | `GET /api/v1/notifications/{id}` |
| Change name, configuration or event types | `POST /api/v1/notifications/{id}/update` with any of `name`, `configuration`, `eventTypes` |
| Pause / resume | `POST /api/v1/notifications/{id}/toggle` |
| Delete | `DELETE /api/v1/notifications/{id}` |

## Example: Alert on Security Issues

```sh
curl -X POST "$BELLA_URL/api/v1/notifications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Security Teams",
    "channelType": "MicrosoftTeams",
    "configuration": { "webhook_url": "https://outlook.office.com/webhook/..." },
    "eventTypes": ["security.scan.risk_detected"]
  }'
```

With no `projectId` this is a tenant-wide channel (tenant `ADMIN` only): when a security scan in any
project finds a new risk — a weak or exposed secret, a policy violation — the Teams channel is
notified. An unchanged finding is not repeated on every scan.

Notifications are always free — alerting is an operational necessity, not an enterprise feature.
