# Keyless / Workload Identity

Trust Domains enable **keyless authentication**. CI/CD pipelines, Kubernetes pods and other workloads authenticate using short-lived OIDC tokens issued by their platform, so no static API keys go into your CI/CD YAML.

## Supported Identity Providers

| Platform | Token source |
|----------|-------------|
| GitHub Actions | `id-token: write` + `ACTIONS_ID_TOKEN_REQUEST_URL` |
| Kubernetes | A **projected** service-account token requested for the trust domain's audience |
| Any OIDC provider | Custom trust domain configuration |

## How It Works

```
GitHub Actions job starts
  → bella (or your own step) asks GitHub for an OIDC token FOR Bella (aud = bella-baxter)
  → Sends it to Bella: POST /api/v1/token  { oidcToken, tenantSlug, projectSlug, environmentSlug }
  → Bella checks, against each trust domain of that environment:
      issuer · signature · lifetime · every claim rule · the token's audience
  → Returns a short-lived bax-... API key for that environment
  → Secrets are fetched with that key (never stored)
```

A trust domain admits a token only if **all** of these hold:

- **Issuer and signature.** The token was signed by the issuer you configured.
- **Claim rules.** These decide *who* may obtain a key: a repository, a branch, a service account. At least one is **required**.
- **Audience.** The token was minted *for Bella*, not for another service.

## Claim rules decide who; the audience decides for whom

The two checks answer different questions, and you need both.

- **The audience.** A token's `aud` names the service it was requested for. Without an audience check, a token your workflow requested for AWS STS, or for any other service, would be just as good at Bella. Each trust domain records the audiences it accepts.
- **Claim rules.** The audience alone does **not** limit *who* can get a token: on GitHub's issuer, **any repository on GitHub** can request `aud=bella-baxter`. Only claim rules narrow that down. This is why a trust domain must have at least one claim rule. A domain saved earlier without one is flagged **critical**, cannot enforce its audience, and **its exchanges are refused** until you add a rule.

### Accepted audiences

| Setting | Meaning |
|---------|---------|
| none recorded | the platform default, `bella-baxter`, which is what the `bella` CLI requests |
| a list | any one of them is accepted; use two values while moving from one to another |
| recommended | `bella-baxter/<environment id>`, unique to the environment and shown in the console |

**On sharing the default:** the default is shared by every trust domain that keeps it. A token minted for one of them satisfies another's check wherever a claim rule also matches. The per-environment recommended value closes that. An audience you choose may not be used by another environment in your organization.

### Observed or enforced

| Trust domain | Behaviour |
|--------------|-----------|
| created before this feature | **observes**: a token for another audience is still admitted, and the exchange is recorded with the audience it carried |
| created now | **enforces** from the start |

To move an existing trust domain to enforcing:

1. Point every CI job at an accepted audience. With the `bella` CLI there is nothing to do, because it already requests `bella-baxter`.
2. Check **readiness**, on the environment's Identity tab or with `bella spiffe audience-readiness`. It shows how many recent exchanges presented an accepted audience, and which callers still don't.
3. Switch **Refuse other audiences** on. If recent exchanges would be refused, you are asked first.

Switching it off again takes effect on the next exchange.

## GitHub Actions Setup

### 1. Create a Trust Domain (admin, once)

From the console: **Environment → Trust Domains → New Trust Domain**.

Or over the API. This is the only scripted route; there is no `bella` command for it:

```sh
curl -X POST "$BELLA_URL/api/v1/environments/$ENVIRONMENT_ID/trust-domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GitHub Actions CI",
    "oidcIssuerUrl": "https://token.actions.githubusercontent.com",
    "claimRules": [
      { "claim": "repository", "operator": "Equals", "value": "myorg/my-repo" },
      { "claim": "ref", "operator": "Equals", "value": "refs/heads/main" }
    ],
    "acceptedAudiences": ["bella-baxter"],
    "issuedTokenTtlMinutes": 15,
    "grantedRole": "Consumer"
  }'
```

- **Scope.** The trust domain belongs to the environment in the URL, so the project and environment the issued key is scoped to come from `$ENVIRONMENT_ID`, not from flags.
- **Operators.** `operator` is `Equals` or `StartsWith`. Matching ignores case.
  - A `StartsWith` value must end in `/`, `:` or `@`, so the prefix stops at a boundary: `repo:myorg/my-repo:` (any branch of one repository), `repo:myorg/` (every repository in the organization) or `myorg/my-repo/.github/workflows/deploy.yml@` (one workflow file, as `job_workflow_ref`). `repo:myorg/my-repo` without the `:` would also match `repo:myorg/my-repo-fork`, so it is refused.
  - `Contains` is no longer accepted. It cannot be anchored, so it matches any value that merely includes the text.
  - A trust domain saved earlier with `Contains`, or with a `StartsWith` value not ending in one of those characters, is flagged in the console and its exchanges are refused until the rule is fixed.
- **Required.** `claimRules` needs at least one rule.
- **Optional.** `acceptedAudiences` may be omitted, which means `bella-baxter`.

### 2. Use in a Workflow (no credentials needed)

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    permissions:
      id-token: write   # required
      contents: read
    steps:
      - uses: actions/checkout@v6
      - name: Deploy with secrets
        run: bella run -p my-api -e production -- ./deploy.sh
        # No BELLA_BAXTER_API_KEY needed. bella requests the token for audience bella-baxter.
```

If your trust domain accepts a different audience, tell the CLI which one to request in either of these ways:
- `--audience` on `bella auth oidc`
- `BELLA_OIDC_AUDIENCE=<value>` in the job's environment

`.bella` cannot set the audience. The token is sent to the server `.bella` names, and a `.bella` comes with every repository a job checks out, so the job's own configuration decides which audience to request.

Without the CLI, request the audience yourself:

```js
const token = await core.getIDToken("bella-baxter"); // must be an audience the trust domain accepts
```

GitHub's *default* audience (`https://github.com/<owner>`) is shared with every other service that accepts the default, so an enforcing trust domain refuses it. Request Bella's audience explicitly.

Or use the [GitHub Actions integration](/integrations/github-actions) directly.

## Kubernetes Setup

### 1. Create a Trust Domain

Use the console, or the same endpoint with your cluster's issuer:

```sh
curl -X POST "$BELLA_URL/api/v1/environments/$ENVIRONMENT_ID/trust-domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "K8s Production",
    "oidcIssuerUrl": "https://k8s.example.com",
    "claimRules": [
      { "claim": "sub", "operator": "Equals",
        "value": "system:serviceaccount:my-namespace:my-app" }
    ],
    "acceptedAudiences": ["bella-baxter"]
  }'
```

### 2. Use in a Pod: a projected token for Bella

The kubelet's default service-account token is minted for the cluster's own API server, and an enforcing trust domain refuses it. Project a token requested for the trust domain's audience instead:

```yaml
# k8s/deployment.yaml
spec:
  automountServiceAccountToken: false      # the default token is not for Bella
  containers:
    - name: my-app
      command: ["bella", "exec", "-p", "my-api", "-e", "production", "--", "node", "server.js"]
      volumeMounts:
        - name: bella-token
          mountPath: /var/run/secrets/bella   # bella looks here first, no flag needed
          readOnly: true
  volumes:
    - name: bella-token
      projected:
        sources:
          - serviceAccountToken:
              audience: bella-baxter          # an audience the trust domain accepts
              expirationSeconds: 600          # rotated by the kubelet; bella re-reads it
              path: token
```

If the token is mounted somewhere else, name it with `BELLA_NODE_TOKEN_PATH=/path/to/token`.

`bella run`, `bella exec` and `bella auth oidc` ignore `node_token_path` in `.bella`, and send a token only if the file holds a JWT. (`bella spiffe agent` and `bella spiffe whoami` still read `node_token_path`.)

## Custom OIDC Provider

For any OIDC-capable platform (GitLab CI, CircleCI, etc.):

```sh
curl -X POST "$BELLA_URL/api/v1/environments/$ENVIRONMENT_ID/trust-domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GitLab CI",
    "oidcIssuerUrl": "https://gitlab.com",
    "claimRules": [
      { "claim": "project_path", "operator": "Equals", "value": "mygroup/myrepo" }
    ],
    "acceptedAudiences": ["bella-baxter"]
  }'
```

Configure the provider to mint its ID token for that audience. In GitLab CI that is `id_tokens: { BELLA_ID_TOKEN: { aud: bella-baxter } }`.

## Token Exchange API

If you're implementing keyless auth in your own tooling:

```http
POST /api/v1/token
Content-Type: application/json

{
  "oidcToken": "<oidc-jwt requested for an accepted audience>",
  "tenantSlug": "my-org",
  "projectSlug": "my-api",
  "environmentSlug": "production"
}
```

Or, by environment id: `POST /api/v1/environments/{environmentId}/token` with `{ "oidcToken": "…" }`.

Response:

```json
{
  "token": "bax-...",
  "expiresAt": "2026-03-18T12:00:00Z"
}
```

| Status | Meaning |
|--------|---------|
| 401 `token_audience_mismatch` | a trust domain would have admitted the token, but it was minted for another audience — request an accepted one |
| 401 `no_matching_trust_domain` | no trust domain admitted the token (issuer, signature, lifetime or a claim rule) |
| 403 `trust_domain_role_not_grantable` | the trust domain admitted the token but grants a role other than `Consumer` or `Manager` — an administrator must change its role |
| 403 `trust_domain_has_no_claim_rules` | the only trust domain that matched has no claim rule, so it bounds no one — an administrator must add a rule |
| 403 `trust_domain_claim_rule_not_accepted` | the only trust domain that matched holds a `Contains` rule or a `StartsWith` value not ending in `/`, `:` or `@` — an administrator must fix the rule |
| 422 | the token is not a JWT, or has no issuer |
| 429 | too many attempts for this issuer and subject — 10 per minute |

## Security Notes

- **Lifetime.** Exchanged keys are short-lived (default: **15 minutes**, set per trust domain) and are not stored.
- **Claim rules decide who.** They can restrict by repository, branch, service account and custom claims. At least one is required, and a prefix must end on a boundary (`/`, `:` or `@`).
- **Audience decides for whom.** The audience check means a token minted for another service is refused once the trust domain enforces.
- **Every exchange is recorded.** Each exchange that reaches a trust domain is recorded in the audit trail as `oidc_token_exchanged` or `oidc_exchange_refused`, with the trust domain, the reason, and the audience the token carried. The token itself is never stored.
- **Credential-less.** No long-lived secret ever touches your CI/CD config.
