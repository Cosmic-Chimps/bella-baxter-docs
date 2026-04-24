# .NET SDK

`BellaBaxter.AspNet.Configuration` provides first-class integration with ASP.NET Core, .NET Aspire, and the .NET hosting model.

## Installation

For ASP.NET Core / configuration API:

```sh
dotnet add package BellaBaxter.AspNet.Configuration
```

For .NET Aspire:

```sh
dotnet add package BellaBaxter.Aspire.Configuration
```

For the source generator (typed secrets):

```sh
dotnet add package BellaBaxter.SourceGenerator
```

## Quick Start (ASP.NET Core)

```csharp
// Program.cs
builder.Configuration.AddBellaSecrets(o =>
{
    o.BaxterUrl      = "https://your-instance.bella-baxter.io";
    o.ApiKey         = "bax-...";
    o.ProjectSlug    = "my-project";
    o.EnvironmentSlug = "production";
});

// Secrets are available through IConfiguration / IOptions<T> like any other config source
var dbUrl = builder.Configuration["DATABASE_URL"];
```

Or configure from `appsettings.json` — no code needed:

```json
{
  "BellaBaxter": {
    "BaxterUrl": "https://your-instance.bella-baxter.io",
    "ApiKey": "bax-...",
    "ProjectSlug": "my-project",
    "EnvironmentSlug": "production"
  }
}
```

```csharp
// appsettings.json section is read automatically
builder.Configuration.AddBellaSecrets();
```

→ [Full ASP.NET Core sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/03-aspnet)

## `bella exec` (Zero-Config)

The simplest approach — no code changes at all:

```sh
bella exec -- dotnet run
```

`bella exec` injects `BELLA_BAXTER_URL`, `BELLA_BAXTER_API_KEY`, and all your secrets directly into the process environment. `AddBellaSecrets()` auto-reads the injected env vars.

## .NET Aspire Integration

Connect an existing Bella Baxter instance to your Aspire AppHost:

```csharp
// AppHost/Program.cs
var baxter = builder.AddBaxter("baxter"); // reads BELLA_BAXTER_URL + BELLA_BAXTER_API_KEY

var api = builder.AddProject<Projects.MyApi>("api")
    .WithReference(baxter);  // injects URL + API key into the service
```

→ [Full Aspire sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/04-aspire)

## .NET Aspire — Self-Hosted Stack

Run the full Bella Baxter stack inside your Aspire AppHost:

```csharp
// AppHost/Program.cs
var bella = builder.AddBellaBaxter("bella");

var api = builder.AddProject<Projects.MyApi>("api")
    .WithBellaSecrets(bella);
```

→ [Full self-hosted Aspire sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/05-aspire-selfhosted)

## Zero-Knowledge Encryption (ZKE)

By default each poll generates a fresh P-256 keypair (ephemeral E2EE). With ZKE you supply a **persistent device key** so the server can audit which host fetched secrets and the SDK caches the wrapped DEK between polls.

**Generate your device key once:**

```sh
bella auth setup   # stores in OS keychain; copy the printed PEM
```

**ASP.NET Core (via env var — recommended):**

```sh
export BELLA_BAXTER_PRIVATE_KEY="$(cat ~/.bella/device-key.pem)"
```

The SDK reads `BELLA_BAXTER_PRIVATE_KEY` automatically. No code change required.

**Or set it in options:**

```csharp
builder.Configuration.AddBellaSecrets(o =>
{
    o.BaxterUrl       = builder.Configuration["BELLA_BAXTER_URL"]!;
    o.ApiKey          = builder.Configuration["BELLA_BAXTER_API_KEY"]!;
    o.ProjectSlug     = "my-project";
    o.EnvironmentSlug = "production";
    // Optional — use persistent ZKE key instead of ephemeral E2EE
    o.PrivateKey      = builder.Configuration["BELLA_BAXTER_PRIVATE_KEY"];
});
```

If `PrivateKey` is not set the SDK falls back to ephemeral E2EE — fully backward-compatible.

## Source Generator (Typed Secrets)

```sh
dotnet add package BellaBaxter.SourceGenerator
bella secrets generate csharp
```

Generates a strongly-typed `AppSecrets` record. Full IDE autocomplete, no magic strings.

## `BellaOptions` Reference

| Property | Default | Description |
|----------|---------|-------------|
| `BaxterUrl` | `https://api.bella-baxter.io` | Bella API base URL |
| `ApiKey` | — | `bax-...` consumer key |
| `ProjectSlug` | — | Project slug |
| `EnvironmentSlug` | — | Environment slug |
| `PollingInterval` | `60s` | How often to reload secrets |
| `FallbackOnError` | `true` | Serve cached values on transient errors |
| `PrivateKey` | `null` | PKCS#8 PEM for ZKE; `null` = ephemeral E2EE |
| `AppClient` | `null` | Sent as `X-App-Client` header for audit logs |

## All Samples

| Sample | Pattern | Link |
|--------|---------|------|
| `01-dotenv-file` | `bella pull` → read `.env` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/01-dotenv-file) |
| `02-process-inject` | `bella exec -- dotnet run` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/02-process-inject) |
| `03-aspnet` | `AddBellaSecrets()` in ASP.NET Core | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/03-aspnet) |
| `04-aspire` | Aspire + external Bella instance | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/04-aspire) |
| `05-aspire-selfhosted` | Aspire + self-hosted Bella stack | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/05-aspire-selfhosted) |
