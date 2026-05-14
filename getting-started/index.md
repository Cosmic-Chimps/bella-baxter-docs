# Quick Start

Get your first secret in under 5 minutes.

## 1. Install the CLI

::: code-group

```sh [Linux / macOS]
curl -sSfL https://raw.githubusercontent.com/cosmic-chimps/bella-baxter-cli/main/scripts/install-bella.sh | bash
```

```powershell [Windows (PowerShell)]
irm https://raw.githubusercontent.com/cosmic-chimps/bella-baxter-cli/main/scripts/install-bella.ps1 | iex
```

:::

Verify the installation:

```sh
bella --version
```

## 2. Log In

```sh
bella login
```

This opens your browser for secure authentication via your organisation's identity provider (Keycloak, Google, GitHub, or any SSO). The CLI stores a short-lived token locally — no password is ever saved to disk.

## 3. Select Your Context

Run the interactive setup in your project directory to pick a project and environment:

```sh
bella context init
```

This creates a `.bella` file that pins the project/environment for that directory. You can also use the shortcut `bella init`.

Or set context non-interactively using an API key:

```sh
export BELLA_BAXTER_URL=https://your-instance.bella-baxter.io
export BELLA_BAXTER_API_KEY=bax-...
```

## 4. Pull Secrets

```sh
# Write secrets to .env in the current directory
bella pull

# Or inject into a running process — no file written
bella run -- npm start
bella exec -- python manage.py runserver
```

That's it. Your application receives the secrets as environment variables.

---

## What's Next?

- [Core Concepts](/getting-started/concepts) — understand projects, environments, providers, and secrets
- [CLI Reference](/cli/) — every command with examples
- [SDK docs](/sdks/) — use secrets directly in your application code
- [Keyless authentication](/features/keyless) — no API keys for CI/CD
