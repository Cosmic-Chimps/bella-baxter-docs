# Java SDK

Java client for Bella Baxter, built on the Kiota-generated API client. Spring Boot and Quarkus integrations are included.

## Installation

::: code-group

```xml [Maven]
<dependency>
    <groupId>io.bella-baxter</groupId>
    <artifactId>bella-baxter-sdk</artifactId>
    <version>VERSION</version>
</dependency>
```

```kotlin [Gradle (Kotlin DSL)]
implementation("io.bella-baxter:bella-baxter-sdk:VERSION")
```

:::

Replace `VERSION` with the latest version published on Maven Central. The SDK is a preview release.

The Maven group ID is `io.bella-baxter`. The Java package name is `io.bellabaxter`.

**Requires Java 17 or later.**

## Quick Start

```java
BaxterClientOptions options = new BaxterClientOptions.Builder()
    .baxterUrl(System.getenv("BELLA_BAXTER_URL"))
    .apiKey(System.getenv("BELLA_BAXTER_API_KEY"))
    .build();

try (BaxterClient client = new BaxterClient(options)) {
    Map<String, String> secrets = client.getAllSecrets().getSecrets();
    System.out.println(secrets.get("DATABASE_URL"));
}
```

## Spring Boot Integration

Use an `EnvironmentPostProcessor` — the only Spring hook that runs **before beans are created**, so `@Value("${DATABASE_URL}")` and `application.properties` placeholders work correctly.

```java
public class BellaEnvironmentPostProcessor implements EnvironmentPostProcessor {
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication app) {
        BaxterClientOptions options = new BaxterClientOptions.Builder()
            .baxterUrl(System.getenv("BELLA_BAXTER_URL"))
            .apiKey(System.getenv("BELLA_BAXTER_API_KEY"))
            .build();

        try (BaxterClient client = new BaxterClient(options)) {
            Map<String, Object> secrets = new HashMap<>(client.getAllSecrets().getSecrets());
            env.getPropertySources().addFirst(new MapPropertySource("bella", secrets));
        }
    }
}
```

Register the class in `META-INF/spring.factories` under `org.springframework.boot.env.EnvironmentPostProcessor`. The `bella-baxter-spring-boot` module does all of this for you when `bellabaxter.api-key` is set.

→ [Full Spring Boot sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/java/samples/03-spring-boot)

## Quarkus Integration

```java
@ApplicationScoped
public class SecretsLoader {
    void onStart(@Observes StartupEvent ev) {
        BaxterClientOptions options = new BaxterClientOptions.Builder()
            .baxterUrl(System.getenv("BELLA_BAXTER_URL"))
            .apiKey(System.getenv("BELLA_BAXTER_API_KEY"))
            .build();

        try (BaxterClient client = new BaxterClient(options)) {
            Map<String, String> secrets = client.getAllSecrets().getSecrets();
            secrets.forEach(System::setProperty);
        }
    }
}
```

The `bella-baxter-quarkus` module registers a MicroProfile Config source that loads the secrets for you when `bellabaxter.api-key` is set.

→ [Full Quarkus sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/java/samples/04-quarkus)

## Zero-Knowledge Encryption (ZKE)

By default the SDK generates an ephemeral P-256 keypair (ephemeral E2EE). With ZKE the app presents a **persistent device key**. The server audits which host fetched each secret. The SDK passes the wrapped DEK it receives to your `onWrappedDekReceived` callback, so you can cache it.

**Create a device key once, on each machine:**

```sh
bella auth setup
```

This creates a P-256 key on the machine, stores it encrypted under `~/.config/bella-cli`, and registers the public half with Bella. It prints the device's fingerprint, not the key. The private key stays on the machine.

**Run your app under `bella sdk run`:**

```sh
bella sdk run -- java -jar app.jar
```

`bella sdk run` sets `BELLA_BAXTER_PRIVATE_KEY` in the process it starts, and the client reads that variable. If you sign in with an API key (`bax-...`), the CLI sets it only when the server confirms that this machine's device is the one recorded against the key.

**Spring Boot / Quarkus:** run the app under `bella sdk run`. No code changes are needed beyond that.

To receive the wrapped DEK, set a callback. `privateKeyPem` takes the key as PEM; when it is not set, the client reads `BELLA_BAXTER_PRIVATE_KEY`:

```java
BaxterClientOptions options = new BaxterClientOptions.Builder()
    .baxterUrl(System.getenv("BELLA_BAXTER_URL"))
    .apiKey(System.getenv("BELLA_BAXTER_API_KEY"))
    .privateKeyPem(System.getenv("BELLA_BAXTER_PRIVATE_KEY"))
    .onWrappedDekReceived((wrappedDek, leaseExpires) ->
        System.out.printf("DEK wrapped, expires: %s%n", leaseExpires))
    .build();

BaxterClient client = new BaxterClient(options);
```

Without a device key, the SDK uses ephemeral E2EE.

## All Samples

| Sample | Pattern | Link |
|--------|---------|------|
| `01-dotenv-file` | `bella pull` → dotenv-java | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/java/samples/01-dotenv-file) |
| `02-process-inject` | `bella run -- java -jar app.jar` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/java/samples/02-process-inject) |
| `03-spring-boot` | EnvironmentPostProcessor | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/java/samples/03-spring-boot) |
| `04-quarkus` | CDI @Observes StartupEvent | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/java/samples/04-quarkus) |
