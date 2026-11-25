# Features by plan

Reference for which features are in the core, which are paid modules, and which plan holds each one. For the plans themselves, see [Plans and licence](/open-source/).

::: info How paid plans are enabled
Pro and Enterprise are arranged by contacting us. There is no self-serve checkout yet. On the cloud, an operator enables your modules. On self-hosted, we issue you a licence key that lists the modules you have a contract for. The operator of the installation sets it and then switches each module on for the organisations that use it. See [The licence key for self-hosted](/open-source/#the-licence-key-for-self-hosted).
:::

## ✅ Always Free

| Feature | Reason |
|---------|--------|
| Unlimited projects | The exact cap that drove us to build Bella Baxter |
| Unlimited environments per project | Dev/staging/prod is table stakes |
| Unlimited secrets | Core functionality |
| Unlimited API keys | Primary auth for CI/CD — gating breaks automation |
| Custom providers (any count) | The entire value prop is connecting your own infra |
| Drift detection | Operational hygiene — not organizational governance |
| SSH Certificate Authority | Operational security feature |
| Trust domains / Workload identity (OIDC) | CI/CD auth — same category as API keys |
| TOTP (2FA key management) | Security, not governance |
| Webhooks | Operational event notifications |
| Secure Shares | Developer utility |
| MCP AI integration | Developer tooling |
| CLI, all SDKs | Fundamental developer workflow |
| .NET Aspire integration | Developer workflow |
| Notifications (Slack, Discord, Teams, Telegram) | Operational alerting |
| Security Intelligence scans | Security hygiene is a basic right |
| Audit log viewer (in WebApp) | Read-only UI access to your own access log |

**Test:** *"Would a solo developer or 3-person startup hit this while doing legitimate work?"* → If yes, it must be free.

## Paid modules

These are only relevant at **organisational scale**, so small teams never need them.

| Module | Cloud | Self-hosted |
|--------|-------|-------------|
| **Single sign-on (SAML or OIDC)** | Pro and Enterprise | Pro, Premium and Enterprise |
| **SIEM export** (Splunk, Datadog, Azure Monitor) | Pro and Enterprise | Pro, Premium and Enterprise |
| **Certificate rotation** (including ACME and vendor appliances) | Not available yet | Premium and Enterprise |
| **Scout certificate discovery** | Not available yet | Premium and Enterprise |
| **No metering** | Enterprise | Never metered on any plan |
| **24/7 support** | Enterprise | Enterprise |

- **SSO.** An organisation requests it, and an operator approves the request. See [Single sign-on](/features/sso).
- **SIEM export.** The audit log viewer in the console stays free. An operator switches streaming on for the organisation. See [Audit Logs](/audit/).
- **The self-hosted licence key.** A signed ES256 token that the installation verifies offline, with no network call. It lists the three modules above (SSO, SIEM export and certificate rotation, which includes Scout). A key covers the releases up to its `upgrades_until` date and every patch of those version lines. A later version line needs a renewed key, and until then the three modules run as Community, with no control lowered. See [Plans and licence](/open-source/#the-licence-key-for-self-hosted) and the [support policy](/open-source/support-policy).
- **Certificate rotation and Scout** are self-hosted only for now. Cloud Premium waits for an outbound agent that you run inside your network. It is not built yet.

Running more than one organisation on one instance is not gated. Any signed-in person can create another organisation today.

## ❌ Will NOT Be Gated

| Feature | Reason |
|---------|--------|
| Project count | This is the Infisical mistake — repeating it would betray the reason Bella Baxter was built |
| Environment count | Same |
| Provider count | Forces Bella onto our infra; destroys the value proposition |
| API key count | Breaks CI/CD for community users |
| Drift detection | Punishes good practices |
| Security scans | Detecting weak passwords is a basic security right |

## Getting a paid plan

Contact us: [enterprise@cosmic-chimps.io](mailto:enterprise@cosmic-chimps.io)

- **Pro:** SSO and SIEM export, on the cloud or self-hosted.
- **Premium (self-hosted):** Pro, plus certificate rotation and Scout.
- **Enterprise:** everything in Pro (cloud) or Premium (self-hosted), plus 24/7 support under a contract. On the cloud it also means no metering.

We do not publish prices here. Contact us and we will send you the terms.

Self-hosting is available on request; see [Self-hosting](/getting-started/self-hosting).
