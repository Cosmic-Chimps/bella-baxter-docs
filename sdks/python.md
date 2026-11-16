# Python SDK

Python client for Bella Baxter, built on `httpx`, `cryptography` and the Kiota client libraries. Requires Python 3.10+. Works with Flask, Django, FastAPI, and any Python application.

## Installation

```sh
pip install --pre bella-baxter
```

> **Why `--pre`.** The SDK ships as `0.1.1-preview.N`, which PEP 440 normalises to `0.1.1rcN` — a
> pre-release. `pip` skips pre-releases unless asked, so omitting `--pre` resolves *no version at
> all* rather than installing an older one. Every release on PyPI is
> currently a pre-release, so `--pre` is the contract until a stable `0.1.x` ships. (npm is
> unaffected: its `latest` dist-tag points at the preview and `npm install` honours it regardless.)

## Quick Start

```python
from bella_baxter import BaxterClient, BaxterClientOptions

client = BaxterClient(BaxterClientOptions(
    baxter_url="https://your-instance.bella-baxter.io",
    api_key="bax-...",
))

response = client.get_all_secrets()
print(response.secrets["DATABASE_URL"])
```

`get_all_secrets()` returns a dataclass. The values are in `.secrets`, a `dict[str, str]`. The project and environment default to the ones your API key is scoped to. You can pass `project_slug` and `env_slug` to choose others.

All methods are **synchronous** by default. Async variants (e.g. `get_all_secrets_async()`) are available for use inside async frameworks.

## Writing and deleting secrets

```python
# Create or update one secret (an upsert). `provider` is the provider's slug or UUID and is required.
client.set_secret("RDS_PASSWORD", "s3cr3t", provider="vault-main", description="rotated by CI")

# Delete one. Returns True when it was deleted, False when it was already absent (404).
client.delete_secret("OLD_KEY", provider="vault-main")
```

- `project_slug` and `env_slug` are optional keyword arguments; they default to the API key's own project and
  environment. Environments are addressed by **slug**, never by UUID.
- Everything after `key`/`value` is keyword-only, so a provider can never be passed where a project was meant.
- Writing needs a **Manager** API key or higher. A Consumer key is read-only and the API answers 403.
- A scope-limited key gets 404 from the update when the key does not exist yet; `set_secret` then creates it
  (which also stamps the key's scopes on it), as `bella secrets set` does. Any other error raises.
- Async variants: `set_secret_async()` and `delete_secret_async()`.

## Framework Integrations

### Flask

```python
# app/__init__.py
def create_app():
    secrets = client.get_all_secrets().secrets
    app = Flask(__name__)
    app.config["DATABASE_URL"] = secrets["DATABASE_URL"]
    return app
```

→ [Full Flask sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/python/samples/03-flask)

### Django

```python
# apps.py
class MyAppConfig(AppConfig):
    def ready(self):
        secrets = client.get_all_secrets().secrets
        os.environ.setdefault("DATABASE_URL", secrets["DATABASE_URL"])
```

→ [Full Django sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/python/samples/04-django)

### FastAPI

```python
# main.py
@asynccontextmanager
async def lifespan(app: FastAPI):
    response = await client.get_all_secrets_async()
    app.state.secrets = response.secrets
    yield

app = FastAPI(lifespan=lifespan)
```

→ [Full FastAPI sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/python/samples/05-fastapi)

## Zero-Knowledge Encryption (ZKE)

By default the SDK generates a fresh P-256 keypair per request (ephemeral E2EE). With ZKE the app presents a **persistent device key**. The server audits which host fetched each secret. The SDK passes the wrapped DEK it receives to your `on_wrapped_dek_received` callback, so you can cache it.

**Create a device key once, on each machine:**

```sh
bella auth setup
```

This creates a P-256 key on the machine, stores it encrypted under `~/.config/bella-cli`, and registers the public half with Bella. It prints the device's fingerprint, not the key. The private key stays on the machine.

**Run your app under `bella sdk run`:**

```sh
bella sdk run -- python app.py
```

`bella sdk run` sets `BELLA_BAXTER_PRIVATE_KEY` in the process it starts, and the SDK reads that variable. You need no code change. If you sign in with an API key (`bax-...`), the CLI sets it only when the server confirms that this machine's device is the one recorded against the key.

To receive the wrapped DEK, add a callback. `private_key` takes the key as PEM; when it is not set, the SDK reads `BELLA_BAXTER_PRIVATE_KEY`:

```python
import os
from bella_baxter import BaxterClient, BaxterClientOptions

client = BaxterClient(BaxterClientOptions(
    baxter_url="https://your-instance.bella-baxter.io",
    api_key="bax-...",
    private_key=os.environ.get("BELLA_BAXTER_PRIVATE_KEY"),
    on_wrapped_dek_received=lambda project, env, wrapped_dek, lease_expires: (
        print(f"DEK for {project}/{env} expires {lease_expires}")
    ),
))
```

If no device key is set, the SDK uses ephemeral E2EE.

## Typed Secrets

```sh
bella secrets generate python
```

Generates a typed `AppSecrets` dataclass. Catch missing secrets at startup, not at runtime.

## All Samples

| Sample | Pattern | Link |
|--------|---------|------|
| `01-dotenv-file` | `bella pull` → python-dotenv | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/python/samples/01-dotenv-file) |
| `02-process-inject` | `bella run -- python app.py` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/python/samples/02-process-inject) |
| `03-flask` | SDK in app factory | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/python/samples/03-flask) |
| `04-django` | SDK in AppConfig.ready() | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/python/samples/04-django) |
| `05-fastapi` | SDK in lifespan | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/python/samples/05-fastapi) |
| `06-typed-secrets` | Generated AppSecrets dataclass | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/python/samples/06-typed-secrets) |
