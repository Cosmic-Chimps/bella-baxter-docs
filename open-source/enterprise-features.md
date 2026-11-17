# Enterprise Features

Reference for which features are part of the Enterprise plan and which are always free.

::: info How Enterprise is enabled
There is no license key. Enterprise is a plan on the same API: it is not sold through checkout, and we assign it to your organization after you contact us.
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

## 🔒 Enterprise Only

| Feature | Rationale | Status |
|---------|-----------|--------|
| **Advanced RBAC** | Fine-grained permission control beyond the built-in project and environment roles. Only needed at large-team governance scale. | Contact us for availability |

Two features are not limited to the Enterprise plan. Every plan can add them, at extra cost:

- **Single sign-on (SAML or OIDC).** An organisation requests it, and a platform operator approves the request. See [Single sign-on](/features/sso).
- **Audit log streaming to a SIEM** (Splunk, Datadog, Azure Monitor). The audit log viewer in the console stays free. A platform operator switches streaming on for the organisation. See [Audit Logs](/audit/).

To add either one, [contact us](#getting-enterprise).

Running more than one organisation on one instance is not an Enterprise feature. Any signed-in person can create another organisation today.

## ❌ Will NOT Be Gated

| Feature | Reason |
|---------|--------|
| Project count | This is the Infisical mistake — repeating it would betray the reason Bella Baxter was built |
| Environment count | Same |
| Provider count | Forces Bella onto our infra; destroys the value proposition |
| API key count | Breaks CI/CD for community users |
| Drift detection | Punishes good practices |
| Security scans | Detecting weak passwords is a basic security right |

## Getting Enterprise

Contact us: [enterprise@cosmic-chimps.io](mailto:enterprise@cosmic-chimps.io)

Enterprise includes:
- The Enterprise plan features listed above
- SLA with defined response times
- Dedicated support channel
- Custom volume pricing for the managed cloud

Self-hosting is available on request; see [Self-hosting](/getting-started/self-hosting).
