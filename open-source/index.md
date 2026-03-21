# Community vs Enterprise

Bella Baxter is open-core, source-available under the [ELv2 License](https://www.elastic.co/licensing/elastic-license). The self-hosted Community edition is free forever. Enterprise features require a license key.

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
| **SSO (SAML / OIDC login)** | Only matters when IT centrally manages logins. Individuals use username+password or social login. |
| **Audit log streaming / SIEM export** | Compliance at company scale (SOC2, ISO27001). The audit log UI stays free — only streaming to Splunk/Datadog/Azure Monitor is gated. |
| **Advanced RBAC** | Fine-grained permissions beyond Owner/Manager/Member/Consumer. Relevant when security teams need granular control across dozens of teams. |
| **Multi-tenant (multiple organisations on one instance)** | Relevant when running Bella as an internal platform for multiple business units. |

## Cloud Pricing (PAYG)

The Bella Baxter managed cloud runs on a **pay-as-you-go** model:

- **Free**: 10,000 API requests per month, no credit card required
- **Overage**: $0.005 per request beyond 10,000 (~$5 per 1,000 requests)
- **Enterprise**: Contact us — flat monthly, custom volume, SLA, dedicated support

A "request" = one HTTP call to the secrets API. `bella pull` always counts as **one request** regardless of how many secrets are returned.

Human workflows (WebApp, project management, CLI setup) are **never metered**.

### What typical usage costs

| Team | Activity | Monthly requests | Cost |
|------|----------|-----------------|------|
| Solo developer | Active development | ~800 | $0 |
| 3-person startup | Dev + CI/CD (20 deploys/day) | ~1,800 | $0 |
| 10-person team | Heavy CI/CD (100 deploys/day) | ~8,000 | $0 |
| 10-person team | 500 deploys/day | ~45,000 | $0.18 |
| 50-person company | 2,000 deploys/day | ~180,000 | $0.85 |

You pay more when you ship more to production. The bill growing is a signal that the business is growing.

## Self-Hosted vs Cloud

| | Self-Hosted (Community) | Cloud (PAYG) |
|--|------------------------|-------------|
| Cost | Free forever | $0 to start, $0.005/req overage |
| Infrastructure | You manage (Docker/Aspire/K8s) | Managed by Cosmic Chimps |
| Data residency | Your infrastructure | Cosmic Chimps (EU / US) |
| SSO | Enterprise license key | Enterprise plan |
| Audit streaming | Enterprise license key | Enterprise plan |
| Updates | Manual | Automatic |

## License

Bella Baxter is released under the **Elastic License v2 (ELv2)**:

- ✅ Self-host freely for any internal use
- ✅ Modify the source code
- ✅ Contribute back upstream
- ❌ Cannot offer Bella Baxter as a managed service to third parties without a commercial agreement

This prevents cloud providers from wrapping Bella Baxter as a competing service while keeping self-hosting completely free.

[→ Read the full license text](https://www.elastic.co/licensing/elastic-license)
