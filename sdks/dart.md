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
