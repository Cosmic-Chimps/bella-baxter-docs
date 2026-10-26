# Security Intelligence

Security Intelligence scans your environments for security issues — weak passwords, exposed credentials, policy violations, and misconfigured secrets — and surfaces them in a unified security dashboard.

Security Intelligence is always free. Detecting a weak password should not require an enterprise contract.

## Security Dashboard

The WebApp security dashboard shows:
- Open security findings per project/environment
- Severity breakdown (Critical, High, Medium, Low)
- Finding trends over time
- Quick-fix actions

Navigate to: **WebApp → Security → Dashboard**

## Run a Scan

::: warning Planned — not in the CLI yet
The `bella security` commands (`scan`, `findings list|get|dismiss`, `policy set`) are on the roadmap and are not in the CLI yet. Until then, run scans and manage findings in the WebApp (**Security → Dashboard**) or with the [REST API](/api-reference/). The CLI examples on this page show the planned syntax.
:::

```sh
bella security scan --project my-api --environment production
```

Scans run automatically on:
- Secret creation/update
- Scheduled scan (configurable, default: daily)
- Manual trigger via CLI or WebApp

## How it works

Values are analysed **server-side**. The only thing that ever leaves your deployment is a
5-character SHA-1 prefix sent to [Have I Been Pwned](https://haveibeenpwned.com/API/v3#PwnedPasswords)
(k-anonymity — the same technique 1Password, Firefox and Chrome use); the value itself never does,
and HIBP cannot tell which of the ~800 hashes under that prefix you asked about.

## What is scanned, and what is not

The scanner separates configuration from credentials before it judges anything, so a port, a feature
flag or a UUID is not reported as a weak secret. It decides from the secret's declared **type** and,
when that is the default `String`, from the **shape** of the value:

| Value is | Entropy | Placeholder list | Key-format patterns | HIBP |
|---|:--:|:--:|:--:|:--:|
| Text (a plain string) | ✓ | ✓ | ✓ | ✓ |
| Base64 | ✓ | — | ✓ | — |
| JSON or a URL | — | — | ✓ | — |
| Boolean, number, UUID | — | — | — | — |
| Certificate bundle | — | — | — | — |

A URL containing `user:password@` is treated as text, so the credential is still found.

Mark anything the scanner still misjudges as **ignore in scan** on the secret itself.

## Scan Rules

| Rule | Description | Severity |
|------|-------------|----------|
| Weak entropy | Total entropy below 28 / 40 / 60 bits, measured over the whole value | Critical / High / Medium |
| Too short | Fewer than 8 characters in a credential-named key (`*_PASSWORD`, `*_SECRET`, `*_KEY`, …) | High |
| Known bad value | A dictionary credential or placeholder (`changeme`, `password123`, `letmein`) | Critical in a credential-named key, else Medium |
| Known breached | The value appears in the HIBP breached-password corpus | Critical |
| Known key format | Matches a published credential format — AWS, GitHub, Stripe, Slack, a PEM private key, a credential embedded in a connection string, and ~20 more | As published for that format |
| Stale secret | Not updated in over 365 days | Medium |

Severity for the value-based rules depends on the **key name** as well as the value: `changeme` in
`JWT_SECRET` is a credential you must rotate; the same word in a display label is not.

The Critical / High / Medium / Low tiles count **secrets**, not findings — one secret breaking three
rules is one Critical, and the four tiles plus "passed" always add up to the number scanned.

## View Findings

```sh
bella security findings list --project my-api
bella security findings list --severity High,Critical
bella security findings get <finding-id>
```

## Acknowledge a Finding

Some findings are not problems. A value can look like an Azure client secret and be a token for another
service. When you have read a finding and decided it is fine, acknowledge it from the report in the
WebApp: use the shield button on its row, and optionally say why (up to 500 characters).

- **What it does.** The finding leaves the severity counts, the risk badge, the project and organisation
  security summaries, and the scan alerts (`security.scan.risk_detected`). It moves to an
  **Acknowledged findings** list under the report, which shows its original severity, who acknowledged
  it, when, and the reason. It covers one finding type on one secret. Other findings on the same secret
  keep counting, and a rescan does not bring it back.
- **Who can do it.** On an environment's report, anyone who may manage that environment's secrets. On a
  project's global secrets, anyone who may manage the project. People who can only read see the
  Acknowledged list but cannot change it. API keys limited to tagged secrets cannot acknowledge
  anything.
- **It lapses when the value changes.** An acknowledgement covers the value you looked at. Once the
  secret's value changes by any route (an edit, an import, a file upload or a version rollback), the
  acknowledgement no longer applies. If the new value still triggers the rule, the finding counts again
  and is marked **Previously acknowledged — value changed**. Changing only the description or tags does
  not affect it. If the value changed after the last scan, scan again before acknowledging.
- **Undo.** Use **Undo** in the Acknowledged list. The finding counts again straight away, without a
  rescan.
- **Audit.** Each acknowledgement and each undo is written to the [audit log](/audit/) as
  `security_insight_acknowledged` or `security_insight_acknowledgement_withdrawn`. The entry records
  the person, the project and environment, the secret key, the finding type, the severity and the
  reason. It never records the value.

The same actions are available in the [REST API](/api-reference/):
`POST` and `DELETE /api/v1/projects/{project}/environments/{env}/security/acknowledgements`, and
`/api/v1/projects/{project}/security/acknowledgements` for global secrets.

## Dismiss a Finding

```sh
bella security findings dismiss <finding-id> --reason "Intentional test environment value"
```

Dismissed findings are logged with the reason and the dismissing user.

## Configure Scan Policy

```sh
bella security policy set \
  --project my-api \
  --min-entropy 3.5 \
  --require-lease-policy true \
  --scan-interval daily
```

## Notifications on Findings

Subscribe a Slack or Teams channel to `security.scan.risk_detected` to be alerted when a scan finds
new risk. It fires when a scan's verdict changes, not on every scan, so an unchanged finding is not
repeated:

```sh
curl -X POST "$BELLA_URL/api/v1/notifications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Security Teams",
    "channelType": "MicrosoftTeams",
    "configuration": { "webhook_url": "https://outlook.office.com/webhook/..." },
    "eventTypes": ["security.scan.risk_detected"],
    "projectId": "<project id>"
  }'
```

See [Notifications](/features/notifications) for setup.

## API

```http
GET /api/v1/security/findings?projectId=...&severity=High

POST /api/v1/security/scans
Content-Type: application/json
{
  "projectId": "...",
  "environmentId": "..."
}
```
