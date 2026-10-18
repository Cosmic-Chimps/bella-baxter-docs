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
- [cosign](https://docs.sigstore.dev) v3, para verificar las firmas del release
- Tres puertos: `443` (aplicación), `8444` (plano de administración), `9443` (setup)

### Verifica la descarga

Cada release va firmado. Cada imagen se referencia por digest y se firma por
digest, y el tarball lleva una firma al lado (`bella-selfhosted-<version>.tar.gz.sigstore.json`).
Verifícalo con la clave pública de Bella **antes** de descomprimirlo:

```sh
curl -fsSLO https://docs.bella-baxter.io/selfhosted/cosign.pub
cosign verify-blob --key cosign.pub --insecure-ignore-tlog=true \
  --bundle bella-selfhosted-<version>.tar.gz.sigstore.json \
  bella-selfhosted-<version>.tar.gz
```

`Verified OK` significa que el archivo está íntegro **y** que lo publicó Bella.
Cualquier otra cosa: detente, no lo descomprimas y contáctanos.

- La clave pública está en este sitio, en `https://docs.bella-baxter.io/selfhosted/cosign.pub`.
  El bundle incluye una copia, pero una copia dentro del archivo que estás
  comprobando no prueba nada hasta que el propio archivo esté comprobado.
- `--insecure-ignore-tlog=true` es lo esperado: Bella firma con una clave y sin
  registro de transparencia público, así que la verificación funciona en un host
  aislado (air-gapped). Omite la consulta al registro, no la comprobación de la firma.

No tienes que verificar las imágenes a mano: `bella.sh` ejecuta `verify-bundle.sh`
antes de arrancar nada y **se niega a arrancar** una imagen que no esté fijada por
digest o cuya firma no verifique (`./bella.sh verify` hace la misma comprobación
cuando quieras).

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

### Verificación de email en una instalación aislada (air-gapped)

El bundle no envía correo: no hay servidor de correo que puedan usar Keycloak o
Bella. Eso afecta a una sola cosa. Una invitación a una organización solo la
acepta una cuenta cuya dirección Keycloak tiene como **verificada** y que
coincide con la dirección invitada, para que nadie pueda usar un enlace de
invitación filtrado. En un plano alojado, la gente verifica su dirección con un
enlace que Keycloak le envía por correo. Aquí nadie puede, así que la consola le
dice al invitado que el **operador de la plataforma** (tú, no el administrador
de la organización, que no puede hacerlo) tiene que confirmar la dirección.

Tienes tres formas de hacerlo:

1. **Crear tú la cuenta.** Una cuenta creada con la API de operador
   (`POST /api/v1/admin/users`) se crea con la dirección ya verificada.
2. **Marcar como verificada la dirección de una cuenta existente.** En la consola
   de operador, abre **Users**, busca la cuenta y elige **Mark email as
   verified**. Ves la dirección por la que respondes, indicas un motivo y
   confirmas. Hazlo solo después de comprobar, fuera de Bella, que quien tiene la
   cuenta controla esa dirección: la cuenta podrá aceptar invitaciones a esa
   dirección en todas las organizaciones. El cambio queda en el registro de
   auditoría con tu motivo (nunca la dirección). Si la persona cambió su
   dirección entretanto, la solicitud se rechaza y vuelves a buscar.
3. **Usar un proveedor de identidad que operas tú.** Conecta tu propio
   directorio al realm de Keycloak como operador de la plataforma. Las
   direcciones que afirma se consideran de confianza. Las conexiones de inicio de
   sesión único que una organización añade por su cuenta en la consola no lo son:
   dan fe solo dentro de esa organización.

Si alguien cambia después su dirección por sí mismo, Keycloak la vuelve a marcar
como no verificada y hay que confirmarla de nuevo.

## Opción 2: .NET Aspire (desarrollo/integración)

Consume el recurso Aspire `AddBellaBaxter` publicado para incrustar un stack
de Bella Baxter en tu propio AppHost (ver `apps/sdk/dotnet/samples/05-aspire-selfhosted`).

## Opción 3: Kubernetes

Hay un chart de Helm planificado. Háblanos si Kubernetes es un requisito duro.
