# Java SDK

OkHttp-based Java SDK for Bella Baxter. First-class Spring Boot and Quarkus integrations.

## Installation

::: code-group

```xml [Maven]
<dependency>
    <groupId>io.bellabaxter</groupId>
    <artifactId>bella-baxter-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

```kotlin [Gradle (Kotlin DSL)]
implementation("io.bellabaxter:bella-baxter-sdk:1.0.0")
```

:::

**Requires Java 21+.**

## Quick Start

```java
BaxterClient client = new BaxterClient(
    BaxterClientOptions.builder()
        .baxterUrl(System.getenv("BELLA_BAXTER_URL"))
        .apiKey(System.getenv("BELLA_BAXTER_API_KEY"))
        .build()
);

Map<String, String> secrets = client.getAllSecrets();
System.out.println(secrets.get("DATABASE_URL"));
```

## Spring Boot Integration

Use an `EnvironmentPostProcessor` — the only Spring hook that runs **before beans are created**, so `@Value("${DATABASE_URL}")` and `application.properties` placeholders work correctly.

```java
@Component
public class BellaEnvironmentPostProcessor implements EnvironmentPostProcessor {
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication app) {
        var secrets = new BaxterClient(...).getAllSecrets();
        env.getPropertySources().addFirst(new MapPropertySource("bella", secrets));
    }
}
```

→ [Full Spring Boot sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/java/samples/03-spring-boot)

## Quarkus Integration

```java
@ApplicationScoped
public class SecretsLoader {
    void onStart(@Observes StartupEvent ev) {
        Map<String, String> secrets = client.getAllSecrets();
        secrets.forEach(System::setProperty);
    }
}
```

→ [Full Quarkus sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/java/samples/04-quarkus)

## Typed Secrets

```sh
bella secrets generate java
```

Generates a `BellaAppSecrets` record. Spring Boot integration includes `@ConfigurationProperties` binding.

## All Samples

| Sample | Pattern | Link |
|--------|---------|------|
| `01-dotenv-file` | `bella pull` → dotenv-java | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/java/samples/01-dotenv-file) |
| `02-process-inject` | `bella run -- java -jar app.jar` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/java/samples/02-process-inject) |
| `03-spring-boot` | EnvironmentPostProcessor | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/java/samples/03-spring-boot) |
| `04-quarkus` | CDI @Observes StartupEvent | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/java/samples/04-quarkus) |
