# Referencia CLI

> 🌐 **English version**: [CLI Reference](/cli/)

La traducción completa de la referencia CLI está en progreso. Mientras tanto, consulta la versión en inglés.

La CLI de Bella Baxter proporciona todos los comandos necesarios para gestionar secretos, proyectos, entornos y más desde tu terminal.

## Instalación

```sh
curl -sSfL https://github.com/Cosmic-Chimps/bella-baxter-cli/releases/latest/download/install-bella.sh | bash
```

El instalador se publica con cada release. Verifica la firma GPG del `checksums.txt` de la release con
la clave de firma de Cosmic Chimps que lleva incorporada (huella
`65BB 8D3C EEE3 DD9E 4FFD  22B4 119F 114C A309 C2FA`) y después el SHA-256 del binario, y **aborta** si
no puede completar cualquiera de las dos comprobaciones, así que necesitas `gpg` instalado. Para fijar
una versión, descarga el instalador de esa release:
`https://github.com/Cosmic-Chimps/bella-baxter-cli/releases/download/v1.2.3/install-bella.sh`.
Solo para un espejo sin conexión que no pueda llevar la firma, `BELLA_INSECURE_SKIP_SIGNATURE=1` instala
comprobando únicamente el checksum.

## Qué URL de servidor usar

La CLI habla con un solo servidor: el origen de la **API** de Bella Baxter. Fíjalo una vez con
`bella config set-server <url>` o con `BELLA_BAXTER_URL`:

| Instalación | URL del servidor |
|-------------|------------------|
| Servicio alojado | `https://api.bella-baxter.io`, el valor por defecto, así que no hay que fijar nada |
| Autoalojada con nombres de host separados | el nombre de host de la **API** (`api.<dominio>`), no el de la pasarela de la consola (`gw.<dominio>`) |
| Paquete autoalojado | `https://<tu-dirección>`, la única dirección que sirve |

En una instalación con nombres de host separados, la consola habla con una pasarela que además da acceso a la
rotación de certificados y a Scout. Esa pasarela solo reenvía `/api/**`, y `bella mcp` y el conector MCP usan
`/mcp`, así que deja la CLI en el nombre de host de la API. Todos los comandos actuales de la CLI se sirven ahí.

## Comandos Principales

| Comando | Descripción |
|---------|-------------|
| `bella login` | Iniciar sesión |
| `bella whoami` | Ver usuario y org activa |
| `bella org current` | Ver org activa |
| `bella org list` | Listar todas tus organizaciones |
| `bella org switch <slug>` | Cambiar de organización |
| `bella pull` | Escribir secretos en `.env` |
| `bella run -- <cmd>` | Ejecutar proceso con secretos inyectados |
| `bella sdk run -- <cmd>` | Similar a run (sin gestión de ciclo de vida) |
| `bella secrets drift` | Matriz de presencia de claves entre entornos (CI gate) |
| `bella secrets scan` | Escanear código fuente en busca de referencias a claves de secretos (CI gate) |
| `bella usage` | Ver uso de API y estado de facturación del mes actual |
| `bella context use <project/env>` | Cambiar contexto activo |

## Identidad de carga de trabajo (sin claves)

En GitHub Actions (con `id-token: write`) o Kubernetes, `bella run`, `bella sdk run`, `bella exec` y `bella auth oidc` intercambian el token OIDC de la plataforma por una clave Bella de corta duración. El intercambio necesita el tenant, el proyecto y el entorno: `-t`/`--tenant`, `-p`/`--project` y `-e`/`--env` (o `BELLA_BAXTER_TENANT`, `BELLA_BAXTER_PROJECT` y `BELLA_BAXTER_ENV`, o un archivo `.bella`):

```sh
bella run -t mi-org -p mi-api -e production -- ./deploy.sh
```

Cada valor se resuelve por separado: el flag gana a la variable de entorno, y esta al `.bella`, y un flag nunca cambia los otros dos. Si todavía falta alguno, el comando se detiene antes de contactar a Bella y nombra el que falta (por ejemplo "missing: environment", junto con `--env <slug>`, `BELLA_BAXTER_ENV` o la clave `environment` de `.bella` para indicarlo) en lugar de decir "Not logged in". Si el runner tiene además una sesión guardada con `bella login`, sigue usándola.

## Organizaciones (Multi-Org)

Si perteneces a más de una organización, puedes cambiar entre ellas sin cerrar sesión:

```sh
bella org list               # listar organizaciones
bella org switch acme-corp   # cambiar a otra org
```

Después de cambiar, ejecuta `bella context init` para actualizar tu archivo `.bella` con el nuevo contexto de org.

## Uso y Facturación

```sh
bella usage          # ver uso de API y estado de facturación del mes actual
bella usage --json   # salida JSON para scripts
```

Muestra el plan activo, las solicitudes utilizadas frente a la cuota gratuita mensual, el coste estimado de los excesos y el estado de la suscripción.

[→ Ver referencia completa en inglés](/cli/)
