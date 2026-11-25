# Plans and licence

Bella Baxter is open-core, source-available under the [ELv2 License](https://www.elastic.co/licensing/elastic-license). The core is free. Paid plans add modules on top of it, on the cloud and on your own infrastructure.

## The Guiding Principle

> **The core is never capped and never priced per seat. We charge for organisational modules, and for cloud automation: never for the resources you need to do your job.**

A solo developer or a 3-person startup should never hit a wall while doing legitimate work.

## Two ways to run Bella, four plans each

You can use the managed **cloud**, run it **self-hosted** on your own infrastructure, or both. Each has four plans. Each plan holds everything in the one before it.

### Cloud

| Plan | What you get | How it is charged |
|------|--------------|-------------------|
| **Pay as you go** | The core. Automation is metered: 2,000 calls a month are free on a person's first organisation, then each call is charged. | $0.005 per request over the 2,000 free. |
| **Pro** | Pay as you go, plus single sign-on (SSO) and SIEM export. | Contact us. |
| **Enterprise** | Pro, plus no metering and 24/7 support. | By contract. |

Pay as you go is the default for every organisation. People's own sessions in the console and the CLI are never metered.

### Self-hosted

| Plan | What you get | How it is charged |
|------|--------------|-------------------|
| **Community Edition (CE)** | The core. Free, no cap, never metered. | Free. |
| **Pro** | CE, plus SSO and SIEM export. | Contact us. |
| **Premium** | Pro, plus certificate rotation (including ACME and vendor appliances) and Scout certificate discovery. | Contact us. |
| **Enterprise** | Premium, plus 24/7 support. | By contract. |

## What holds on every plan

- **The core is never capped and never priced per seat.** Projects, environments, secrets, API keys, providers and the rest of the list below have no limit on any plan.
- **Self-hosted is never metered.** Metering exists only on the cloud, where it can bill.
- **"Free" means the core and Community Edition.** It does not apply to the paid plans.
- **Certificate rotation and Scout are self-hosted only, for now.** They need a route into your network, and a shared cloud service must not have one. A cloud Premium plan waits for an outbound agent that you run inside your network. It is not built yet.

## What exists today and what is coming

**Today**

- The cloud is live, with Pay as you go. Pro and Enterprise are arranged by contacting us: [enterprise@cosmic-chimps.io](mailto:enterprise@cosmic-chimps.io). There is no self-serve checkout for them yet.
- SSO and SIEM export work on the cloud and on self-hosted. An organisation asks for them, and an operator approves SSO or switches streaming on. See [Single sign-on](/features/sso) and [Audit Logs](/audit/).
- On self-hosted, a paid module works when your licence key lists it and the operator of the installation has switched it on for an organisation. See [The licence key for self-hosted](#the-licence-key-for-self-hosted).

**Coming**

- Self-serve checkout for Pro on the cloud.
- Certificate rotation and Scout on the cloud, through the outbound agent.

## The licence key for self-hosted

A self-hosted installation turns on the paid modules with a **licence key**. We issue it when you take a paid plan.

- **What it turns on.** Three modules: single sign-on (SSO), SIEM export (audit streaming) and certificate rotation, which includes Scout certificate discovery. A Pro key lists the first two. A Premium or Enterprise key lists all three. The operator of the installation still decides which organisations get each module.
- **How it is checked.** The key is a signed token (ES256). The installation verifies the signature on its own, offline, against public keys built into the release. It makes no network call for it, so it works on a host with no route to the internet, and nothing about your key or your installation is sent to us.
- **Where you set it.** As deployment configuration, in the `BELLA_LICENSE` setting. In the self-hosted bundle the setup wizard writes it and `./bella.sh apply` carries it to the containers. See the bundle's installation guide.
- **What a key covers.** The same model as JetBrains tools. A key covers the releases up to the date printed on it (`upgrades_until`). A version line first released on or before that date keeps working with the key, with no end date, and so does every patch of that line. A later version line needs a renewed key. See the [support policy](/open-source/support-policy).
- **With a key, nothing switches off by date.** When a key does not cover the release you run, the core is untouched, and so is everything in [Always Free](#always-free-community). A control that is already on is never lowered: enforced SSO stays enforced, and scheduled certificate rotations carry on. The three modules stop accepting new configuration and new work, and nothing is deleted. Renew the key, or go back to a covered release, and they resume with no reconfiguration. Audit streaming to a SIEM is suspended while it is not licensed: one `stream suspended` control message is sent to the destination, nothing is queued, and your audit log in Bella Baxter stays complete. Streaming resumes on its own when the licence lists the module again.
- **One-time 30-day grace when you upgrade without a key.** An installation that already uses SSO, audit streaming or certificate rotation and upgrades into this version with no key keeps each of those modules for 30 days, counted from the first start of a build that can verify a production key. A module you were not using is not part of it. A mistyped or truncated key does not end the grace; a valid key does, and the modules it lists keep working.
- **A key problem never stops the installation.** A missing, mistyped or unreadable key never stops the installation from starting or from serving secrets. The paid modules behave as Community until the key is fixed, and the operator console says why.

## Always Free (Community)

These are in the core. Community Edition runs all of them free with no cap. On the cloud they are included in every plan, and only automation calls are metered.

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

Running more than one organisation on one instance is not gated. Any signed-in person can create another organisation today.

For the paid modules, see [Features by plan](/open-source/enterprise-features).

## Cloud usage

The Bella Baxter managed cloud meters automation, not people.

- **Free allowance**: 2,000 API requests per month, no credit card required.
  The free allowance belongs to the first organisation a person creates. An organisation they create afterwards starts with none, and its API key requests return `429` until a payment method is added. A person's own console and CLI sessions are never metered.
  When the free allowance is used up and no payment method is on file, API key requests return `429` until you add one.
- **Overage**: $0.005 per request beyond 2,000 (~$5 per 1,000 requests).
- **Enterprise**: no metering. Arranged by contract.

The free allowance and the rate are the defaults. An operator may set others for an organisation by contract.

A "request" = one HTTP call to the secrets API made by a machine identity (API key). This includes:
- `bella pull` / `bella run`: counts as **one request** regardless of how many secrets are returned
- CI/CD pipeline fetches (each deploy = one request)
- AI agent / MCP tool calls (each `get_secret` or `list_secret_keys` = one request)

The CLI MCP server uses ETag-based caching. When secrets haven't changed, subsequent AI tool calls return cached results without hitting the API, so a long AI session typically burns only 1–2 metered requests.

Human workflows (WebApp, project management, user management) are **never metered**.

### What typical usage costs

| Team | Activity | Monthly requests | Inside the 2,000 free? | Cost |
|------|----------|-----------------|------------------------|------|
| Solo developer | Active development | ~200 | Yes | $0 |
| 3-person startup | Dev + CI/CD (20 deploys/day) | ~600 | Yes | $0 |
| 3-person startup + AI | CI/CD + daily MCP sessions | ~1,800 | Yes | $0 |
| 10-person team | Heavy CI/CD (100 deploys/day) | ~3,000 | No | $5 |
| 10-person team | 500 deploys/day | ~15,000 | No | $65 |
| 50-person company | 2,000 deploys/day | ~60,000 | No | $290 |

You pay more when you ship more (or your AI agents are very busy). The bill growing is a signal that the team is growing.

## Self-Hosted vs Cloud

| | Self-Hosted | Cloud |
|--|-------------|-------|
| Plans | Community Edition, Pro, Premium, Enterprise | Pay as you go, Pro, Enterprise |
| Core cost | Free, no cap, never metered | $0 to start, $0.005 per request over 2,000 |
| Infrastructure | You manage (Docker/Aspire/K8s) | Managed by Cosmic Chimps |
| Data residency | Your infrastructure | Cosmic Chimps (EU / US) |
| SSO and SIEM export | Pro and above | Pro and above |
| Certificate rotation and Scout | Premium and above | Not available yet |
| 24/7 support | Enterprise | Enterprise |
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
