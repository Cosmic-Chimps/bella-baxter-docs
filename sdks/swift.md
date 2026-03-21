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
