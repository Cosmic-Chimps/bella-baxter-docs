# Quick Start

Get your first secret in under 5 minutes.

## 1. Install the CLI

::: code-group

```sh [Linux / macOS]
curl -sSL https://install.bella-baxter.io | sh
```

```powershell [Windows (PowerShell)]
iwr https://install.bella-baxter.io/windows | iex
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

After login, Bella shows the projects and environments you have access to:

```sh
bella context list
bella context use my-project/dev
```

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
