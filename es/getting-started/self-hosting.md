# Auto-alojamiento

> 🌐 **English version**: [Self-Hosting](/getting-started/self-hosting)

Ejecuta tu propia instancia de Bella Baxter.

## Opción A: Docker Compose (Recomendado)

La forma más rápida de levantar Bella Baxter con todas sus dependencias:

```sh
curl -sSfL https://raw.githubusercontent.com/cosmic-chimps/bella-baxter/main/infra/docker/docker-compose.yml -o docker-compose.yml
docker compose up -d
```

Esto levanta:
- **Baxter API** — la API REST en el puerto 5522
- **PostgreSQL** — almacenamiento de estado del evento
- **Redis** — caché / publicación/suscripción
- **Keycloak** — proveedor de identidad
- **OpenBao** — proveedor de secretos del sistema

Después de unos segundos, accede a `http://localhost:5522/scalar/v1` para ver la documentación de la API.

### Variables de Entorno

| Variable | Por Defecto | Descripción |
|----------|-------------|-------------|
| `POSTGRES_PASSWORD` | `bella` | Contraseña de la base de datos |
| `KEYCLOAK_ADMIN_PASSWORD` | `admin` | Contraseña del admin de Keycloak |
| `BELLA_ADMIN_EMAIL` | `admin@example.com` | Correo del admin inicial |
| `BELLA_ADMIN_PASSWORD` | `changeme` | Contraseña del admin inicial |
| `OPENBAO_ROOT_TOKEN` | auto | Token raíz de OpenBao (generado en el primer inicio) |

Cambia siempre los valores de contraseña por defecto en producción.

---

## Opción B: .NET Aspire

Si ya usas .NET Aspire, agrega Bella Baxter a tu AppHost:

```csharp
// AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

// Opción 1: Bella Baxter gestionado por Aspire (Bella gestiona sus propias dependencias)
builder.AddBellaBaxter("secrets");

// Opción 2: Pasa tus propios recursos Postgres + Redis
var postgres = builder.AddPostgres("postgres");
var redis = builder.AddRedis("redis");

builder.AddBellaBaxter("secrets")
    .WithExternalPostgres(postgres)
    .WithExternalRedis(redis);

builder.Build().Run();
```

Consulta el [ejemplo completo de Aspire](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/05-aspire-self-hosted) para ver el ejemplo completo.

---

## Configuración de Producción

Para despliegues de producción, asegúrate de:

1. **Configurar un proveedor de identidad externo** (Keycloak, Okta, Auth0) — el Keycloak incluido es solo para desarrollo
2. **Usar una base de datos PostgreSQL gestionada** — no el contenedor incluido
3. **Configurar Redis con AOF habilitado** — para durabilidad
4. **Configurar HTTPS** — usa un reverse proxy (Caddy, nginx, Traefik)
5. **Cambiar todas las contraseñas por defecto**

Para guías de despliegue en Kubernetes y otras plataformas, consulta el [repositorio de infraestructura](https://github.com/cosmic-chimps/bella-baxter/tree/main/infra).
