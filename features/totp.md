# TOTP / 2FA Keys

Bella Baxter can store and manage TOTP (Time-based One-Time Password) keys — the seeds behind authenticator apps like Google Authenticator, Authy, and 1Password.

Use this to store 2FA backup seeds securely in Vault and generate codes on demand, without needing a physical device.

## Generate a New TOTP Key

```sh
bella totp generate \
  --name github-2fa \
  --issuer "GitHub" \
  --account-name alice@example.com
```

Bella generates a new TOTP seed, stores it in your Vault provider, and returns:
- The **QR code URI** (scan with an authenticator app)
- The **base32 seed** (for backup)

## Import an Existing TOTP Key

```sh
bella totp import \
  --name github-2fa \
  --secret JBSWY3DPEHPK3PXP   # base32 seed
```

## Get a Current TOTP Code

```sh
bella totp code github-2fa
```

Returns the current 6-digit code (valid for 30 seconds).

The MCP tool `get_totp_code` exposes this to AI agents — Claude or Copilot can retrieve a 2FA code when it needs to log in to a service on your behalf.

## List TOTP Keys

```sh
bella totp list
```

## Delete a TOTP Key

```sh
bella totp delete github-2fa
```

## Use Cases

- **Team shared 2FA** — store the TOTP seed in a shared Bella project so any team member can generate a code
- **CI/CD authentication** — some services require 2FA even for API access; inject the code automatically via `bella totp code`
- **Backup** — a secure alternative to paper backup codes

## Security Notes

- TOTP seeds are stored in Vault, encrypted at rest by Vault itself
- Access is governed by the same RBAC as other secrets
- All code generation requests are logged in the audit trail
