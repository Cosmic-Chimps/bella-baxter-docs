# Notifications

Get alerted on Slack, Discord, Teams, Telegram, or any HTTP endpoint when important events happen in Bella Baxter — without writing any webhook handling code.

## Create a Notification Channel

From the WebApp: **Settings → Notifications → Add Channel**

Or via CLI:

```sh
# Slack
bella notifications create \
  --name "Ops Slack" \
  --type Slack \
  --webhook-url https://hooks.slack.com/services/T.../B.../xxx

# Discord
bella notifications create \
  --name "Dev Discord" \
  --type Discord \
  --webhook-url https://discord.com/api/webhooks/...

# Microsoft Teams
bella notifications create \
  --name "Security Teams" \
  --type MicrosoftTeams \
  --webhook-url https://outlook.office.com/webhook/...

# Telegram
bella notifications create \
  --name "Alerts Bot" \
  --type Telegram \
  --chat-id 123456789 \
  --bot-token 7890:...

# Generic HTTP webhook
bella notifications create \
  --name "PagerDuty" \
  --type Webhook \
  --url https://events.pagerduty.com/integration/.../enqueue \
  --method POST
```

## Supported Channels

| Type | Description |
|------|-------------|
| `Slack` | Slack Incoming Webhook |
| `Discord` | Discord Webhook |
| `MicrosoftTeams` | Teams Incoming Webhook |
| `Telegram` | Telegram Bot API |
| `Webhook` | Generic HTTP POST (custom payload template) |

## Subscribe a Channel to Events

```sh
bella notifications subscribe \
  --channel "Ops Slack" \
  --events SecretDeleted,LeaseExpired,SecurityScanFailed \
  --project my-api
```

## Event Types

The same event types as [Webhooks](/features/webhooks#event-types) are supported, plus notification-specific events:

| Event | Description |
|-------|-------------|
| `SecurityScanFailed` | A security scan detected weak or exposed secrets |
| `LeaseExpiringSoon` | A lease is expiring within the configured warn-before window |
| `ProviderConnectionFailed` | Bella cannot reach a provider (connectivity issue) |

## Test a Channel

```sh
bella notifications test "Ops Slack"
```

Sends a test message to verify the channel is configured correctly.

## Manage Channels

```sh
bella notifications list
bella notifications get "Ops Slack"
bella notifications update "Ops Slack" --active false   # pause
bella notifications delete "Ops Slack"
```

## Example: Alert on Secret Deletion

```sh
bella notifications subscribe \
  --channel "Ops Slack" \
  --events SecretDeleted \
  --project my-api \
  --environment production
```

When someone deletes a production secret, a Slack message is sent immediately:

> 🔔 **Secret deleted** — `DATABASE_URL` was deleted from `my-api / production` by `alice@example.com` at 10:30 UTC

## Example: Alert on Security Issues

```sh
bella notifications subscribe \
  --channel "Security Teams" \
  --events SecurityScanFailed \
  --all-projects
```

When a security scan detects a weak password or policy violation in any project, the Teams channel is notified.

Notifications are always free — alerting is an operational necessity, not an enterprise feature.
