# PHP SDK

Guzzle-based PHP client for Bella Baxter. Laravel ServiceProvider and Symfony Bundle included.

## Installation

```sh
composer require cosmic-chimps/bella-baxter
```

## Quick Start

```php
use BellaBaxter\BaxterClient;

$client = new BaxterClient(
    baxterUrl: $_ENV['BELLA_BAXTER_URL'],
    apiKey:    $_ENV['BELLA_BAXTER_API_KEY'],
);

$secrets = $client->getAllSecrets();
echo $secrets['DATABASE_URL'];
```

## Laravel Integration

Register the `BellaBaxterServiceProvider` in `config/app.php` or via auto-discovery. Secrets are loaded at boot — `env('DATABASE_URL')` works everywhere.

```php
// config/bella_baxter.php
return [
    'url'     => env('BELLA_BAXTER_URL'),
    'api_key' => env('BELLA_BAXTER_API_KEY'),
];
```

→ [Full Laravel sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/php/samples/03-laravel)

## Symfony Integration

```yaml
# config/packages/bella_baxter.yaml
bella_baxter:
    url: '%env(BELLA_BAXTER_URL)%'
    api_key: '%env(BELLA_BAXTER_API_KEY)%'
```

Secrets are injected into `$_ENV` via a `Kernel::REQUEST` event subscriber before any controller runs.

→ [Full Symfony sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/php/samples/04-symfony)

## Typed Secrets

```sh
bella secrets generate php
```

Generates a typed `AppSecrets` class. No more `$_ENV['MY_SECRET']` magic strings.

→ [Full typed secrets sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/php/samples/05-typed-secrets)

## All Samples

| Sample | Pattern | Link |
|--------|---------|------|
| `01-dotenv-file` | `bella pull` → vlucas/phpdotenv | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/php/samples/01-dotenv-file) |
| `02-process-inject` | `bella run -- php app.php` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/php/samples/02-process-inject) |
| `03-laravel` | BellaBaxterServiceProvider | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/php/samples/03-laravel) |
| `04-symfony` | BellaBundle event subscriber | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/php/samples/04-symfony) |
| `05-typed-secrets` | Generated typed AppSecrets class | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/php/samples/05-typed-secrets) |
