# PKI Certificates

Bella Baxter integrates with the [OpenBao / HashiCorp Vault PKI Secrets Engine](https://openbao.org/docs/secrets/pki/) to provide an internal Certificate Authority for your infrastructure. Issue short-lived TLS certificates on demand, automate renewal with ACME, and distribute your CA certificate to all services — no external CA required.

## How It Works

```
Admin configures CA
  → Environment → PKI / TLS → Configure PKI CA
  → OpenBao generates CA keypair (private key never leaves OpenBao)
  → Public CA cert copied and added to trust stores

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

Open the environment's **PKI / TLS** tab and click **Configure PKI CA**. The environment needs a Vault/OpenBao provider first. Bella generates a new root CA in the environment's secret store. It does not create an intermediate CA, and it cannot sign the CA with an existing corporate root CA.

Settings in the dialog:

| Field | Description | Example |
|-------|-------------|---------|
| Common Name | Common name of the root CA | `My Company Internal CA` |
| CA Lifetime (TTL) | How long the CA certificate is valid | `87600h` (10 years, the default) |
| Key Type | Algorithm: `rsa` or `ec` | `rsa` |
| Organization | Optional organisation (O) | `Acme Corp` |
| Country | Optional country code (C) | `US` |

The console uses the default key size for the key type: 4096 bits for `rsa` and 256 bits for `ec`. The API and the CLI also accept `ed25519` and a key size (`--key-bits` in the CLI). A root CA accepts:

- `rsa` with 3072, 4096 or 8192 bits (default 4096)
- `ec` with 256, 384 or 521 bits (default 256)
- `ed25519`, with no key size

Smaller keys are refused, because a root CA is valid for 10 years by default.

If the environment is linked to more than one secret store, the dialog also asks which store should hold the CA key. Bella records your choice and uses it for every later PKI operation.

After setup, copy the **CA Certificate (PEM)** shown on the tab. You need to add it to the trust stores of all machines that connect to services using certificates from this CA. You can also save it with `bella pki ca --output`.

### 2. Create a PKI Role

Roles control what certificates can be issued. On the **PKI / TLS** tab, find the **PKI Roles** card and click **Add Role**:

| Field | Description | Example |
|-------|-------------|---------|
| Role Name | Used in certificate requests | `web-server` |
| Allowed Domains | Domains this role can issue certs for | `internal.example.com` |
| Allow Subdomains | Allows `*.internal.example.com` | yes |
| Max TTL | Maximum certificate validity | `72h` |
| Default TTL | Validity used when a request does not ask for one | `24h` |

### 3. (Optional) Enable ACME for Automated Renewal

ACME is automatically configured when you set up a CA. The **ACME Directory** URL appears on the **PKI / TLS** tab, below the CA certificate. Provide this URL to your ACME clients.

## Issuing Certificates

### Via WebApp

1. Open the environment's **PKI / TLS** tab and click **Issue Certificate** in the **PKI Roles** card (it needs at least one role)
2. Select a role, enter the Common Name and optional SANs and IP SANs
3. Click **Issue Certificate** — the certificate, private key and issuing CA are shown
4. Copy them — the private key is shown once and never stored by Bella

### Via API

```http
POST /api/v1/projects/{projectRef}/environments/{envSlug}/pki/issue
Authorization: Bearer <token>
Content-Type: application/json

{
  "commonName": "api.internal.example.com",
  "roleName": "web-server",
  "altNames": "api.staging.internal,www.internal.example.com",
  "ipSans": "10.0.0.12",
  "ttl": "24h"
}
```

`commonName` and `roleName` are required. `altNames` and `ipSans` are each one comma-separated string. `ttl` is optional and defaults to the role's default TTL.

Response:
```json
{
  "success": true,
  "certificate": "-----BEGIN CERTIFICATE-----\n...",
  "privateKey": "-----BEGIN RSA PRIVATE KEY-----\n...",
  "privateKeyType": "rsa",
  "issuingCa": "-----BEGIN CERTIFICATE-----\n...",
  "caChain": ["-----BEGIN CERTIFICATE-----\n..."],
  "serialNumber": "1a:2b:3c:...",
  "expiration": 1773853200,
  "instructions": "..."
}
```

`expiration` is a Unix timestamp in seconds. `instructions` is text explaining how to save and use the files.

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

Bella exposes an **ACME proxy endpoint** compatible with any RFC 8555 client (certbot, acme.sh, Caddy, cert-manager). Your ACME client requests each certificate and renews it on its own schedule; Bella does not renew certificates for you.

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
POST /api/v1/projects/{projectRef}/environments/{envSlug}/pki/revoke
Authorization: Bearer <token>
Content-Type: application/json

{ "serialNumber": "1a:2b:3c:..." }
```

Or in the WebApp: on the **PKI / TLS** tab, open the **Issued Certificates** card and click the revoke button on the certificate's row. Only people who can manage the environment see this card.

### Emergency Revocation

Bella has no one-step action that rotates the CA keypair and invalidates every certificate at once. The **Reconfigure** button on the **PKI / TLS** tab opens the same configuration dialog as the first setup. The only confirmation the dialog asks for is when you point the CA at a different secret store while a CA key already exists in the current one (**Re-bind anyway**), because clients then keep trusting a CA the environment no longer uses.

To respond to a compromised certificate:

1. Revoke the certificate by serial number, in the **Issued Certificates** card, with the API, or with `bella pki revoke`
2. Issue a replacement certificate
3. Services that use ACME get a new certificate at their client's next renewal; force a renewal on the client if you cannot wait

## Security Notes

- **Private keys never leave OpenBao** — the CA private key is generated inside OpenBao and never extracted
- **Short-lived by default** — 24–72h certs expire automatically; no revocation needed for routine cert rotation
- **Issuance through the API or the WebApp is audit logged** — the PKI log records who issued or revoked which certificate and when, with the role, common name and serial number. Certificates issued through the ACME endpoint are not written to Bella's audit log
- **ACME authentication** — ACME uses RFC 8555 JWS signatures; the proxy is transparent and OpenBao enforces account-level security
- **Role-constrained issuance** — CN and SANs must match the role's `allowed_domains`; prevents unauthorized wildcard certs
