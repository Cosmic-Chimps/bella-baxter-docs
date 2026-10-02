# Agentes de programación con IA

> 🌐 **English version**: [AI Coding Agents](/integrations/ai-coding-agents)

Los agentes de programación con IA, como Claude Code, Cursor o el modo agente de Copilot, ejecutan
comandos reales en la máquina del desarrollador. Arrancan la app, llaman a APIs para comprobar una
respuesta, graban fixtures de tests y ejecutan los tests. Tarde o temprano ese trabajo necesita
secretos: credenciales OAuth, API keys, client ids.

Esta página explica cómo Bella Baxter permite que un agente haga ese trabajo **sin ver, imprimir ni
guardar nunca el valor de un secreto**. Sale de una sesión real: Claude Code construyendo Frunchy,
una app web en F#/.NET con inicio de sesión de Discord y datos de MyAnimeList. La persona creó todas
las credenciales; el agente las usó a través de Bella y nunca tocó ninguna.

## El problema: los agentes filtran secretos de formas cotidianas

Un secreto que pasa por las manos de un agente puede acabar en sitios que nadie revisa:

- **La transcripción de la conversación**: una clave pegada, o `cat .env`;
- **Archivos**: `appsettings.json`, `.env`, fixtures de test que guardan las cabeceras de la petición;
- **Commits**, en cuanto se commitea cualquiera de esos archivos;
- **Logs y salida de la terminal**: `echo $API_KEY`, una petición fallida impresa con sus cabeceras.

El consejo habitual, "ponlo en una variable de entorno", deja que el agente decida cómo llega el
valor hasta ahí. Si el agente pide a la persona que lo pegue en el chat, la transcripción ya lo
contiene.

## Lo que funcionó

### 1. La app obtiene sus propios secretos: `bella sdk run` + el SDK

En una app de larga duración, el agente no pasa ningún secreto. La app añade Bella como fuente de
configuración con `BellaBaxter.AspNet.Configuration`, y el agente la arranca a través de la CLI:

```bash
bella sdk run -- dotnet run --launch-profile http
```

`bella sdk run` entrega al proceso sus credenciales de Bella, y el propio SDK de la app obtiene los
secretos. Con `__` como separador de secciones, `Frunchy__Auth__Providers__Discord__ClientSecret` en
Bella se convierte en `Frunchy:Auth:Providers:Discord:ClientSecret` en la configuración de la app
(ver [SDK de .NET](/sdks/dotnet)).

Lo que aportó a la sesión:

- **Ningún secreto en archivos del repo**: `appsettings.json` solo tiene ajustes que no son
  secretos. Un test falla si algún `appsettings*.json` commiteado contiene un client id o un secreto.
- **Nada que el agente tuviera que manejar**: nunca necesitó los valores, solo el comando.
- **Recarga en caliente**: el SDK hace polling, así que un client secret de Discord rotado se aplicó
  en el siguiente inicio de sesión sin reiniciar. La app enlaza sus opciones de OAuth a la
  configuración en lugar de copiarlas al arrancar, y un test rota un valor y comprueba la siguiente
  redirección.

### 2. Los comandos puntuales reciben los secretos como variables de entorno: `bella run`

Algunas tareas son cortas: comprobar que una API key recién registrada funciona, o grabar
respuestas reales de una API como fixtures. Para eso, `bella run` inyecta los secretos del entorno
en un solo proceso:

```bash
# ¿Funciona el nuevo client id de MyAnimeList? Una petición, y el id no se imprime nunca
bella run -- sh -c 'curl -s -o out.json -w "status %{http_code}\n" \
  -H "X-MAL-CLIENT-ID: $Frunchy__Mal__ClientId" \
  "https://api.myanimelist.net/v2/anime?q=Frieren&limit=3"'
```

Para comprobar que un secreto se había inyectado, el agente imprimió su **longitud**, nunca su valor:

```bash
bella run -- sh -c 'echo "id injected (${#Frunchy__Mal__ClientId} chars)"'
# ✓ Loaded 4 secret(s) from Bella
# id injected (32 chars)
```

El mismo patrón grabó las respuestas reales que reproducen los tests. La grabación es un test
opcional que se ejecuta con `bella run`, lee el client id del entorno y solo escribe los cuerpos de
las respuestas:

```bash
FRUNCHY_RECORD_MAL=1 bella run -- dotnet test --filter-method "*record the 2026 sample*"
```

Después, el agente buscó el id en los archivos grabados: ninguna coincidencia, así que se podían
commitear.

### 3. Un archivo `.bella` commiteado: sin flags y sin adivinar

```toml
org = "my-org"
project = "frunchy"
environment = "development"
url = "https://api.bella-baxter.io"
```

`bella context init` escribe este archivo. Solo contiene nombres y la dirección de la API, ningún
secreto, así que se puede commitear. Cualquier `bella run` o `bella sdk run` lanzado dentro del
repositorio usa el proyecto y el entorno correctos sin `-p` ni `-e`.

### 4. La persona crea las credenciales; el agente solo las usa

La separación se mantuvo limpia toda la sesión:

- **La persona**: registró las apps de Discord y MyAnimeList, añadió los valores en la web de
  Bella y ejecutó `bella login` cuando caducó la sesión de la CLI.
- **El agente**: escribió el código y los comandos, y le dijo a la persona el **nombre** que debía
  usar, por ejemplo "añade el Client ID en Bella como `Frunchy__Mal__ClientId`; no lo pegues
  aquí". Luego ejecutó los comandos.

Cuando la persona preguntó si también hacía falta el *client secret* de MyAnimeList, el agente
consultó antes la referencia de la API. Solo hacía falta el client id, así que el secreto nunca se
añadió al entorno de la app.

### 5. Fallos que le dicen al agente qué hacer

La sesión se encontró con los dos tipos de fallo, y los dos fueron fáciles de resolver:

- **Una sesión de la CLI caducada**:

  ```text
  {"error":"Failed to refresh JWT token: … Run: bella login"}
  ```

  El agente supo que hacía falta un login interactivo, pidió a la persona que ejecutara
  `bella login` y no volvió a intentarlo.
- **Un secreto que falta**: la app estaba hecha para degradarse en vez de caerse. Sin el client id
  registra `MyAnimeList enrichment is off: Frunchy:Mal:ClientId is not set (Bella:
  Frunchy__Mal__ClientId, or dotnet user-secrets)` y sirve las páginas con normalidad. El mensaje
  nombra la clave exacta y dónde ponerla.

## Reglas que vale la pena darle a tu agente

Ponlas en el archivo de instrucciones del agente (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`…):

```markdown
## Secrets
- Secrets live in Bella Baxter (project and environment in `.bella`). Never in the repo, never in
  appsettings or .env files, never in the chat.
- Run the app with `bella sdk run -- <command>`; run one-off scripts with `bella run -- <command>`.
- Never print a secret. To check one is present, print its length: `${#NAME}`.
- If a new secret is needed, tell the human its name (e.g. `Service__ApiKey`) and let them add it.
- If the CLI says `Run: bella login`, ask the human to run it; it's interactive.
- Before committing recorded fixtures or logs, search them for the secret's value.
```

## Trampas encontradas en la sesión

- **Ejecuta los comandos de Bella dentro del proyecto.** `bella run` encuentra `.bella` subiendo
  desde el directorio actual. Un comando lanzado desde una carpeta temporal fuera del repositorio
  se quedó sin contexto de proyecto sin avisar, y su petición nunca se ejecutó. El mismo comando
  desde el repositorio funcionó.
- **Precedencia.** `AddBellaSecrets()` se añade después de appsettings y de user secrets, así que
  los valores de Bella ganan a ambos. Para que las variables de entorno y los argumentos de línea
  de comandos sigan por encima (útil para un cambio local rápido), vuelve a añadir esas fuentes
  después de Bella.
- **`bella sdk run` con login OAuth** (no con API key) necesita el proyecto y el entorno; `.bella`
  los proporciona.
- **Separación de palabras en la shell.** No es cosa de Bella, pero es habitual en los scripts de
  los agentes: en zsh, `for f in $files` no separa por espacios. Usa `xargs` o arrays entre comillas.

## Por qué importa

Con Bella de por medio, el agente pudo hacer el trabajo que necesita credenciales: arrancar la app
con OAuth real, verificar una API key y grabar fixtures reales. La transcripción, el repositorio,
los fixtures y los logs nunca contuvieron el valor de un secreto. La persona siguió creando y
rotando credenciales en un único sitio, y nunca hubo que confiarle esos valores al agente.

Ver también: [MCP / IA](/es/integrations/mcp-ai), para que un asistente *gestione* secretos a
través del servidor MCP de Bella.
