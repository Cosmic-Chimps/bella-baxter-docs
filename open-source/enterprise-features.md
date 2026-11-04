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
| **SSO (SAML / OIDC login)** | Pure organizational feature — only relevant when IT centrally manages logins. Individuals use username+password or social login. | Partially implemented (SSO hint flow + SuperAdmin approval) |
| **Audit log streaming / SIEM export** | Compliance requirement at company scale (SOC2, ISO27001). The in-app audit log viewer stays free. Streaming to Splunk/Datadog/Azure Monitor is enterprise. | Available on the Enterprise plan (contact us) |
| **Advanced RBAC** | Fine-grained permission control beyond Owner/Manager/Member/Consumer. Only needed at large-team governance scale. | Contact us for availability |
| **Multi-tenant (multiple orgs on one instance)** | Relevant when running Bella as an internal platform for multiple business units. The multi-tenant architecture is built; the gating is not. | Architecture built, gating pending |

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
