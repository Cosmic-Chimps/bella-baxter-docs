# Self-Hosting

Run your own Bella Baxter instance on your infrastructure. Address it however
your network works — a DNS name with your own certificate, or (fully
supported, no prerequisites) a raw IP / `/etc/hosts` name with no public DNS
and no outbound internet after the initial image pull.

## The self-hosted bundle (recommended)

Each release ships a `bella-selfhosted-<version>.tar.gz` bundle containing a
generated `docker-compose.yaml`, an `.env.template`, and a single `bella.sh`
script. The bundle is produced directly from the platform's Aspire application
model, so it can never drift from the real topology.

### Requirements

- A Linux host with Docker Engine + the `docker compose` plugin
- Credentials for the Bella Baxter container registry (provided with your license)
- Three host ports: `443` (application), `8444` (admin plane), `9443` (setup)

### Install

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

## Option 2: .NET Aspire (for development/integration)

Consume the published `AddBellaBaxter` Aspire resource to embed a Bella
Baxter stack in your own AppHost. See the SDK samples
(`apps/sdk/dotnet/samples/05-aspire-selfhosted`).

## Option 3: Kubernetes

A Helm chart is planned. Talk to us if Kubernetes is a hard requirement.
