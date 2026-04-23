# PKI Certificates

Bella Baxter integrates with the [OpenBao / HashiCorp Vault PKI Secrets Engine](https://openbao.org/docs/secrets/pki/) to provide an internal Certificate Authority for your infrastructure. Issue short-lived TLS certificates on demand, automate renewal with ACME, and distribute your CA certificate to all services — no external CA required.

## How It Works

```
Admin configures CA
  → Environment → Certificates → Configure CA
  → OpenBao generates CA keypair (private key never leaves OpenBao)
  → Public CA cert downloaded and added to trust stores

Developer/service requests a certificate
  → Via WebApp, CLI, API, or ACME client
  → Bella validates access → calls OpenBao PKI issue
  → Certificate returned (private key shown once, never stored by Bella)
  → Certificate expires automatically (no manual revocation for short-lived certs)

Services auto-renew with ACME
  → certbot / Caddy / cert-manager / acme.sh
  → Connect to Bella's ACME directory URL (your CA, your URL)
  → Certificates renewed automatically before expiry
```

## Admin Setup

### 1. Configure the CA

Open **Environment → Certificates → Configure CA**. Choose:

- **Generate new root CA** — best for development and isolated environments
- **Generate intermediate CA** — for production; the CSR is signed by your existing corporate root CA

Key settings:
| Field | Description | Example |
|-------|-------------|---------|
| Common Name | CA display name | `My Company Internal CA` |
| Max TTL | How long certs can be valid | `87600h` (10 years for CA) |
| Key Type | Algorithm | `rsa-4096` or `ec-p256` |

After setup, download the **CA certificate** (PEM) — you'll need to add it to trust stores on all machines that connect to services using certs from this CA.

### 2. Create a PKI Role

Roles control what certificates can be issued. Go to **Certificates → Roles → Add Role**:

| Field | Description | Example |
|-------|-------------|---------|
| Role Name | Used in certificate requests | `web-server` |
| Allowed Domains | Domains this role can issue certs for | `internal.example.com` |
| Allow Subdomains | Allows `*.internal.example.com` | yes |
| Max TTL | Maximum certificate validity | `72h` |

### 3. (Optional) Enable ACME for Automated Renewal

ACME is automatically configured when you set up a CA. The **ACME Directory URL** appears in the WebApp under **Certificates**. Provide this URL to your ACME clients.

## Issuing Certificates

### Via WebApp

1. Open **Environment → Certificates → Issue Certificate**
2. Select a role, enter Common Name and optional SANs
3. Click **Issue** — the certificate, private key, and CA chain are shown
4. Download as PEM — the private key is shown once and never stored by Bella

### Via API

```http
POST /api/v1/projects/{projectRef}/environments/{envSlug}/providers/{providerSlug}/pki/issue
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "web-server",
  "commonName": "api.internal.example.com",
  "altNames": ["api.staging.internal"],
  "ttl": "24h"
}
```

Response:
```json
{
  "serialNumber": "1a:2b:3c:...",
  "certificate": "-----BEGIN CERTIFICATE-----\n...",
  "privateKey": "-----BEGIN RSA PRIVATE KEY-----\n...",
  "caChain": ["-----BEGIN CERTIFICATE-----\n..."],
  "issuingCa": "-----BEGIN CERTIFICATE-----\n...",
  "expiresAt": "2026-03-18T17:00:00Z"
}
```

> **The private key is shown once.** Bella never stores private keys — save it immediately.

### Via CLI

#### Full PKI workflow

```sh
# 1. Configure the CA (one-time setup per environment)
bella pki configure \
  --environment staging \
  --common-name "Acme Corp Staging CA" \
  --organization "Acme Corp" \
  --country US

# 2. Create a PKI role that defines what certs can be issued
bella pki roles create \
  --name web-server \
  --allowed-domains internal.example.com \
  --allow-subdomains \
  --max-ttl 720h \
  --default-ttl 24h

# 3. Issue a certificate
bella pki issue \
  --environment staging \
  --role web-server \
  --cn api.internal.example.com \
  --alt-names "www.internal.example.com,api2.internal.example.com" \
  --ttl 24h \
  --out ./certs/api.staging
# Writes: ./certs/api.staging.crt, ./certs/api.staging.key, ./certs/api.staging-chain.pem

# 4. View the CA and ACME directory URL
bella pki ca --environment staging

# 5. Revoke a certificate
bella pki revoke --serial "1a:2b:3c:..."
```

Other PKI commands:

```sh
# List all PKI roles
bella pki roles list

# Delete a role
bella pki roles delete --name web-server

# Save CA certificate to file (for trust store distribution)
bella pki ca --output /etc/ssl/certs/acme-corp-ca.pem
```

## ACME — Automated Certificate Renewal

Bella exposes an **ACME proxy endpoint** compatible with any RFC 8555 client (certbot, acme.sh, Caddy, cert-manager). Certificates are renewed automatically before expiry.

The ACME Directory URL is displayed in the WebApp after CA setup:
```
https://api.bella-baxter.io/api/v1/pki/acme/{tenantId}/{projectRef}/{envSlug}/directory
```

### Caddy

```caddyfile
api.internal.example.com {
  tls {
    ca https://api.bella-baxter.io/api/v1/pki/acme/{tenantId}/my-project/staging/directory
    ca_root /etc/bella/ca-chain.pem
  }
}
```

### certbot

```bash
certbot certonly \
  --server https://api.bella-baxter.io/api/v1/pki/acme/{tenantId}/my-project/staging/directory \
  --standalone \
  -d api.internal.example.com
```

### acme.sh

```bash
acme.sh --issue \
  --server https://api.bella-baxter.io/api/v1/pki/acme/{tenantId}/my-project/staging/directory \
  --standalone \
  -d api.internal.example.com
```

### cert-manager (Kubernetes)

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: bella-baxter-staging
spec:
  acme:
    server: https://api.bella-baxter.io/api/v1/pki/acme/{tenantId}/my-project/staging/directory
    caBundle: <base64-encoded-ca-cert>
    privateKeySecretRef:
      name: bella-baxter-staging-key
    solvers:
      - http01:
          ingress:
            class: nginx
```

> **Note:** For internal services that aren't publicly reachable, use `dns-01` challenge with your DNS provider, or `tls-alpn-01` if you control the TLS terminator.

## Revocation

### Manual Revocation

```http
POST /api/v1/projects/{projectRef}/environments/{envSlug}/providers/{providerSlug}/pki/revoke
Authorization: Bearer <token>
Content-Type: application/json

{ "serialNumber": "1a:2b:3c:..." }
```

Or via WebApp: **Certificates → View Active Certificates → Revoke**.

### Emergency Revocation

Rotate the CA keypair to instantly invalidate **all** certificates issued by this CA:

1. **Certificates → Rotate CA** in the WebApp
2. Download new CA certificate
3. Redistribute to trust stores
4. All services auto-renew via ACME on next request

## Security Notes

- **Private keys never leave OpenBao** — the CA private key is generated inside OpenBao and never extracted
- **Short-lived by default** — 24–72h certs expire automatically; no revocation needed for routine cert rotation
- **All issuances are audit logged** — full trail of who requested what certificate and when
- **ACME authentication** — ACME uses RFC 8555 JWS signatures; the proxy is transparent and OpenBao enforces account-level security
- **Role-constrained issuance** — CN and SANs must match the role's `allowed_domains`; prevents unauthorized wildcard certs
