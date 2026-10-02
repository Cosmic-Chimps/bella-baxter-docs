# AI Coding Agents

AI coding agents like Claude Code, Cursor or Copilot's agent mode run real commands on a
developer's machine. They start the app, call APIs to check a response, record test fixtures and
run test suites. Sooner or later that work needs secrets: OAuth credentials, API keys, client ids.

This page explains how Bella Baxter lets an agent do that work **without ever seeing, printing or
storing a secret value**. It's written from a real session: Claude Code building Frunchy, a
F#/.NET web app with Discord sign-in and MyAnimeList data. The human created every credential;
the agent used them through Bella and never handled one.

## The problem: agents leak secrets in ordinary ways

A secret an agent touches can end up in places no one reviews:

- **The conversation transcript**: a pasted key, or `cat .env`;
- **Files**: `appsettings.json`, `.env`, test fixtures that save a request's headers;
- **Commits**, once any of those files is committed;
- **Logs and shell output**: `echo $API_KEY`, a failing request printed with its headers.

The usual advice, "put it in an environment variable", leaves the agent to decide how the value
gets there. If the agent asks the human to paste it into the chat, the transcript now holds it.

## What worked

### 1. The app fetches its own secrets: `bella sdk run` + the SDK

For a long-running app, the agent doesn't pass secrets at all. The app adds Bella as a
configuration source with `BellaBaxter.AspNet.Configuration`, and the agent starts it through the
CLI:

```bash
bella sdk run -- dotnet run --launch-profile http
```

`bella sdk run` hands the process its Bella credentials. The app's own SDK then fetches the secrets.
With `__` as the section separator, `Frunchy__Auth__Providers__Discord__ClientSecret` in Bella
becomes `Frunchy:Auth:Providers:Discord:ClientSecret` in the app's configuration
(see [.NET SDK](/sdks/dotnet)).

What this gave the session:

- **No secret in any repo file**: `appsettings.json` only has non-secret settings. A test fails
  if any committed `appsettings*.json` contains a client id or secret.
- **Nothing for the agent to handle**: it never needed the values, only the command.
- **Hot reload**: the SDK polls, so a rotated Discord client secret applied on the app's next
  sign-in without a restart. The app binds its OAuth options to configuration instead of
  copying them at startup, and a test rotates a value and checks the next redirect.

### 2. One-off commands get secrets as environment variables: `bella run`

Some tasks are short: check that a newly registered API key works, or record real API responses
as test fixtures. For those, `bella run` injects the environment's secrets into a single process:

```bash
# Does the new MyAnimeList client id work? One request, and the id is never printed
bella run -- sh -c 'curl -s -o out.json -w "status %{http_code}\n" \
  -H "X-MAL-CLIENT-ID: $Frunchy__Mal__ClientId" \
  "https://api.myanimelist.net/v2/anime?q=Frieren&limit=3"'
```

To check that a secret was injected, the agent printed its **length**, never its value:

```bash
bella run -- sh -c 'echo "id injected (${#Frunchy__Mal__ClientId} chars)"'
# ✓ Loaded 4 secret(s) from Bella
# id injected (32 chars)
```

The same pattern recorded the real API responses the test suite replays. The recorder runs as an
opt-in test under `bella run`, reads the client id from the environment, and writes only response
bodies:

```bash
FRUNCHY_RECORD_MAL=1 bella run -- dotnet test --filter-method "*record the 2026 sample*"
```

Afterwards the agent searched the recorded files for the id: no match, so it was safe to commit them.

### 3. A committed `.bella` file: no flags, no guessing

```toml
org = "my-org"
project = "frunchy"
environment = "development"
url = "https://api.bella-baxter.io"
```

`bella context init` writes this file. It holds only names and the API address, no secrets, so it
can be committed. Every `bella run` and `bella sdk run` started anywhere inside the repository picks
the right project and environment without `-p` or `-e`.

### 4. The human creates credentials; the agent only uses them

The split stayed clean all session:

- **The human**: registered the Discord and MyAnimeList apps, added the values in the Bella web
  app, and ran `bella login` when the CLI's session expired.
- **The agent**: wrote the code and the commands, then told the human the **name** to use, for
  example "add the Client ID to Bella as `Frunchy__Mal__ClientId`; don't paste it here". Then it
  ran the commands.

When the human asked whether the MyAnimeList *client secret* was needed too, the agent checked the
API reference first. Only the client id was needed, so the secret was never added to the app's
environment.

### 5. Failures that tell an agent what to do

The session hit both kinds of failure, and both were easy to act on:

- **An expired CLI session**:

  ```text
  {"error":"Failed to refresh JWT token: … Run: bella login"}
  ```

  The agent knew this needed an interactive login, asked the human to run `bella login`, and
  didn't retry.
- **A missing secret**: the app was built to degrade instead of crashing. Without the client id it
  logs `MyAnimeList enrichment is off: Frunchy:Mal:ClientId is not set (Bella:
  Frunchy__Mal__ClientId, or dotnet user-secrets)` and serves pages as usual. The message names the
  exact key and where to put it.

## Rules worth giving your agent

Put these in the agent's instructions file (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`…):

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

## Gotchas from the session

- **Run Bella commands inside the project.** `bella run` finds `.bella` by walking up from the
  current directory. A command started from a scratch folder outside the repository silently got
  no project context, and its request never ran. The same command from the repository worked.
- **Precedence.** `AddBellaSecrets()` is added after appsettings and user secrets, so Bella's
  values win over both. To keep environment variables and command-line overrides on top (handy
  for a quick local override), add those sources again after Bella.
- **`bella sdk run` with an OAuth login** (not an API key) needs the project and environment.
  `.bella` provides them.
- **Shell word splitting.** Not a Bella issue, but common in agent scripts: in zsh, `for f in $files`
  doesn't split on spaces. Use `xargs` or quoted arrays.

## Why it matters

With Bella in the loop, the agent could do the work that needs credentials: start the app with
real OAuth, verify an API key, record real fixtures. The transcript, the repository, the fixtures
and the logs never held a secret value. The human kept creating and rotating credentials in one
place, and the agent never needed to be trusted with them.

See also: [MCP / AI Integration](/integrations/mcp-ai), for letting an assistant *manage* secrets
through Bella's MCP server.
