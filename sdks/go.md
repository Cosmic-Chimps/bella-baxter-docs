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
