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

From WebApp: **Settings → Trust Domains → New Trust Domain**

```sh
bella trust-domains create \
  --name "GitHub Actions CI" \
  --provider GitHub \
  --repository "myorg/my-repo" \
  --branch "main" \
  --project my-api \
  --environment production
```

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

```sh
bella trust-domains create \
  --name "K8s Production" \
  --provider Kubernetes \
  --cluster-url https://k8s.example.com \
  --service-account my-namespace/my-app \
  --project my-api \
  --environment production
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
bella trust-domains create \
  --name "GitLab CI" \
  --provider OIDC \
  --issuer https://gitlab.com \
  --audience https://your-bella.example.com \
  --claim-rules '{"project_path": "mygroup/myrepo"}' \
  --project my-api \
  --environment production
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
