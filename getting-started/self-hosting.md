# Self-Hosting

Run your own Bella Baxter instance on your infrastructure. Address it however
your network works — a DNS name with your own certificate, or (fully
supported, no prerequisites) a raw IP / `/etc/hosts` name with no public DNS
and no outbound internet after the initial image pull.

## The self-hosted bundle (recommended)

Self-hosting is available on request: [contact us](mailto:enterprise@cosmic-chimps.io)
and we will set it up with you. There is no public download yet.

The bundle contains a generated `docker-compose.yaml`, an `.env.template`, and a
single `bella.sh` script. It is produced directly from the platform's Aspire
application model, so it can never drift from the real topology.

### Requirements

- A Linux host with Docker Engine + the `docker compose` plugin
- Credentials for the Bella Baxter container registry (we provide them when we set up your instance)
- Three host ports: `443` (application), `8444` (admin plane), `9443` (setup)

### Install

Once you have the bundle:

```sh
tar -xzf bella-selfhosted-<version>.tar.gz
cd bella-selfhosted-<version>
./bella.sh up
```

`up` starts the infrastructure plane (PostgreSQL, Redis, two OpenBao vaults,
Keycloak) and the **setup wizard**, then prints the wizard URL and a one-time
setup token:

```
Setup wizard:  https://<your-ip>:9443
Setup token:   ****************
```

The wizard walks you through everything that used to be a manual runbook:

1. **TLS** — bring your own certificate (drop `server.crt`/`server.key` into
   `bella-config/pki/`; the wizard verifies and uses it as-is), or let the
   wizard mint an internal CA and a server certificate with your IP/hostname
   in the SAN — you then install `ca.crt` on client machines once.
2. **Vault initialization** — initializes the seal vault (Shamir 3-of-2) and
   the main vault (transit auto-unseal), showing each recovery kit **exactly
   once** behind a forced download.
3. **Provisioning** — policies, AppRoles, and service credentials, verified by
   live login before the wizard proceeds.
4. **Identity** — the Keycloak realm, clients, roles, TOTP enforcement, and
   your initial operator account.

When the wizard finishes:

```sh
./bella.sh apply     # starts the application plane
```

and open `https://<your-ip>`.

### After a reboot

The seal vault re-seals on every host reboot by design. Open the wizard URL,
log in with the ops token, and paste 2 of your 3 unseal keys — the main vault
auto-unseals via transit and the platform recovers on its own.

```sh
./bella.sh unseal    # prints the URL + token if you've lost track
```

### Topology

One HTTPS origin fronts everything: the web app, the API family (including
certificate management and discovery), and Keycloak (under `/auth`). The
admin/back-office plane runs on its own port with the same certificate. All
service-to-service traffic stays on the private compose network; secret
material lives only in OpenBao — never in Bella's own database.

### Email verification on an air-gapped install

The bundle sends no email: there is no mail server for Keycloak or Bella to
use. That matters for one thing. An organisation invitation is accepted only
by an account whose email address Keycloak holds as **verified** and that
matches the address invited, so that a leaked invitation link cannot be used by
someone else. On a hosted plane people verify their address through a link
Keycloak mails them. Here nobody can, so the console tells an invitee that the
**platform operator** (you, not the organisation's administrator, who cannot do
this) has to confirm the address.

You have three ways to do that:

1. **Create the account yourself.** An account created through the operator API
   (`POST /api/v1/admin/users`) is created with its address already verified.
2. **Mark an existing account's address as verified.** In the operator console,
   open **Users**, find the account, and choose **Mark email as verified**. You
   see the address you are vouching for, give a reason, and confirm. Do this
   only after confirming outside Bella that the account's owner controls that
   address: the account can then accept invitations to that address in every
   organisation. The change is recorded in the audit log with your reason (never
   the address). If the person changed their address in the meantime, the
   request is refused and you search again.
3. **Use an identity provider you operate.** Connect your own directory to the
   Keycloak realm as the platform operator. Addresses it asserts are trusted.
   Single sign-on connections that an organisation adds for itself in the
   console are not: they vouch only inside that organisation.

If someone later changes their address themselves, Keycloak marks it unverified
again and it has to be confirmed again.

Because there is no mail server, the bundle does **not** require people to verify
their address at sign-up: that would lock everyone out, since the verification
mail could never arrive. If your install has a working mail relay for Keycloak,
set `KEYCLOAK_VERIFY_EMAIL=true` in the bundle's `.env` before the setup wizard
runs its Keycloak step, and the customer realm will then require a verified
address at sign-up. Leave it unset otherwise. The default is `false`, and any
value other than `true` or `false` stops the wizard at start.

## Option 2: .NET Aspire (for development/integration)

Consume the published `AddBellaBaxter` Aspire resource to embed a Bella
Baxter stack in your own AppHost. See the SDK samples
(`apps/sdk/dotnet/samples/05-aspire-selfhosted`).

## Option 3: Kubernetes

A Helm chart is planned. Talk to us if Kubernetes is a hard requirement.
