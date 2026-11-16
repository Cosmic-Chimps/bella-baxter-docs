# TOTP / 2FA Keys

Bella Baxter can store and manage TOTP (Time-based One-Time Password) keys — the seeds behind authenticator apps like Google Authenticator, Authy, and 1Password.

Use this to store 2FA backup seeds securely in Vault and generate codes on demand, without needing a physical device.

## Generate a New TOTP Key

```sh
bella totp generate github-2fa \
  --issuer "GitHub" \
  --account alice@example.com
```

The key name is the first argument. Bella asks for the issuer and the account if you leave them out. In a script or with `--json` you must pass both.

TOTP keys belong to an environment. Use `--project <slug>` and `--environment <slug>` to choose one, or leave them out to use your current context.

Bella generates a new TOTP seed, stores it in your Vault provider, and returns:
- The **otpauth URL** (`otpauth://...`), which the CLI prints. Bella does not return the seed as a separate base32 value.
- A **QR code**, which you can scan with an authenticator app. The CLI does not draw it: open the key in the web console to see it.

## Import an Existing TOTP Key

Import a key from the `otpauth://` URL that a service shows when you set up 2FA. A bare base32 secret is not accepted.

```sh
# From a file (recommended)
bella totp import github-2fa --from-file ./github-otpauth.txt

# From stdin
printf %s "$OTPAUTH_URL" | bella totp import github-2fa --stdin

# As an argument
bella totp import github-2fa "otpauth://totp/GitHub:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub"
```

The URL contains the seed. Passing it as an argument leaves it in your shell history and visible in the process list, so for scripts and CI use `--stdin` or `--from-file`. If you give none of the three, Bella prompts for the URL on a terminal. The `--project` and `--environment` options work as for `generate`.

## Get a Current TOTP Code

```sh
bella totp code github-2fa
```

Returns the current code and how long it stays valid (30 seconds for most services). Add `--quiet` (`-q`) to print only the code, which is useful in scripts.

The MCP tool `get_totp_code` exposes this to AI agents — Claude or Copilot can retrieve a 2FA code when it needs to log in to a service on your behalf.

## List TOTP Keys

```sh
bella totp list
```

## Delete a TOTP Key

```sh
bella totp delete github-2fa
```

Bella asks you to confirm. Add `--force` (`-f`) to skip the question.

## Use Cases

- **Team shared 2FA** — store the TOTP seed in a shared Bella project so any team member can generate a code
- **CI/CD authentication** — some services require 2FA even for API access; inject the code automatically via `bella totp code`
- **Backup** — a secure alternative to paper backup codes

## Security Notes

- TOTP seeds are stored in Vault, encrypted at rest by Vault itself
- Access is governed by the same RBAC as other secrets
- All code generation requests are logged in the audit trail
