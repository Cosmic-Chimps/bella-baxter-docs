# Python SDK

Zero-dependency async Python client for Bella Baxter. Works with Flask, Django, FastAPI, and any Python application.

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

secrets = client.get_all_secrets()
print(secrets["DATABASE_URL"])
```

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
    secrets = client.get_all_secrets()
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
        secrets = client.get_all_secrets()
        os.environ.setdefault("DATABASE_URL", secrets["DATABASE_URL"])
```

→ [Full Django sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/python/samples/04-django)

### FastAPI

```python
# main.py
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.secrets = await client.get_all_secrets_async()
    yield

app = FastAPI(lifespan=lifespan)
```

→ [Full FastAPI sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/python/samples/05-fastapi)

## Zero-Knowledge Encryption (ZKE)

By default the SDK generates a fresh P-256 keypair per request (ephemeral E2EE). With ZKE you supply a **persistent device key** — the server audits which host fetched each secret and the SDK caches the wrapped DEK.

**Generate your device key once:**

```sh
bella auth setup   # stores it owner-only under ~/.config/bella-cli; copy the printed PEM
```

**Use it in your app:**

```python
from bella_baxter import BaxterClient, BaxterClientOptions

client = BaxterClient(BaxterClientOptions(
    baxter_url="https://your-instance.bella-baxter.io",
    api_key="bax-...",
    # Optional — reads BELLA_BAXTER_PRIVATE_KEY env var automatically
    private_key=os.environ.get("BELLA_BAXTER_PRIVATE_KEY"),
    on_wrapped_dek_received=lambda project, env, wrapped_dek, lease_expires: (
        print(f"DEK for {project}/{env} expires {lease_expires}")
    ),
))
```

Or just set the environment variable — **Django, FastAPI, and Flask** integrations all read it automatically:

```sh
export BELLA_BAXTER_PRIVATE_KEY="$(cat ~/.bella/device-key.pem)"
```

If the variable is not set the SDK falls back to ephemeral E2EE — no behavior change.

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
