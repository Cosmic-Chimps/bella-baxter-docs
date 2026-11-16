# Go SDK

Go client for Bella Baxter, built on the Kiota-generated API client. Works with stdlib, Gin, Echo, Fiber, and any Go application. Requires Go 1.25+.

## Installation

```sh
go get github.com/cosmic-chimps/bella-baxter-go
```

## Quick Start

```go
package main

import (
    "context"
    "fmt"
    "log"
    "os"

    "github.com/cosmic-chimps/bella-baxter-go/bellabaxter"
)

func main() {
    client, err := bellabaxter.New(bellabaxter.Options{
        BaxterURL: os.Getenv("BELLA_BAXTER_URL"),
        ApiKey:    os.Getenv("BELLA_BAXTER_API_KEY"),
    })
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    ctx := context.Background()
    resp, err := client.GetAllSecrets(ctx, "my-project", "production")
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(resp.Secrets["DATABASE_URL"])
}
```

`GetAllSecrets` takes the project reference and the environment slug. The values are in `resp.Secrets`, a `map[string]string`.

If you do not want to hard-code them, `client.GetKeyContext(ctx)` returns the `ProjectSlug` and `EnvironmentSlug` that your API key is scoped to.

## Framework Integrations

### stdlib / chi

```go
// main.go — load before starting the server
resp, err := client.GetAllSecrets(ctx, "my-project", "production")
if err != nil {
    log.Fatal(err)
}
config := Config{DatabaseURL: resp.Secrets["DATABASE_URL"]}
srv := NewServer(config)
srv.ListenAndServe(":8080")
```

→ [Full stdlib sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/go/samples/03-stdlib)

### Gin

The SDK does not ship a Gin middleware. You write a small one yourself that holds the secrets you loaded at startup:

```go
// Load once at startup
resp, err := client.GetAllSecrets(ctx, "my-project", "production")
if err != nil {
    log.Fatal(err)
}
secrets := resp.Secrets

// Your own middleware: put the loaded secrets on every request context
r.Use(func(c *gin.Context) {
    c.Set("bella_secrets", secrets)
    c.Next()
})

r.GET("/health", func(c *gin.Context) {
    s := c.MustGet("bella_secrets").(map[string]string)
    c.JSON(200, gin.H{"db": s["DATABASE_URL"] != ""})
})
```

→ [Full Gin sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/go/samples/04-gin)

## Zero-Knowledge Encryption (ZKE)

With ZKE the app presents a **persistent device key**. The server audits which host fetched each secret, and under ZKE enforcement the key is what lets the app read at all: a secrets request that presents no registered key is refused with a 403. The SDK passes the wrapped DEK it receives to your `OnWrappedDEK` callback, so you can cache it.

Supplying the key is all it takes. The client then presents it as `X-E2E-Public-Key` on every secrets request and decrypts the response with it. You do **not** need `EnableE2EE`; that option is only for end-to-end encryption *without* a device key, using an ephemeral key per client.

**Create a device key once, on each machine:**

```sh
bella auth setup
```

This creates a P-256 key on the machine, stores it encrypted under `~/.config/bella-cli`, and registers the public half with Bella. It prints the device's fingerprint, not the key. The private key stays on the machine.

**Run your app under `bella sdk run`:**

```sh
bella sdk run -- go run .
```

`bella sdk run` sets `BELLA_BAXTER_PRIVATE_KEY` in the process it starts, and `New()` reads that variable. If you sign in with an API key (`bax-...`), the CLI sets it only when the server confirms that this machine's device is the one recorded against the key.

To receive the wrapped DEK, set `OnWrappedDEK`. `Options.PrivateKeyPEM` takes the key as PEM or bare base64 PKCS#8 DER; when it is empty, `New` reads `BELLA_BAXTER_PRIVATE_KEY`:

```go
client, err := bellabaxter.New(bellabaxter.Options{
    BaxterURL: os.Getenv("BELLA_BAXTER_URL"),
    ApiKey:    os.Getenv("BELLA_BAXTER_API_KEY"),
    // Optional. When empty, New reads BELLA_BAXTER_PRIVATE_KEY itself.
    PrivateKeyPEM: os.Getenv("BELLA_BAXTER_PRIVATE_KEY"),
    OnWrappedDEK: func(project, env, wrappedDEK string, leaseExpires *time.Time) {
        log.Printf("DEK for %s/%s expires %v", project, env, leaseExpires)
    },
})
```

- **A key that is set but unreadable is an error.** `New` returns one naming `BELLA_BAXTER_PRIVATE_KEY` (or `Options.PrivateKeyPEM`) and never continues with a throwaway key in its place.
- **Opting out:** `DisableE2EE: true` keeps the key off the wire. `New` logs one warning through the standard `log` package when a key is supplied anyway, because under enforcement every read will then be refused. Setting both `EnableE2EE` and `DisableE2EE` is an error.
- **No key:** the SDK behaves as before. Secrets responses are plaintext over TLS unless you set `EnableE2EE: true`, which uses an ephemeral key per client.

## Typed Secrets

```sh
bella secrets generate go
```

Generates an `AppSecrets` struct with compile-time checking. The same pattern as Gin middleware but fully typed.

→ [Full typed secrets sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/go/samples/05-typed-secrets)

## All Samples

| Sample | Pattern | Link |
|--------|---------|------|
| `01-dotenv-file` | `bella pull` → godotenv | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/go/samples/01-dotenv-file) |
| `02-process-inject` | `bella run -- go run .` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/go/samples/02-process-inject) |
| `03-stdlib` | SDK in main(), Config struct | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/go/samples/03-stdlib) |
| `04-gin` | SDK as Gin middleware | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/go/samples/04-gin) |
| `05-typed-secrets` | Generated AppSecrets struct | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/go/samples/05-typed-secrets) |
