# Secure Shares

Secure Shares let you hand secrets to someone **without sending them in plaintext** over Slack, email, or any messaging app. The secrets are encrypted in your browser: Bella stores only the ciphertext and never receives the key.

A share created in the WebApp carries a copy of an environment's secrets as they were when you created it. The label you give the share is stored unencrypted and is shown to anyone who has the link, so do not put a secret in it.

## How It Works

```
1. You create a share
   → The secrets are encrypted in your browser (AES-256-GCM, with a random key)
   → Only the encrypted blob is sent to Bella
   → Bella stores the ciphertext + gives you a share URL

2. You send the URL to the recipient
   → URL contains the decryption key in the fragment (the part after #)
   → Fragment never leaves the recipient's browser (not sent to the server)

3. Recipient opens the URL
   → Browser fetches ciphertext from Bella
   → Decrypts locally using the key from the URL fragment
   → Each open counts as one view

4. The share stops working when it expires, when you revoke it,
   or when it reaches its view limit, if you set one
```

## Create a Share

::: warning Planned — not in the CLI yet
The `bella share` commands (`create`, `from-secret`, `list`, `revoke`) are on the roadmap and are not in the CLI yet. Until then, create and manage shares in the WebApp (**Secrets → Share → Create Secure Share**) or with the [REST API](/api-reference/). The CLI examples on this page show the planned syntax.
:::

```sh
bella share create \
  --value "postgres://user:pass@host/db" \
  --ttl 24h \
  --max-views 1
```

Output:
```
Share URL: https://your-instance.bella-baxter.io/share/abc123#xyz...
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

The options in the WebApp's dialog:

| Option | Default | Description |
|--------|---------|-------------|
| Expires in | 7 days | Time until the share URL expires: 1 day, 7 days, 30 days or 1 year |
| Max views | Unlimited | How many times the share can be opened. Leave it empty for no limit; set `1` for a link that works once |
| Password | none | Additional password the recipient must enter |

**A share has no view limit unless you set one.** Without a limit, the link keeps working until it expires or you revoke it.

## Revoke a Share

```sh
bella share revoke <share-id>
```

Revoking a share prevents any further views, whether or not it has a view limit.

## List Active Shares

```sh
bella share list
```

Shows active shares with their expiry and view count (not the values or decryption keys).

## Use Cases

- **Onboarding** — share a production password with a new team member without it passing through Slack
- **Incident response** — quickly share database credentials with a responder; set max views to 1 so the link works once
- **Cross-team secrets** — share a service account token with another team without adding them to your Bella project
- **Password managers** — a safer alternative to pasting secrets into tickets or emails

## Security Properties

- ✅ Encrypted in the browser: Bella only stores ciphertext and never receives the key, so it cannot decrypt the share
- ✅ View limit, when you set one: with max views of 1 the link works once. With no limit it works until it expires or is revoked
- ✅ Time-limited: shares expire automatically
- ✅ Audit trail: all view events are logged (IP, timestamp, user agent). Reading a password-protected share's label without unlocking it is logged too, once per source per hour, never with the label itself
- ✅ Revocable: cancel a share before it's opened
