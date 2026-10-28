# Single Sign-On

The Owner of an organisation on the Org plan can connect the organisation's own identity provider, over OIDC or SAML, so the team signs in with it. This page covers what Bella does when you connect one, what each message means, and what to do about it.

## Before you start

- Your organisation is on the Org plan, and you are its Owner.
- Your SSO access is approved. Request it from **Settings, SSO**. A platform administrator decides the request, and a rejected request can be made again.
- On the hosted plane, tenant SSO is not offered yet. It needs an egress policy on the identity broker that does not exist yet, so requests there are not approved until it does (#1555). On a self-hosted installation you can use it now (see [Self-hosted installations](#self-hosted-installations)).

## How Bella reads your identity provider

You give Bella one address: the **discovery URL** (OIDC) or the **metadata URL** (SAML). It must be an `https` address that your provider publishes.

Bella fetches that document itself, through its guarded outbound path. It checks every endpoint the document names, then writes those endpoints into the sign-in configuration explicitly: the authorisation, token and key endpoints for OIDC, the sign-on endpoint and signing certificates for SAML. The identity broker is never given your address to fetch on its own.

What this means for you:

- The address is read when you save, and again when you update. If the provider later moves an endpoint, update the connection so Bella reads the document again.
- Bella never follows a redirect from the address. Give the final address.
- Endpoints can be on a different host than the discovery URL, as long as each one is allowed.
- If your provider's issuer differs from its address, fill in **Expected issuer**. It must be on the same host as the discovery URL.
- The client secret is held only by the identity broker. Bella does not store it, and leaving it blank on an update keeps the stored one.

## When something goes wrong

Each refusal shows one message. Nothing is recorded when a request is refused.

| Message | What it means | What to do |
|---|---|---|
| That address is not allowed | The address, or an endpoint inside the document, is not an allowed destination: not `https`, a private or internal address, or a name that is refused. | Use the address your provider publishes on the public internet. On a self-hosted installation with a provider on a private network, ask your platform operator. |
| Bella could not read the identity provider's configuration | The document could not be fetched, was too large, redirected, or is not usable (for example, an issuer that does not match, or SAML metadata with no browser sign-on binding or a weak signing key). | Open the address in a browser from outside your network and check it is the final, complete document. Fix the provider, then save again. |
| Bella could not manage the identity provider right now | The identity broker did not accept the change. | Try again in a few minutes. If it keeps happening, tell your platform operator: the platform may be missing a permission. |
| Another change to this connection is in progress | Someone else, or a background task, is changing the connection. | Wait a moment and try again. |
| Enforcement cannot be turned on until the connection is complete | See [Connection state](#connection-state). | Fix the connection first. |
| Too many requests | Each save makes Bella fetch a document, so these calls are limited per organisation and person. | Wait a minute and try again. |

## Connection state

The SSO page shows the state of the connection. It is read from the identity broker every time, never stored.

- **Complete.** The provider has every endpoint it needs and is enabled. People can sign in.
- **Incomplete.** The provider is missing something or is not enabled yet. The page shows the last problem. Saving the connection again, or the automatic reconciliation, usually completes it.
- **Unknown.** Bella could not read the state. It is never shown as complete.

For SAML, the page warns from 30 days before the signing certificate expires, and again once it has expired. Ask your provider to publish a new certificate, then update the connection so Bella reads it.

## Enforcing SSO

Turn on **Enforce SSO** to require the team to sign in through your provider. It turns on only over a complete connection. Turning it off is always possible.

When enforcement is on, a person whose email domain is registered to your connection is refused unless they signed in through your provider. This applies to the console, the CLI and AI assistant connections alike. The SSO settings themselves stay reachable, so an Owner can always turn enforcement off.

If an enforced connection becomes incomplete, your team cannot sign in through SSO until it is fixed. It does not let them in another way. Turn enforcement off first if you need them back in.

## Removing SSO

Removing the connection deletes the provider's sign-in configuration and every link between your members' Bella accounts and your provider. The console warns before it does.

Members who signed in through your provider recover access by verifying their existing Bella account: they sign in again, and Bella asks them to confirm the account that has their address. Nothing in their projects or grants is deleted.

## Self-hosted installations

- **Private network providers.** An identity provider on a private network is allowed where your platform operator permits private destinations. Loopback, link-local and cloud-metadata addresses are always refused.
- **A private certificate authority.** Bella and the identity broker verify your provider's certificate against the platform's trust store. A private CA is supported only when the operator adds it to the trust store of both the API and the identity broker. No setting in the console can add a trust anchor, because the broker's trust store is shared by every organisation.
- **Egress policy (recommended).** At sign-in the identity broker contacts your provider's token and key endpoints itself, and Bella's check at save time cannot cover that. Restrict the broker's outbound traffic so it cannot reach link-local and cloud-metadata addresses (IPv4 and IPv6) or your internal ranges, other than the ones it needs. This is the same policy the hosted plane is waiting for.
- **Declared residual.** Without that policy, a provider whose name resolves differently at sign-in than when it was saved could point the broker at an internal address. Bella judged the endpoints when you saved them, so the risk is a provider that changes after approval. The broker also follows a
  redirect when it fetches a provider's signing keys at sign-in, so a provider can send it to an address Bella never checked. The
  egress policy is what stops both. Treat the policy as part of enabling tenant SSO.
- **Permission.** The platform needs the `manage-identity-providers` role on its admin client. New installations get it. For an existing installation, run `setup-keycloak.sh --roles-only` or use the setup wizard's identity-broker roles step. A missing role is reported to the platform operator, not to you.
