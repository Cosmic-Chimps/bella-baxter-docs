# SSH Certificate Authority

Bella integrates with the [Vault SSH Secrets Engine](https://developer.hashicorp.com/vault/docs/secrets/ssh/signed-ssh-certificates) to issue short-lived SSH certificates. No more distributing SSH keys — developers sign their public key and get a certificate that expires in hours.

## How It Works

```
Admin sets up CA
  → bella ssh configure -p myproject -e prod
  → Vault creates CA keypair

Admin adds servers to trust the CA
  → bella ssh ca-key -p myproject -e prod
  → paste into /etc/ssh/sshd_config → TrustedUserCAKeys

Developer signs their key
  → bella ssh sign --role ops -e prod
  → gets ~/.ssh/id_ed25519-cert.pub (e.g. 1h TTL)

Developer connects
  → ssh ec2-user@10.0.0.5  (cert auto-presented)
  → or: bella ssh connect ec2-user@10.0.0.5 --role ops
```

## Admin Setup

### 1. Configure the SSH CA

```sh
bella ssh configure -p myproject -e prod
```

This enables the Vault SSH secrets engine for the environment and generates a CA keypair.

### 2. Create a Signing Role

```sh
bella ssh roles create \
  --name ops \
  --allowed-users "ec2-user,ubuntu,admin" \
  --ttl 1h \
  -p myproject -e prod
```

### 3. Configure Servers to Trust the CA

```sh
# Get the CA public key
bella ssh ca-key -p myproject -e prod
```

On each server, add to `/etc/ssh/sshd_config`:

```
TrustedUserCAKeys /etc/ssh/trusted-user-ca-keys.pem
```

Paste the public key into `/etc/ssh/trusted-user-ca-keys.pem`, then:

```sh
sudo systemctl reload sshd
```

## Developer Workflow

```sh
# Sign your default public key (~/.ssh/id_ed25519.pub)
bella ssh sign --role ops -e prod

# Sign and connect in one step
bella ssh connect ec2-user@10.0.0.5 --role ops -e prod

# Sign with a specific TTL or key
bella ssh sign --role ops --ttl 4h --key ~/.ssh/id_rsa.pub
```

The signed certificate is written to `~/.ssh/id_ed25519-cert.pub` and reused for 30 minutes before requesting a new one (so `bella ssh connect` is fast after the first use).

## Commands

| Command | Description |
|---------|-------------|
| `bella ssh configure` | Enable and configure SSH CA in Vault |
| `bella ssh ca-key` | Print CA public key for server `TrustedUserCAKeys` |
| `bella ssh roles list` | List available signing roles |
| `bella ssh roles create` | Create a signing role |
| `bella ssh roles delete` | Delete a signing role |
| `bella ssh sign` | Sign your SSH public key (get cert) |
| `bella ssh connect <user@host>` | Sign (or reuse cert) + SSH in one step |

All commands accept `-p/--project` and `-e/--environment`. Defaults read from `.bella`.

## Security Notes

- Certificates expire automatically — a stolen cert is useless after the TTL
- All sign operations are logged in the Bella audit log
- Certificates are user-specific — `ec2-user` can't impersonate `ubuntu`
- Revocation happens by rotating the CA keypair (all existing certs immediately invalid)
