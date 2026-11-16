# Dart / Flutter SDK

Dart client for Bella Baxter, built on a generated API client. Works in Flutter apps, Dart CLI tools, and Shelf servers.

## Installation

```yaml
# pubspec.yaml
dependencies:
  bella_baxter: ^VERSION
```

Replace `VERSION` with the latest version published on pub.dev. The SDK is a preview release (0.1.x), so a `^1.0.0` requirement will not resolve.

```sh
dart pub get
```

## Quick Start

```dart
import 'package:bella_baxter/bella_client.dart';

// Recommended: read config from environment (injected by `bella sdk run`)
final client = BellaClient.fromEnv();

final secrets = await client.pullSecrets(
  projectRef: 'my-project',
  environmentSlug: 'production',
);
print(secrets['DATABASE_URL']);
```

Or construct explicitly:

```dart
final client = BellaClient(BellaClientOptions(
  baseUrl: Platform.environment['BELLA_BAXTER_URL']!,
  apiKey: Platform.environment['BELLA_BAXTER_API_KEY']!,
));

final secrets = await client.pullSecrets(
  projectRef: 'my-project',
  environmentSlug: 'production',
);
```

## Flutter Integration

```dart
// lib/main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final client = BellaClient(BellaClientOptions(
    baseUrl: const String.fromEnvironment('BELLA_BAXTER_URL'),
    apiKey: const String.fromEnvironment('BELLA_BAXTER_API_KEY'),
  ));

  final secrets = await client.pullSecrets(
    projectRef: 'my-project',
    environmentSlug: 'production',
  );

  runApp(MyApp(secrets: secrets));
}
```

→ [Full Flutter sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dart-flutter/example/05-flutter-app)

## Dart Shelf Server

```dart
// Inject secrets before starting the server
final client = BellaClient.fromEnv();
final secrets = await client.pullSecrets(
  projectRef: 'my-project',
  environmentSlug: 'production',
);

final handler = Pipeline()
    .addMiddleware(logRequests())
    .addHandler(_router(secrets)); // your own router that closes over the secrets

await io.serve(handler, 'localhost', 8080);
```

→ [Full Shelf sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dart/example/04-dart-shelf)

## Zero-Knowledge Encryption (ZKE)

By default the SDK generates a fresh P-256 keypair per client (ephemeral E2EE). With ZKE the app presents a **persistent device key**. The server audits which host fetched each secret. The SDK passes the wrapped DEK it receives to your `onWrappedDekReceived` callback, so you can cache it.

**Create a device key once, on each machine:**

```sh
bella auth setup
```

This creates a P-256 key on the machine, stores it encrypted under `~/.config/bella-cli`, and registers the public half with Bella. It prints the device's fingerprint, not the key. The private key stays on the machine.

**Run your app under `bella sdk run`:**

```sh
bella sdk run -- dart run main.dart
```

`bella sdk run` sets `BELLA_BAXTER_PRIVATE_KEY` in the process it starts, and `BellaClient.fromEnv()` reads that variable. If you sign in with an API key (`bax-...`), the CLI sets it only when the server confirms that this machine's device is the one recorded against the key.

If the variable is set but is not a readable P-256 key, `fromEnv()` throws a `StateError`. It does not fall back to an ephemeral key.

If you build the client yourself, pass the key bytes with `bellaPrivateKeyFromEnvValue`, which accepts a PEM or bare base64 PKCS#8 DER:

```dart
import 'dart:io';
import 'package:bella_baxter/bella_client.dart';

final client = BellaClient(BellaClientOptions(
  baseUrl: Platform.environment['BELLA_BAXTER_URL']!,
  apiKey: Platform.environment['BELLA_BAXTER_API_KEY']!,
  privateKey: bellaPrivateKeyFromEnvValue(
      Platform.environment['BELLA_BAXTER_PRIVATE_KEY']),
  onWrappedDekReceived: (project, env, wrappedDek, leaseExpires) {
    print('DEK for $project/$env expires $leaseExpires');
  },
));
```

If `privateKey` is null the SDK uses ephemeral E2EE.

## `BellaClientOptions` Reference

| Option | Default | Description |
|--------|---------|-------------|
| `baseUrl` | `https://api.bella-baxter.io` | Bella API base URL |
| `apiKey` | — | `bax-...` consumer key (mutually exclusive with `accessToken`) |
| `accessToken` | — | Short-lived JWT (injected by `bella sdk run` in SSO mode) |
| `appClient` | `null` | Sent as `X-App-Client` header; falls back to `BELLA_BAXTER_APP_CLIENT` env var |
| `connectTimeout` | `10s` | HTTP connection timeout |
| `receiveTimeout` | `30s` | HTTP receive timeout |
| `cache` | `null` | Optional `SecretCache` for offline-first fallback |
| `privateKey` | `null` | PKCS#8 DER bytes for ZKE; `null` = ephemeral E2EE |

## Typed Secrets

```sh
bella secrets generate dart
```

Generates a typed `AppSecrets` class with final fields.

## All Samples

| Sample | Pattern | Link |
|--------|---------|------|
| `01-dart-dotenv` | `bella pull` → dotenv Dart | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dart/example/01-dart-dotenv) |
| `02-process-inject` | `bella sdk run -- dart run main.dart` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dart/example/02-process-inject) |
| `03-dart-cli` | SDK in Dart CLI tool | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dart/example/03-dart-cli) |
| `04-dart-shelf` | SDK in Shelf server | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dart/example/04-dart-shelf) |
| `05-flutter-app` | SDK in Flutter app | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dart-flutter/example/05-flutter-app) |
