# Python SDK

Zero-dependency async Python client for Bella Baxter. Works with Flask, Django, FastAPI, and any Python application.

## Installation

```sh
pip install bella-baxter
```

## Quick Start

```python
import asyncio
from bella_baxter import BaxterClient

async def main():
    client = BaxterClient(
        baxter_url="https://your-instance.bella-baxter.io",
        api_key="bax-...",
    )
    secrets = await client.get_all_secrets()
    print(secrets["DATABASE_URL"])

asyncio.run(main())
```

## Framework Integrations

### Flask

```python
# app/__init__.py
def create_app():
    secrets = asyncio.run(client.get_all_secrets())
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
        secrets = asyncio.run(client.get_all_secrets())
        os.environ.setdefault("DATABASE_URL", secrets["DATABASE_URL"])
```

→ [Full Django sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/python/samples/04-django)

### FastAPI

```python
# main.py
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.secrets = await client.get_all_secrets()
    yield

app = FastAPI(lifespan=lifespan)
```

→ [Full FastAPI sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/python/samples/05-fastapi)

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
