# Community vs Enterprise

Bella Baxter is open-core, source-available under the [ELv2 License](https://www.elastic.co/licensing/elastic-license). The self-hosted Community edition is free forever. Enterprise features are part of the Enterprise plan; contact us to enable them.

## The Guiding Principle

> **Cap organizational features (SSO, audit streaming, multi-team governance) — not operational features (resources you need to do your job).**

A solo developer or a 3-person startup should never hit a wall while doing legitimate work.

## Always Free (Community)

| Feature | Why it's always free |
|---------|---------------------|
| Unlimited projects | The exact cap that made Infisical frustrating to use |
| Unlimited environments | Dev/staging/prod is table stakes |
| Unlimited secrets | Core functionality |
| Unlimited API keys | Primary auth for CI/CD — gating breaks automation |
| All custom providers (Vault, AWS, Azure, GCP) | The entire value proposition — connecting your own infra |
| CLI access | Fundamental developer workflow |
| All SDKs (10 languages) | Developer tooling |
| SSH Certificate Authority | Operational security, not organizational governance |
| Trust Domains / Workload Identity (OIDC) | CI/CD auth — same category as API keys |
| TOTP (2FA key management) | Security feature for every developer |
| Webhooks | Operational event notifications |
| Secure Shares | Developer utility |
| Drift detection | Operational hygiene |
| MCP / AI integration | Developer tooling |
| Notifications (Slack, Discord, Teams, Telegram) | Operational alerting |
| Security Intelligence scans | Detecting `password123` is a basic right, not a paid upgrade |
| .NET Aspire integration | Developer workflow |

## Enterprise Features

These are gated because they're only relevant at **organisational scale** — small teams never need them.

| Feature | Why it's paid |
|---------|--------------|
| **Advanced RBAC** | Fine-grained permissions beyond the built-in project and environment roles. Relevant when security teams need granular control across dozens of teams. |

Two features are paid modules, available on every plan at extra cost:

- **Single sign-on (SAML or OIDC).** An organisation requests it, and a platform operator approves the request. See [Single sign-on](/features/sso).
- **Audit log streaming to a SIEM** (Splunk, Datadog, Azure Monitor). The audit log in the console stays free. A platform operator switches streaming on for the organisation. See [Audit Logs](/audit/).

To add either one, contact us: [enterprise@cosmic-chimps.io](mailto:enterprise@cosmic-chimps.io).

Running more than one organisation on one instance is not gated. Any signed-in person can create another organisation today.

## Cloud Pricing (PAYG)

The Bella Baxter managed cloud runs on a **pay-as-you-go** model:

- **Free**: 2,000 API requests per month, no credit card required
  The free allowance belongs to the first organisation a person creates. An organisation they create afterwards starts with none, and its API key requests return `429` until a payment method is added. A person's own console and CLI sessions are never metered.
  When the free allowance is used up and no payment method is on file, API key requests return `429` until you add one. Signing in to the console or the CLI is not metered.
- **Overage**: $0.005 per request beyond 2,000 (~$5 per 1,000 requests)
- **Enterprise**: Contact us — flat monthly, custom volume, SLA, dedicated support

A "request" = one HTTP call to the secrets API made by a machine identity (API key). This includes:
- `bella pull` / `bella run` — counts as **one request** regardless of how many secrets are returned
- CI/CD pipeline fetches (each deploy = one request)
- AI agent / MCP tool calls (each `get_secret` or `list_secret_keys` = one request)

The CLI MCP server uses ETag-based caching — when secrets haven't changed, subsequent AI tool calls return cached results without hitting the API, so a long AI session typically burns only 1–2 metered requests.

Human workflows (WebApp, project management, user management) are **never metered**.

### What typical usage costs

| Team | Activity | Monthly requests | Cost |
|------|----------|-----------------|------|
| Solo developer | Active development | ~200 | $0 |
| 3-person startup | Dev + CI/CD (20 deploys/day) | ~600 | $0 |
| 3-person startup + AI | CI/CD + daily MCP sessions | ~1,800 | $0 |
| 10-person team | Heavy CI/CD (100 deploys/day) | ~3,000 | $5 |
| 10-person team | 500 deploys/day | ~15,000 | $65 |
| 50-person company | 2,000 deploys/day | ~60,000 | $290 |

You pay more when you ship more (or your AI agents are very busy). The bill growing is a signal that the team is growing.

## Self-Hosted vs Cloud

| | Self-Hosted (Community) | Cloud (PAYG) |
|--|------------------------|-------------|
| Cost | Free forever | $0 to start, $0.005/req overage |
| Infrastructure | You manage (Docker/Aspire/K8s) | Managed by Cosmic Chimps |
| Data residency | Your infrastructure | Cosmic Chimps (EU / US) |
| SSO | Paid module. The operator of the installation approves each request | Available on every plan, at extra cost. Cosmic Chimps approves each request |
| Audit streaming | Paid module. The operator of the installation switches it on per organisation | Available on every plan, at extra cost |
| Updates | Manual | Automatic |

## License

Bella Baxter is released under the **Elastic License v2 (ELv2)**:

- ✅ Self-host freely for any internal use
- ✅ Modify the source code
- ✅ Contribute back upstream
- ❌ Cannot offer Bella Baxter as a managed service to third parties without a commercial agreement

This prevents cloud providers from wrapping Bella Baxter as a competing service while keeping self-hosting completely free.

[→ Read the full license text](https://www.elastic.co/licensing/elastic-license)

### Client libraries are MIT

The Elastic License covers the Bella Baxter server: the product you self-host, and the one Cosmic Chimps runs as the cloud service.

The client libraries are released under the **MIT License**. That covers the SDKs for every language, the shared cryptography library `BellaBaxter.Crypto`, the `bella` CLI, the Terraform provider, the Ansible collection and the GitHub setup action. You can use them in your own software, open or closed, without restriction. Each one carries its own `LICENSE` file.

Releases of the Swift package published before 16 November 2026 still carry the Elastic License in their `LICENSE` file. Later releases carry MIT.

### Third-party software

Bella Baxter runs on open-source software that keeps its own licence, including OpenBao (MPL 2.0), Keycloak (Apache 2.0), PostgreSQL, Redis and the .NET runtime. The `NOTICE` file in the self-hosted bundle lists each one, with its licence.
