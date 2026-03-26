# Swift SDK

`BellaBaxterSwift` is a Swift Package Manager library for macOS, iOS, and server-side Swift (Vapor, Hummingbird).

## Installation

```swift
// Package.swift
.package(url: "https://github.com/cosmic-chimps/bella-baxter-swift.git", from: "1.0.0")
```

Or in Xcode: **File → Add Package Dependencies** → paste the URL above.

## Quick Start

```swift
import BellaBaxterSwift

let client = BellaClient(
    baxterURL: URL(string: ProcessInfo.processInfo.environment["BELLA_BAXTER_URL"]!)!,
    apiKey: ProcessInfo.processInfo.environment["BELLA_BAXTER_API_KEY"]!
)

let secrets = try await client.getAllSecrets()
print(secrets["DATABASE_URL"] ?? "not found")
```

## iOS / SwiftUI Integration

```swift
// AppDelegate or @main App struct
@main
struct MyApp: App {
    @StateObject private var secrets = SecretsStore()

    var body: some Scene {
        WindowGroup {
            ContentView().environmentObject(secrets)
        }
    }
}
```

→ [Full iOS sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/swift/samples/04-ios-app)

## Zero-Knowledge Encryption (ZKE)

By default the SDK generates a fresh P-256 keypair per request (ephemeral E2EE). With ZKE you supply a **persistent device key** — the server audits which host fetched each secret and the SDK caches the wrapped DEK.

**Generate your device key once:**

```sh
bella auth setup   # stores in OS keychain; copy the PKCS#8 PEM
```

**Use it in your Swift app:**

```swift
import BellaBaxterSwift
import CryptoKit

// Load from a PEM string (e.g. from environment or secure storage)
let privateKey = try BellaClient.loadPrivateKey(
    pkcs8Pem: ProcessInfo.processInfo.environment["BELLA_BAXTER_PRIVATE_KEY"] ?? ""
)

let options = BellaClientOptions(
    baxterURL: URL(string: ProcessInfo.processInfo.environment["BELLA_BAXTER_URL"]!)!,
    apiKey: ProcessInfo.processInfo.environment["BELLA_BAXTER_API_KEY"]!,
    privateKey: privateKey,
    onWrappedDekReceived: { project, env, wrappedDek, leaseExpires in
        print("DEK for \(project)/\(env) expires \(leaseExpires as Any)")
    }
)

let client = BellaClient(options: options)
let secrets = try await client.getAllSecrets()
```

If `privateKey` is nil the SDK falls back to ephemeral E2EE — fully backward-compatible.

## Typed Secrets

```sh
bella secrets generate swift
```

Generates a typed `AppSecrets` struct. Safe subscript access with compile-time key validation.

→ [Full typed secrets sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/swift/samples/05-typed-secrets)

## All Samples

| Sample | Pattern | Link |
|--------|---------|------|
| `01-dotenv-file` | `bella pull` → Swift dotenv | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/swift/samples/01-dotenv-file) |
| `02-process-inject` | `bella run -- swift run` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/swift/samples/02-process-inject) |
| `03-swift-cli` | SDK in Swift CLI tool | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/swift/samples/03-swift-cli) |
| `04-ios-app` | SDK in iOS SwiftUI app | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/swift/samples/04-ios-app) |
| `05-typed-secrets` | Generated AppSecrets struct | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/swift/samples/05-typed-secrets) |
