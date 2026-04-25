# Ansible Collection

The `jjchiw.bella_baxter` Ansible collection provides lookup plugins and modules to read and write Bella Baxter secrets, issue SSH certificates, and manage PKI infrastructure from your Ansible playbooks.

## Installation

```sh
pip install bella-baxter
ansible-galaxy collection install jjchiw.bella_baxter
```

**Requirements:** Ansible 2.14+, Python 3.9+.

Pin a specific version:

```sh
ansible-galaxy collection install jjchiw.bella_baxter:==0.2.0
```

## Authentication

Set credentials via environment variables (recommended) or pass them as plugin arguments:

```sh
export BELLA_BAXTER_URL=https://your-instance.bella-baxter.io
export BELLA_API_KEY=bax-...
export BELLA_PROJECT_SLUG=my-app      # optional default
export BELLA_ENV_SLUG=production      # optional default
```

Or use `ansible-vault` to store them:

```yaml
# group_vars/all/vault.yml (encrypted)
bella_baxter_url: https://your-instance.bella-baxter.io
bella_api_key: bax-...
```

## Secrets

### Lookup — `jjchiw.bella_baxter.secret`

Fetch one or more secret values in a single API call:

```yaml
- hosts: webservers
  vars:
    db_url: "{{ lookup('jjchiw.bella_baxter.secret', 'DATABASE_URL',
                baxter_url='https://your-instance.bella-baxter.io',
                api_key=bella_api_key,
                project_slug='my-app',
                environment_slug='production') }}"
    # Fetch multiple keys at once
    secrets: "{{ lookup('jjchiw.bella_baxter.secret', 'DATABASE_URL', 'REDIS_URL',
                 project_slug='my-app', environment_slug='production') }}"
```

When `BELLA_BAXTER_URL`, `BELLA_API_KEY`, `BELLA_PROJECT_SLUG`, and `BELLA_ENV_SLUG` are set, the call simplifies to:

```yaml
db_url: "{{ lookup('jjchiw.bella_baxter.secret', 'DATABASE_URL') }}"
```

### Module — `jjchiw.bella_baxter.secret`

Write or delete a secret value from a playbook:

```yaml
- name: Rotate database password
  jjchiw.bella_baxter.secret:
    key: DB_PASSWORD
    value: "{{ new_password }}"
    state: present
    baxter_url: "{{ bella_baxter_url }}"
    api_key: "{{ bella_api_key }}"
    project_slug: my-app
    environment_slug: production

- name: Remove a secret
  jjchiw.bella_baxter.secret:
    key: OLD_FEATURE_FLAG
    state: absent
```

## SSH Certificate Authority

### Lookup — `jjchiw.bella_baxter.ssh_ca_key`

Fetch the SSH CA public key to install as a trusted authority on hosts:

```yaml
- name: Trust Bella Baxter SSH CA
  authorized_key:
    user: root
    key: "{{ lookup('jjchiw.bella_baxter.ssh_ca_key',
              project_slug='my-app', environment_slug='production') }}"
    key_options: 'cert-authority'
```

### Lookup — `jjchiw.bella_baxter.ssh_sign`

Sign a host's SSH public key to produce a short-lived certificate:

```yaml
- name: Issue SSH host certificate
  copy:
    dest: /etc/ssh/ssh_host_ed25519_key-cert.pub
    content: "{{ lookup('jjchiw.bella_baxter.ssh_sign',
                 role_name='web-hosts',
                 public_key=lookup('file', '/etc/ssh/ssh_host_ed25519_key.pub'),
                 ttl='24h',
                 valid_principals='web-host',
                 project_slug='my-app',
                 environment_slug='production') }}"
```

## PKI / TLS Certificates

### Module — `jjchiw.bella_baxter.pki_role`

Idempotent: creates the role if absent, deletes it if `state=absent`:

```yaml
- name: Ensure PKI role exists
  jjchiw.bella_baxter.pki_role:
    name: web-servers
    allowed_domains: internal.example.com
    allow_subdomains: true
    max_ttl: 720h
    state: present
    baxter_url: "{{ bella_baxter_url }}"
    api_key: "{{ bella_api_key }}"
    project_slug: my-app
    environment_slug: production
```

### Lookup — `jjchiw.bella_baxter.pki_ca`

Fetch the PKI CA certificate chain (e.g. to install as a trusted CA on hosts):

```yaml
- name: Install internal CA certificate
  copy:
    dest: /usr/local/share/ca-certificates/bella-internal.crt
    content: "{{ (lookup('jjchiw.bella_baxter.pki_ca',
                  project_slug='my-app',
                  environment_slug='production')).certificate }}"
  notify: update-ca-certificates
```

Returns a dict with keys: `certificate`, `ca_chain`, `acme_directory_url`.

### Lookup — `jjchiw.bella_baxter.pki_issue`

Issue a short-lived TLS certificate for a service:

```yaml
- name: Issue TLS certificate
  vars:
    tls: "{{ lookup('jjchiw.bella_baxter.pki_issue',
              role_name='web-servers',
              common_name='api.internal.example.com',
              alt_names='api.internal.example.com',
              ttl='720h',
              project_slug='my-app',
              environment_slug='production') }}"
  copy:
    dest: /etc/ssl/private/api.key
    content: "{{ tls.private_key }}"
    mode: '0600'

- copy:
    dest: /etc/ssl/certs/api.crt
    content: "{{ tls.certificate }}"
```

Returns a dict with keys: `certificate`, `private_key`, `ca_chain`, `serial_number`, `expiration`.

## Examples

→ [Full Ansible examples](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/ansible/examples)
