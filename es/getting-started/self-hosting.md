# Auto-alojamiento (Self-Hosting)

Ejecuta tu propia instancia de Bella Baxter en tu infraestructura. Direcciónala
como funcione tu red — un nombre DNS con tu propio certificado, o (totalmente
soportado, sin prerequisitos) una IP o un nombre de `/etc/hosts`, sin DNS
público y sin salida a internet tras la descarga inicial de imágenes.

## El bundle self-hosted (recomendado)

Cada release publica un `bella-selfhosted-<version>.tar.gz` con un
`docker-compose.yaml` generado, una plantilla `.env.template` y un único script
`bella.sh`. El bundle se genera directamente del modelo Aspire de la
plataforma, así que nunca puede divergir de la topología real.

### Requisitos

- Un host Linux con Docker Engine + el plugin `docker compose`
- Credenciales del registro de contenedores de Bella Baxter (incluidas con tu licencia)
- Tres puertos: `443` (aplicación), `8444` (plano de administración), `9443` (setup)

### Instalación

```sh
tar -xzf bella-selfhosted-<version>.tar.gz
cd bella-selfhosted-<version>
./bella.sh up
```

`up` arranca el plano de infraestructura (PostgreSQL, Redis, dos vaults
OpenBao, Keycloak) y el **asistente de configuración**, e imprime la URL del
asistente y un token de un solo uso.

El asistente automatiza todo lo que antes era un runbook manual:

1. **TLS** — trae tu propio certificado (coloca `server.crt`/`server.key` en
   `bella-config/pki/`; el asistente lo verifica y lo usa tal cual), o deja
   que el asistente emita una CA interna y un certificado con tu IP/hostname
   en el SAN — instalas `ca.crt` una vez en cada máquina cliente.
2. **Inicialización de vaults** — inicializa el vault de sellado (Shamir) y el
   principal (auto-unseal por transit), mostrando cada kit de recuperación
   **exactamente una vez**.
3. **Aprovisionamiento** — políticas, AppRoles y credenciales de servicio,
   verificadas con login real antes de continuar.
4. **Identidad** — el realm de Keycloak, clientes, roles, TOTP y tu cuenta de
   operador inicial.

Al terminar el asistente:

```sh
./bella.sh apply     # arranca el plano de aplicación
```

y abre `https://<tu-ip>`.

### Tras un reinicio del host

El vault de sellado se vuelve a sellar en cada reinicio, por diseño. Abre la
URL del asistente, entra con el token de operaciones y pega 2 de tus 3 claves
de unseal — el vault principal se abre solo vía transit y la plataforma se
recupera automáticamente.

```sh
./bella.sh unseal    # imprime la URL + token si los perdiste de vista
```

## Opción 2: .NET Aspire (desarrollo/integración)

Consume el recurso Aspire `AddBellaBaxter` publicado para incrustar un stack
de Bella Baxter en tu propio AppHost (ver `apps/sdk/dotnet/samples/05-aspire-selfhosted`).

## Opción 3: Kubernetes

Hay un chart de Helm planificado. Háblanos si Kubernetes es un requisito duro.
