# Inici ràpid

Obtén el teu primer secret en menys de 5 minuts.

## 1. Instal·lar la CLI

::: code-group

```sh [Linux / macOS]
curl -sSfL https://github.com/Cosmic-Chimps/bella-baxter-cli/releases/latest/download/install-bella.sh | bash
```

```powershell [Windows (PowerShell)]
irm https://github.com/Cosmic-Chimps/bella-baxter-cli/releases/latest/download/install-bella.ps1 | iex
```

:::

Verifica la instal·lació:

```sh
bella --version
```

## 2. Iniciar la sessió

```sh
bella login
```

Això obre el navegador per a l'autenticació segura a través del proveïdor d'identitat de la teva organització (Keycloak, Google, GitHub o qualsevol SSO). La CLI emmagatzema localment un token de curta durada — mai no es desa cap contrasenya al disc.

## 3. Seleccionar el teu context

Executa la configuració interactiva al directori del teu projecte per triar un projecte i un entorn:

```sh
bella context init
```

Això crea un fitxer `.bella` que fixa el projecte/entorn per a aquest directori. També pots fer servir la drecera `bella init`.

O estableix el context de manera no interactiva amb una API key:

```sh
export BELLA_BAXTER_URL=https://tu-instancia.bella-baxter.io
export BELLA_BAXTER_API_KEY=bax-...
```

## 4. Obtenir secrets

```sh
# Escriure els secrets a .env al directori actual
bella pull

# O injectar-los en un procés en execució — sense escriure cap fitxer
bella run -- npm start
bella sdk run -- python manage.py runserver
```

---

## I ara què?

- [Conceptes clau](/ca/getting-started/concepts) — entén els projectes, els entorns, els proveïdors i els secrets
- [Referència de la CLI](/ca/cli/) — totes les ordres amb exemples
- [Documentació dels SDKs](/ca/sdks/) — fes servir els secrets directament al codi de la teva aplicació
- [Autenticació sense credencials](/features/keyless) — sense API keys per a CI/CD
