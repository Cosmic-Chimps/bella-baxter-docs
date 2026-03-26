# .NET SDK

`BellaBaxter.Sdk` provides first-class integration with ASP.NET Core, .NET Aspire, and the .NET hosting model.

## Installation

```sh
dotnet add package BellaBaxter.Sdk
```

For ASP.NET Core dependency injection:

```sh
dotnet add package BellaBaxter.Extensions.DependencyInjection
```

For .NET Aspire:

```sh
dotnet add package BellaBaxter.Aspire.Configuration
```

## Quick Start

```csharp
var client = new BaxterClient(new BaxterClientOptions
{
    BaxterUrl = "https://your-instance.bella-baxter.io",
    ApiKey = "bax-...",
});

var secrets = await client.GetAllSecretsAsync();
Console.WriteLine(secrets["DATABASE_URL"]);
```

## ASP.NET Core Integration

```csharp
// Program.cs
builder.Services.AddBaxterSecrets(options =>
{
    options.BaxterUrl = builder.Configuration["BELLA_BAXTER_URL"];
    options.ApiKey = builder.Configuration["BELLA_BAXTER_API_KEY"];
});
```

→ [Full ASP.NET Core sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/03-aspnet)

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

**Or set it in `appsettings.json` / options (non-production only):**

```csharp
builder.Services.AddBaxterSecrets(options =>
{
    options.BaxterUrl = builder.Configuration["BELLA_BAXTER_URL"];
    options.ApiKey    = builder.Configuration["BELLA_BAXTER_API_KEY"];
    // Optional — use persistent ZKE key instead of ephemeral E2EE
    options.PrivateKey = builder.Configuration["BELLA_BAXTER_PRIVATE_KEY"];
});
```

If `PrivateKey` is not set the SDK falls back to ephemeral E2EE — fully backward-compatible.

## Source Generator (Typed Secrets)

```sh
dotnet add package BellaBaxter.SourceGenerator
```

```sh
bella secrets generate csharp
```

Generates a strongly-typed `AppSecrets` record. Full IDE autocomplete, no magic strings.

## All Samples

| Sample | Pattern | Link |
|--------|---------|------|
| `01-dotenv-file` | `bella pull` → read `.env` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/01-dotenv-file) |
| `02-process-inject` | `bella run -- dotnet run` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/02-process-inject) |
| `03-aspnet` | SDK in ASP.NET Core DI | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/03-aspnet) |
| `04-aspire` | Aspire + external Bella instance | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/04-aspire) |
| `05-aspire-selfhosted` | Aspire + self-hosted Bella stack | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dotnet/samples/05-aspire-selfhosted) |
