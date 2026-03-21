# Secure Shares

Secure Shares let you share a secret value with someone **without sending it in plaintext** over Slack, email, or any messaging app. The share is zero-knowledge encrypted — Bella never sees the plaintext value.

## How It Works

```
1. You create a share with a value
   → Value encrypted in your browser (AES-256-GCM, key derived from a random nonce)
   → Only the encrypted blob is sent to Bella
   → Bella stores the ciphertext + gives you a share URL

2. You send the URL to the recipient
   → URL contains the decryption key in the fragment (#key=...)
   → Fragment never leaves the recipient's browser (not sent to the server)

3. Recipient opens the URL
   → Browser fetches ciphertext from Bella
   → Decrypts locally using the key from the URL fragment
   → Value is shown once, then the share is marked as used

4. After the first view, the share is destroyed
```

## Create a Share

```sh
bella share create \
  --value "postgres://user:pass@host/db" \
  --ttl 24h \
  --max-views 1
```

Output:
```
Share URL: https://your-instance.bella-baxter.io/share/abc123#key=xyz...
Expires: 2026-03-18T12:00:00Z
Max views: 1

Share this URL — it can only be opened once.
```

Or from the WebApp: **Secrets → Share → Create Secure Share**

## Share an Existing Secret

```sh
bella share from-secret \
  --project my-api \
  --environment production \
  --key DATABASE_URL \
  --ttl 2h
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `--ttl <duration>` | `24h` | Time until the share URL expires |
| `--max-views <n>` | `1` | Maximum number of times the value can be viewed |
| `--passphrase <text>` | none | Additional passphrase the recipient must enter |

## Revoke a Share

```sh
bella share revoke <share-id>
```

Revoking a share immediately prevents any further views, even if the max-views limit hasn't been reached.

## List Active Shares

```sh
bella share list
```

Shows active shares with their expiry and view count (not the values or decryption keys).

## Use Cases

- **Onboarding** — share a production password with a new team member without it passing through Slack
- **Incident response** — quickly share database credentials with a responder; link expires after 1 view
- **Cross-team secrets** — share a service account token with another team without adding them to your Bella project
- **Password managers** — a safer alternative to pasting secrets into tickets or emails

## Security Properties

- ✅ Zero-knowledge: Bella only stores ciphertext — it cannot decrypt the value
- ✅ One-time: default `max-views: 1` — opened once, gone forever
- ✅ Time-limited: shares expire automatically
- ✅ Audit trail: all view events are logged (IP, timestamp, user agent)
- ✅ Revocable: cancel a share before it's opened
