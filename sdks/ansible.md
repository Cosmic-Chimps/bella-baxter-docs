# Ansible Collection

The `cosmic_chimps.bella` Ansible collection provides lookup plugins and modules to inject Bella Baxter secrets into your Ansible playbooks.

## Installation

```sh
ansible-galaxy collection install cosmic_chimps.bella
```

Pin a specific version:

```sh
ansible-galaxy collection install cosmic_chimps.bella:==0.1.0
```

**Requirements:** Ansible 2.14+, Python 3.9+, and the `bella-baxter` Python SDK:

```sh
pip install bella-baxter
```

## Quick Start — Lookup Plugin

```yaml
# playbook.yml
- hosts: webservers
  vars:
    db_url: "{{ lookup('cosmic_chimps.bella.secret', 'DATABASE_URL') }}"
  tasks:
    - name: Configure database
      template:
        src: database.conf.j2
        dest: /etc/myapp/database.conf
```

## Authentication

Set credentials via environment variables or Ansible vault:

```sh
export BELLA_BAXTER_URL=https://your-instance.bella-baxter.io
export BELLA_BAXTER_API_KEY=bax-...
```

Or use `ansible-vault` to store them:

```yaml
# group_vars/all/vault.yml (encrypted)
bella_baxter_url: https://your-instance.bella-baxter.io
bella_baxter_api_key: bax-...
```

## Lookup Plugin Options

```yaml
# Lookup a single secret
db_pass: "{{ lookup('cosmic_chimps.bella.secret', 'DB_PASSWORD') }}"

# Lookup all secrets as a dict
all_secrets: "{{ lookup('cosmic_chimps.bella.secrets', 'all') }}"
```

## Module: `bella_secret`

Set a secret value in Bella Baxter from a playbook:

```yaml
- name: Rotate database password
  cosmic_chimps.bella.bella_secret:
    key: DB_PASSWORD
    value: "{{ new_password }}"
    state: present
```

## Examples

→ [Full Ansible examples](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/ansible/examples)
