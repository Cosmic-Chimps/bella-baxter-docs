# Swift SDK

`BellaBaxterSwift` is a Swift Package Manager library for macOS, iOS, watchOS, tvOS, and server-side Swift (Vapor, Hummingbird).

**Requirements:** Swift 6.2 or later (Xcode 26 or later). Minimum platforms: macOS 14, iOS 17, watchOS 10, tvOS 17.

## Installation

```swift
// Package.swift
.package(url: "https://github.com/cosmic-chimps/bella-baxter-swift.git", from: "VERSION")
```

Replace `VERSION` with the latest published version. The SDK is a preview release (0.1.x), so a requirement such as `from: "1.0.0"` will not resolve.

Or in Xcode: **File → Add Package Dependencies** → paste the URL above.

## Quick Start

```swift
import BellaBaxterSwift

let options = BellaClientOptions(
    baseURL: URL(string: ProcessInfo.processInfo.environment["BELLA_BAXTER_URL"]!)!,
    apiKey: ProcessInfo.processInfo.environment["BELLA_BAXTER_API_KEY"]!
)
let client = try BellaClient(options)

let secrets = try await client.pullSecrets(
    projectRef: "my-project",
    environmentSlug: "production"
)
print(secrets["DATABASE_URL"] ?? "not found")
```

`pullSecrets` returns a `[String: String]`. If you leave out `projectRef` and `environmentSlug`, the client uses the project and environment your API key is scoped to.

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

By default the SDK generates a fresh P-256 keypair per request (ephemeral E2EE). With ZKE the app presents a **persistent device key**. The server audits which host fetched each secret. The SDK passes the wrapped DEK it receives to your `onWrappedDekReceived` callback, so you can cache it.

**Create a device key once, on each machine:**

```sh
bella auth setup
```

This creates a P-256 key on the machine, stores it encrypted under `~/.config/bella-cli`, and registers the public half with Bella. It prints the device's fingerprint, not the key. The private key stays on the machine.

**Run your app under `bella sdk run`:**

```sh
bella sdk run -- swift run
```

`bella sdk run` sets `BELLA_BAXTER_PRIVATE_KEY` in the process it starts. `BellaClientOptions` reads that variable when you do not pass a `privateKey`. If you sign in with an API key (`bax-...`), the CLI sets it only when the server confirms that this machine's device is the one recorded against the key.

If the variable is set but is not a readable P-256 key, `try BellaClient(options)` throws. It does not fall back to an ephemeral key.

**Use it in your Swift app:**

```swift
import BellaBaxterSwift
import CryptoKit

// Optional: BellaClientOptions reads BELLA_BAXTER_PRIVATE_KEY itself when privateKey is nil.
let privateKey = try BellaClient.loadPrivateKey(
    pkcs8Pem: ProcessInfo.processInfo.environment["BELLA_BAXTER_PRIVATE_KEY"] ?? ""
)

let options = BellaClientOptions(
    baseURL: URL(string: ProcessInfo.processInfo.environment["BELLA_BAXTER_URL"]!)!,
    apiKey: ProcessInfo.processInfo.environment["BELLA_BAXTER_API_KEY"]!,
    privateKey: privateKey,
    onWrappedDekReceived: { project, env, wrappedDek, leaseExpires in
        print("DEK for \(project)/\(env) expires \(leaseExpires as Any)")
    }
)

let client = try BellaClient(options)
let secrets = try await client.pullSecrets()
```

If there is no device key, the SDK uses ephemeral E2EE.

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
