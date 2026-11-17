# SDK Overview

Official Bella Baxter SDKs for every major platform. Each SDK provides:
- Secret loading at application startup
- HMAC-signed requests with automatic retry
- **End-to-end encrypted transport** (E2EE) — secrets are encrypted between server and SDK before TLS
- **Zero-Knowledge Encryption (ZKE)** — optional persistent device key for audit trails
- `bella sdk run` passes your credentials to the SDK in the process it starts; `bella run` needs no SDK
- Typed secret code generation via `bella secrets generate <lang>` for most languages (see [below](#typed-secrets-code-generation))
- A `User-Agent` of the form `bella-{lang}-sdk/1.0` on every request, visible in your audit log (the .NET SDK sends its own package version instead of `1.0`)

---

## Choose Your Language

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin:24px 0">

[![JavaScript](https://img.shields.io/badge/JavaScript-TypeScript-yellow?logo=javascript)](/sdks/javascript)
[![.NET](https://img.shields.io/badge/.NET-C%23-512BD4?logo=dotnet)](/sdks/dotnet)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)](/sdks/python)
[![Go](https://img.shields.io/badge/Go-1.25+-00ADD8?logo=go)](/sdks/go)
[![Ruby](https://img.shields.io/badge/Ruby-4.0+-CC342D?logo=ruby)](/sdks/ruby)
[![PHP](https://img.shields.io/badge/PHP-8.1+-777BB4?logo=php)](/sdks/php)
[![Swift](https://img.shields.io/badge/Swift-6.2+-F05138?logo=swift)](/sdks/swift)
[![Java](https://img.shields.io/badge/Java-17+-ED8B00?logo=openjdk)](/sdks/java)
[![Dart](https://img.shields.io/badge/Dart-Flutter-0175C2?logo=dart)](/sdks/dart)
[![Ansible](https://img.shields.io/badge/Ansible-Collection-EE0000?logo=ansible)](/sdks/ansible)

</div>

---

## Comparison

| Language | Package | Framework Integrations | Typed Secrets | ZKE |
|----------|---------|----------------------|---------------|-----|
| [JavaScript / TypeScript](/sdks/javascript) | `@bella-baxter/sdk` | Express, NestJS, Next.js, Fastify, AdonisJS | ✅ | ✅ |
| [.NET](/sdks/dotnet) | `BellaBaxter.AspNet.Configuration`, `BellaBaxter.Aspire.Configuration` | ASP.NET Core, Aspire | ✅ Source Generator | ✅ |
| [Python](/sdks/python) | `bella-baxter` | Flask, Django, FastAPI | ✅ | ✅ |
| [Go](/sdks/go) | `github.com/cosmic-chimps/bella-baxter-go` | stdlib, Gin | ✅ | ✅ |
| [Ruby](/sdks/ruby) | `bella_baxter` | Rails (Railtie) | ✅ | ✅ |
| [PHP](/sdks/php) | `bella-baxter/sdk` (plus `bella-baxter/laravel` and `bella-baxter/symfony`) | Laravel, Symfony | ✅ | ✅ |
| [Swift](/sdks/swift) | `BellaBaxterSwift` (SPM) | iOS / SwiftUI, CLI | ✅ | ✅ |
| [Java](/sdks/java) | Maven: `io.bella-baxter:bella-baxter-sdk` | Spring Boot, Quarkus | — | ✅ |
| [Dart](/sdks/dart) | `bella_baxter` (pub.dev) | Flutter, Dart CLI, Shelf | ✅ | ✅ |
| [Ansible](/sdks/ansible) | `jjchiw.bella_baxter` | Playbooks, lookup plugins | — | — |

→ [Zero-Knowledge Encryption (ZKE)](/features/e2ee-zke) — how E2EE transport and persistent device keys work

---

## No SDK Required

For simple use cases, you don't need an SDK at all. The Bella CLI handles secret injection:

```sh
# Write .env file
bella pull

# Inject into any process
bella run -- npm start
```

If your app uses an SDK, start it with `bella sdk run -- <command>`, for example `bella sdk run -- python manage.py runserver`. The CLI passes the process your credentials, and the SDK fetches the secrets.

Use an SDK when you want **programmatic access** to secrets inside your application code (e.g., custom loading logic, typed access, framework startup hooks).

---

## Typed Secrets Code Generation

`bella secrets generate <lang>` generates a typed class from your current environment's secrets. The supported languages are `csharp`, `fsharp`, `python`, `go`, `typescript`, `dart`, `php`, `ruby` and `swift`:

```sh
bella secrets generate typescript
bella secrets generate csharp
bella secrets generate fsharp
bella secrets generate python
bella secrets generate go
bella secrets generate dart
bella secrets generate php
bella secrets generate ruby
bella secrets generate swift
```

Java and Ansible are not supported.

The generated code gives you IDE autocomplete, compile-time checking, and no more `process.env.MY_SECRET` magic strings.

## License

Every SDK is released under the MIT License, and so are the `bella` CLI, the Terraform provider and the Ansible collection. Only the Bella Baxter server is under the Elastic License. See [License](/open-source/#license).
