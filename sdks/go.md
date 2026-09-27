# Go SDK

Zero-dependency Go client for Bella Baxter. Works with stdlib, Gin, Echo, Fiber, and any Go application.

## Installation

```sh
go get github.com/cosmic-chimps/bella-baxter-go
```

## Quick Start

```go
package main

import (
    "fmt"
    "os"
    "github.com/cosmic-chimps/bella-baxter-go/bellabaxter"
)

func main() {
    client := bellabaxter.NewClient(bellabaxter.ClientOptions{
        BaxterURL: os.Getenv("BELLA_BAXTER_URL"),
        APIKey:    os.Getenv("BELLA_BAXTER_API_KEY"),
    })

    secrets, err := client.GetAllSecrets(ctx)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(secrets["DATABASE_URL"])
}
```

## Framework Integrations

### stdlib / chi

```go
// main.go — load before starting the server
secrets, _ := client.GetAllSecrets(ctx)
config := Config{DatabaseURL: secrets["DATABASE_URL"]}
srv := NewServer(config)
srv.ListenAndServe(":8080")
```

→ [Full stdlib sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/go/samples/03-stdlib)

### Gin

```go
// Use the BellaMiddleware to make secrets available in handlers
r.Use(bellabaxter.GinMiddleware(client))
r.GET("/health", func(c *gin.Context) {
    secrets := bellabaxter.SecretsFromContext(c)
    c.JSON(200, gin.H{"db": secrets["DATABASE_URL"]})
})
```

→ [Full Gin sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/go/samples/04-gin)

## Zero-Knowledge Encryption (ZKE)

With ZKE you supply a **persistent device key**. The server audits which host fetched each secret, the SDK can cache the wrapped DEK, and under ZKE enforcement it is what lets the app read at all: a secrets request that presents no registered key is refused with a 403.

Supplying the key is all it takes. The client then presents it as `X-E2E-Public-Key` on every secrets request and decrypts the response with it. You do **not** need `EnableE2EE`; that option is only for end-to-end encryption *without* a device key, using an ephemeral key per client.

**Generate your device key once:**

```sh
bella auth setup   # stores it owner-only under ~/.config/bella-cli; copy the printed PEM
```

**Use it in your app:**

```go
client, err := bellabaxter.New(bellabaxter.Options{
    BaxterURL: os.Getenv("BELLA_BAXTER_URL"),
    ApiKey:    os.Getenv("BELLA_BAXTER_API_KEY"),
    // Optional — New reads BELLA_BAXTER_PRIVATE_KEY itself when this is empty.
    // PEM or bare base64 PKCS#8 DER.
    PrivateKeyPEM: os.Getenv("BELLA_BAXTER_PRIVATE_KEY"),
    OnWrappedDEK: func(project, env, wrappedDEK string, leaseExpires *time.Time) {
        log.Printf("DEK for %s/%s expires %v", project, env, leaseExpires)
    },
})
```

Or just set the environment variable — `New()` reads `BELLA_BAXTER_PRIVATE_KEY` automatically:

```sh
export BELLA_BAXTER_PRIVATE_KEY="$(cat ~/.bella/device-key.pem)"
```

`bella sdk run` injects that variable for you once the device is set up.

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
