# Enterprise Features

Reference for which features require an Enterprise license and which are always free.

::: info Current Status
As of March 2026, **nothing is actually gated in the codebase**. All features are available during the pre-launch period. This page documents the *intent* — what will be gated once the product launches.
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
| **Audit log streaming / SIEM export** | Compliance requirement at company scale (SOC2, ISO27001). The in-app audit log viewer stays free. Streaming to Splunk/Datadog/Azure Monitor is enterprise. | Not yet built |
| **Advanced RBAC** | Fine-grained permission control beyond Owner/Manager/Member/Consumer. Only needed at large-team governance scale. | Not yet implemented |
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

## License Key Architecture (Planned)

A license key is a **JWT RS256** token containing the edition and feature list:

```json
{
  "edition": "Enterprise",
  "exp": 1800000000,
  "features": ["Sso", "AuditLogStreaming", "MultiTenant"],
  "issuedTo": "Acme Corp",
  "maxTenants": -1
}
```

**Verified offline** using a Cosmic Chimps public key embedded in the binary — no internet required. Air-gapped deployments are supported.

Expired key → graceful degradation to Community edition (never a hard crash, never data loss).

## Getting Enterprise

Contact us: [enterprise@cosmic-chimps.io](mailto:enterprise@cosmic-chimps.io)

Enterprise includes:
- License key for SSO + audit streaming + advanced RBAC
- SLA with defined response times
- Dedicated support channel
- Custom volume pricing for the managed cloud

## Self-Hosted Enterprise vs Cloud Enterprise

| | Self-Hosted Enterprise | Cloud Enterprise |
|--|------------------------|-----------------|
| License | Annual license key | Included |
| Infrastructure | Your own servers | Managed by Cosmic Chimps |
| Air-gapped | ✅ Yes | ❌ No |
| Support | SLA via ticket | SLA via ticket + dedicated channel |
