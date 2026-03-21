# Self-Hosting

Run your own Bella Baxter instance on your infrastructure.

## Option 1: Docker Compose (Simplest)

The fastest way to run Bella Baxter locally or on a VPS.

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: bella_baxter
      POSTGRES_USER: bella
      POSTGRES_PASSWORD: changeme
    volumes:
      - postgres_data:/var/lib/postgresql/data

  keycloak:
    image: quay.io/keycloak/keycloak:24
    command: start-dev --import-realm
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres/keycloak
      KC_DB_USERNAME: bella
      KC_DB_PASSWORD: changeme
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: changeme
    depends_on: [postgres]
    ports:
      - "8080:8080"

  openbao:
    image: openbao/openbao:latest
    command: server -dev -dev-root-token-id=root
    ports:
      - "8200:8200"

  bella-api:
    image: ghcr.io/cosmic-chimps/bella-baxter-api:latest
    environment:
      ConnectionStrings__marten: "Host=postgres;Database=bella_baxter;Username=bella;Password=changeme"
      Keycloak__Realm: bella-baxter
      Keycloak__AuthServerUrl: http://keycloak:8080
      OpenBao__Url: http://openbao:8200
      OpenBao__RootToken: root
    depends_on: [postgres, keycloak, openbao]
    ports:
      - "5522:5522"

volumes:
  postgres_data:
```

```sh
docker compose up -d
bella config set url http://localhost:5522
bella login
```

## Option 2: .NET Aspire (Recommended for .NET Teams)

If your team uses .NET Aspire, add Bella Baxter as a self-hosted stack to your AppHost:

```csharp
// AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

// Option A: Bella owns all infrastructure
var bella = builder.AddBellaBaxter("bella");

// Option B: Bring your own Postgres and Redis
var postgres = builder.AddPostgres("pg");
var redis = builder.AddRedis("redis");
var bella = builder.AddBellaBaxter("bella", postgres: postgres, redis: redis);

builder.Build().Run();
```

See the [05-aspire-selfhosted sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/05-aspire-selfhosted) for the full setup.

## Option 3: Kubernetes

Helm chart coming soon. In the meantime, adapt the Docker Compose services into your cluster.

---

## Configuration Reference

Key environment variables for the Bella Baxter API:

| Variable | Description | Default |
|----------|-------------|---------|
| `ConnectionStrings__marten` | PostgreSQL connection string | required |
| `Keycloak__Realm` | Keycloak realm name | `bella-baxter` |
| `Keycloak__AuthServerUrl` | Keycloak base URL | required |
| `OpenBao__Url` | OpenBao/Vault URL | `http://localhost:8200` |
| `OpenBao__RootToken` | Root token (dev mode only) | — |
| `OpenBao__AppRoleRoleId` | AppRole role ID (production) | — |
| `OpenBao__AppRoleSecretId` | AppRole secret ID (production) | — |
| `DataProtection__KeyPath` | ASP.NET Data Protection key path | `/keys` |

## Production Checklist

- [ ] Use AppRole auth (not root token) for OpenBao/Vault
- [ ] Configure TLS on all services
- [ ] Set `DataProtection__KeyPath` to a persistent volume
- [ ] Enable external backups for PostgreSQL
- [ ] Configure Keycloak with your organisation's IdP (LDAP, SAML, etc.)
- [ ] Set `ASPNETCORE_ENVIRONMENT=Production`

---

## Updating

```sh
# Docker Compose
docker compose pull && docker compose up -d

# Aspire: update the NuGet package version in your AppHost .csproj
```

Database schema migrations run automatically on startup.
