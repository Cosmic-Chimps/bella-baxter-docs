# Dart / Flutter SDK

Auto-generated Dart client for Bella Baxter. Works in Flutter apps, Dart CLI tools, and Shelf servers.

## Installation

```yaml
# pubspec.yaml
dependencies:
  bella_baxter: ^1.0.0
```

```sh
dart pub get
```

## Quick Start

```dart
import 'package:bella_baxter/bella_baxter.dart';

final client = BaxterClient(
  baxterUrl: Platform.environment['BELLA_BAXTER_URL']!,
  apiKey: Platform.environment['BELLA_BAXTER_API_KEY']!,
);

final secrets = await client.getAllSecrets();
print(secrets['DATABASE_URL']);
```

## Flutter Integration

```dart
// lib/main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final secrets = await BaxterClient(
    baxterUrl: const String.fromEnvironment('BELLA_BAXTER_URL'),
    apiKey: const String.fromEnvironment('BELLA_BAXTER_API_KEY'),
  ).getAllSecrets();

  runApp(MyApp(secrets: secrets));
}
```

→ [Full Flutter sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dart/samples/05-flutter-app)

## Dart Shelf Server

```dart
// Inject secrets before starting the server
final secrets = await client.getAllSecrets();
final handler = Pipeline()
    .addMiddleware(secretsMiddleware(secrets))
    .addHandler(_router);

await io.serve(handler, 'localhost', 8080);
```

→ [Full Shelf sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dart/samples/04-dart-shelf)

## Zero-Knowledge Encryption (ZKE)

By default the SDK generates a fresh P-256 keypair per request (ephemeral E2EE). With ZKE you supply a **persistent device key** — the server audits which host fetched each secret and the SDK caches the wrapped DEK.

**Generate your device key once:**

```sh
bella auth setup   # stores in OS keychain; copy the PKCS#8 PEM
```

**Load the key bytes and pass them in:**

```dart
import 'dart:convert';
import 'dart:typed_data';
import 'package:bella_baxter/bella_baxter.dart';

// Decode PKCS#8 PEM → raw bytes
Uint8List _pemToBytes(String pem) {
  final b64 = pem
      .replaceAll('-----BEGIN PRIVATE KEY-----', '')
      .replaceAll('-----END PRIVATE KEY-----', '')
      .replaceAll(RegExp(r'\s'), '');
  return Uint8List.fromList(base64.decode(b64));
}

final keyPem = Platform.environment['BELLA_BAXTER_PRIVATE_KEY'];

final client = BaxterClient(
  baxterUrl: Platform.environment['BELLA_BAXTER_URL']!,
  apiKey: Platform.environment['BELLA_BAXTER_API_KEY']!,
  privateKey: keyPem != null ? _pemToBytes(keyPem) : null,
  onWrappedDekReceived: (project, env, wrappedDek, leaseExpires) {
    debugPrint('DEK for $project/$env expires $leaseExpires');
  },
);
```

If `privateKey` is null the SDK falls back to ephemeral E2EE — fully backward-compatible.

## Typed Secrets

```sh
bella secrets generate dart
```

Generates a typed `AppSecrets` class with final fields.

## All Samples

| Sample | Pattern | Link |
|--------|---------|------|
| `01-dart-dotenv` | `bella pull` → dotenv Dart | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dart/samples/01-dart-dotenv) |
| `02-process-inject` | `bella run -- dart run main.dart` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dart/samples/02-process-inject) |
| `03-dart-cli` | SDK in Dart CLI tool | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dart/samples/03-dart-cli) |
| `04-dart-shelf` | SDK in Shelf server | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dart/samples/04-dart-shelf) |
| `05-flutter-app` | SDK in Flutter app | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/dart/samples/05-flutter-app) |
