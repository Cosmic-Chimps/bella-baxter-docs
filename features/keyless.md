# Keyless / Workload Identity

Trust Domains enable **keyless authentication** — CI/CD pipelines, Kubernetes pods, and other workloads authenticate using short-lived OIDC tokens issued by their platform. No static API keys in your CI/CD YAML.

## Supported Identity Providers

| Platform | Token source |
|----------|-------------|
| GitHub Actions | `id-token: write` + `ACTIONS_ID_TOKEN_REQUEST_URL` |
| Kubernetes | ServiceAccount token (`/var/run/secrets/...`) |
| Any OIDC provider | Custom trust domain configuration |

## How It Works

```
GitHub Actions job starts
  → Requests OIDC token from GitHub (JWT: iss=token.actions.githubusercontent.com)
  → bella run (or SDK) detects ACTIONS_ID_TOKEN_REQUEST_URL
  → Sends token to Bella: POST /api/v1/trust/exchange
  → Bella verifies token against trust domain rules
  → Returns short-lived bax-... API key scoped to configured project+environment
  → Secrets are fetched with that key (never stored)
```

## GitHub Actions Setup

### 1. Create a Trust Domain (admin, once)

From the console: **Environment → Trust Domains → New Trust Domain**.

Or over the API — this is the only scripted route; there is no `bella` command for it:

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
    "issuedTokenTtlMinutes": 15,
    "grantedRole": "Consumer"
  }'
```

The trust domain belongs to the environment in the URL, so the project and environment the issued key
is scoped to come from `$ENVIRONMENT_ID` rather than from flags. `operator` is one of `Equals`,
`StartsWith` or `Contains`.

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
        # No BELLA_BAXTER_API_KEY needed!
```

Or use the [GitHub Actions integration](/integrations/github-actions) directly.

## Kubernetes Setup

### 1. Create a Trust Domain

Console, or the same endpoint with your cluster's issuer:

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
    ]
  }'
```

### 2. Use in a Pod

```yaml
# k8s/deployment.yaml
spec:
  containers:
    - name: my-app
      command: ["bella", "exec", "-p", "my-api", "-e", "production", "--", "node", "server.js"]
      # SA token at /var/run/secrets/kubernetes.io/serviceaccount/token is auto-detected
```

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
    ]
  }'
```

## Token Exchange API

If you're implementing keyless auth in your own tooling:

```http
POST /api/v1/trust/exchange
Content-Type: application/json

{
  "provider": "GitHub",
  "token": "<oidc-jwt>"
}
```

Response:

```json
{
  "apiKey": "bax-...",
  "expiresAt": "2026-03-18T12:00:00Z",
  "projectSlug": "my-api",
  "environmentSlug": "production"
}
```

## Security Notes

- Exchanged tokens are short-lived (default: 1 hour) and not stored
- Trust domain rules can restrict by repository, branch, service account, and custom claims
- All token exchanges are logged in the audit trail
- Credential-less — no long-lived secret ever touches your CI/CD config
