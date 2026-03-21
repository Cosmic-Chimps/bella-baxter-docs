---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Bella Baxter"
  text: "Unified Secret Management Gateway"
  tagline: Connect your own Vault, AWS Secrets Manager, Azure Key Vault, or GCP Secret Manager — and manage everything from one place.
  image:
    src: /logo.svg
    alt: Bella Baxter
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/
    - theme: alt
      text: View on GitHub
      link: https://github.com/cosmic-chimps/bella-baxter
    - theme: alt
      text: API Reference
      link: /api-reference/

features:
  - icon: 🔐
    title: Your Infrastructure, Your Rules
    details: Bella Baxter never stores your secrets. It connects to the secret stores you already operate — Vault/OpenBao, AWS, Azure, GCP — and acts as a unified proxy.
  - icon: ⚡
    title: Zero-Friction Developer Experience
    details: Pull secrets with a single command. Run any process with secrets injected. No .env files committed, no credentials in CI/CD yaml.
  - icon: 🌐
    title: Multi-Language SDKs
    details: Official SDKs for JavaScript/TypeScript, .NET, Python, Go, Ruby, PHP, Swift, Java, Dart, and Ansible. All with typed secret code generation.
  - icon: 🔑
    title: Keyless Authentication
    details: GitHub Actions, Kubernetes, and any OIDC-capable workload can authenticate without static API keys. Trust domains verify identity automatically.
  - icon: 🛡️
    title: SSH Certificate Authority
    details: Issue short-lived SSH certificates instead of distributing static keys. Integrates with your Vault instance. Developers sign with bella ssh sign.
  - icon: 🔔
    title: Webhooks & Notifications
    details: Get notified on Slack, Discord, Teams, or Telegram when secrets change, leases expire, or security scans detect issues.
  - icon: 🤖
    title: MCP / AI Integration
    details: Expose Bella Baxter as an MCP server for Claude, GitHub Copilot, and Cursor. AI agents can manage secrets securely on your behalf.
  - icon: 📊
    title: Security Intelligence
    details: Automated scans for weak secrets, exposed credentials, and policy violations. A security dashboard so nothing slips through the cracks.
  - icon: 🏗️
    title: .NET Aspire Native
    details: First-class .NET Aspire integration. Add Bella Baxter to your Aspire AppHost with one line and all services get secrets automatically.
---

## Why Bella Baxter?

Existing secret management tools gate the features you actually need behind expensive per-seat plans, or force you onto their infrastructure.

Bella Baxter was built differently:

- **Unlimited projects and environments** — no artificial caps
- **Your own infrastructure** — connect Vault, AWS, Azure, or GCP. You own your data.
- **Free to start** — 10,000 API requests per month included, no credit card required
- **Self-hostable** — run it yourself with Docker or .NET Aspire, forever free under ELv2

---

## Quick Start

```sh
# Install the CLI
curl -sSL https://install.bella-baxter.io | sh

# Log in
bella login

# Pull secrets into your current shell
bella pull

# Or run a command with secrets injected
bella run -- npm start
```

[→ Full getting started guide](/getting-started/)
