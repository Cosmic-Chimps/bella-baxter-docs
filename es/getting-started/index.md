# Inicio Rápido

Obtén tu primer secreto en menos de 5 minutos.

## 1. Instalar la CLI

::: code-group

```sh [Linux / macOS]
curl -sSfL https://raw.githubusercontent.com/cosmic-chimps/bella-baxter/main/scripts/install-bella.sh | sh
```

```powershell [Windows (PowerShell)]
iwr https://install.bella-baxter.io/windows | iex
```

:::

Verifica la instalación:

```sh
bella --version
```

## 2. Iniciar Sesión

```sh
bella login
```

Esto abre tu navegador para la autenticación segura a través del proveedor de identidad de tu organización (Keycloak, Google, GitHub o cualquier SSO). La CLI almacena un token de corta duración localmente — nunca se guarda ninguna contraseña en disco.

## 3. Seleccionar tu Contexto

Después del inicio de sesión, Bella muestra los proyectos y entornos a los que tienes acceso:

```sh
bella context list
bella context use mi-proyecto/dev
```

O establece el contexto de forma no interactiva usando una clave API:

```sh
export BELLA_BAXTER_URL=https://tu-instancia.bella-baxter.io
export BELLA_BAXTER_API_KEY=bax-...
```

## 4. Obtener Secretos

```sh
# Escribir secretos en .env en el directorio actual
bella pull

# O inyectar en un proceso en ejecución — sin archivo escrito
bella run -- npm start
bella exec -- python manage.py runserver
```

---

## ¿Qué sigue?

- [Conceptos Clave](/es/getting-started/concepts) — entiende proyectos, entornos, proveedores y secretos
- [Referencia CLI](/es/cli/) — todos los comandos con ejemplos
- [Documentación de SDKs](/es/sdks/) — usa secretos directamente en el código de tu aplicación
- [Autenticación sin credenciales](/features/keyless) — sin claves API para CI/CD
