# SDK Overview

Official Bella Baxter SDKs for every major platform. Each SDK provides:
- Secret loading at application startup
- HMAC-signed requests with automatic retry
- `bella exec` / `bella run` compatibility (no SDK required for basic use)
- Typed secret code generation via `bella secrets generate <lang>`
- `User-Agent: bella-{lang}-sdk/1.0` on every request (visible in your audit log)

---

## Choose Your Language

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin:24px 0">

[![JavaScript](https://img.shields.io/badge/JavaScript-TypeScript-yellow?logo=javascript)](/sdks/javascript)
[![.NET](https://img.shields.io/badge/.NET-C%23-512BD4?logo=dotnet)](/sdks/dotnet)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python)](/sdks/python)
[![Go](https://img.shields.io/badge/Go-1.22+-00ADD8?logo=go)](/sdks/go)
[![Ruby](https://img.shields.io/badge/Ruby-3.1+-CC342D?logo=ruby)](/sdks/ruby)
[![PHP](https://img.shields.io/badge/PHP-8.1+-777BB4?logo=php)](/sdks/php)
[![Swift](https://img.shields.io/badge/Swift-6.0+-F05138?logo=swift)](/sdks/swift)
[![Java](https://img.shields.io/badge/Java-21+-ED8B00?logo=openjdk)](/sdks/java)
[![Dart](https://img.shields.io/badge/Dart-Flutter-0175C2?logo=dart)](/sdks/dart)
[![Ansible](https://img.shields.io/badge/Ansible-Collection-EE0000?logo=ansible)](/sdks/ansible)

</div>

---

## Comparison

| Language | Package | Framework Integrations | Typed Secrets |
|----------|---------|----------------------|---------------|
| [JavaScript / TypeScript](/sdks/javascript) | `@bella-baxter/sdk` | Express, NestJS, Next.js, Fastify, AdonisJS | ✅ |
| [.NET](/sdks/dotnet) | `BellaBaxter.Sdk` | ASP.NET Core, Aspire | ✅ Source Generator |
| [Python](/sdks/python) | `bella-baxter` | Flask, Django, FastAPI | ✅ |
| [Go](/sdks/go) | `github.com/cosmic-chimps/bella-baxter-go` | stdlib, Gin | ✅ |
| [Ruby](/sdks/ruby) | `bella_baxter` | Rails (Railtie) | ✅ |
| [PHP](/sdks/php) | `cosmic-chimps/bella-baxter` | Laravel, Symfony | ✅ |
| [Swift](/sdks/swift) | `BellaBaxterSwift` (SPM) | iOS / SwiftUI, CLI | ✅ |
| [Java](/sdks/java) | Maven: `io.bellabaxter:bella-baxter-sdk` | Spring Boot, Quarkus | ✅ |
| [Dart](/sdks/dart) | `bella_baxter` (pub.dev) | Flutter, Dart CLI, Shelf | ✅ |
| [Ansible](/sdks/ansible) | `cosmic_chimps.bella` | Playbooks, lookup plugins | — |

---

## No SDK Required

For simple use cases, you don't need an SDK at all. The Bella CLI handles secret injection:

```sh
# Write .env file
bella pull

# Inject into any process
bella run -- npm start
bella exec -- python manage.py runserver
bella exec -- java -jar app.jar
```

Use an SDK when you want **programmatic access** to secrets inside your application code (e.g., custom loading logic, typed access, framework startup hooks).

---

## Typed Secrets Code Generation

All SDKs support `bella secrets generate <lang>` to generate a typed class from your current environment's secrets:

```sh
bella secrets generate typescript
bella secrets generate csharp
bella secrets generate python
bella secrets generate go
bella secrets generate java
bella secrets generate php
```

The generated code gives you IDE autocomplete, compile-time checking, and no more `process.env.MY_SECRET` magic strings.
