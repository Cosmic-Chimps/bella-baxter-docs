# PHP SDK

PHP client for Bella Baxter, built on the Kiota client libraries and Guzzle. Requires PHP 8.1+. Laravel and Symfony integrations are separate packages.

## Installation

```sh
composer require bella-baxter/sdk
```

The Laravel and Symfony integrations are separate packages: `bella-baxter/laravel` and `bella-baxter/symfony`.

## Quick Start

```php
use BellaBaxter\BaxterClient;
use BellaBaxter\BaxterClientOptions;

$client = new BaxterClient(new BaxterClientOptions(
    baxterUrl: $_ENV['BELLA_BAXTER_URL'],
    apiKey:    $_ENV['BELLA_BAXTER_API_KEY'],
));

$secrets = $client->getAllSecrets();
echo $secrets['DATABASE_URL'];
```

`getAllSecrets()` returns the secrets for the project and environment your API key is scoped to, as an array of strings.

## Laravel Integration

```sh
composer require bella-baxter/laravel
```

Laravel auto-discovers `BellaServiceProvider`. Secrets are loaded at boot, so `env('DATABASE_URL')` works everywhere.

Publish the config file, then set the environment variables:

```sh
php artisan vendor:publish --tag=bella-config
```

```php
// config/bella.php
return [
    'url'         => env('BELLA_BAXTER_URL', 'https://api.bella-baxter.io'),
    'api_key'     => env('BELLA_BAXTER_API_KEY', ''),
    'auto_load'   => env('BELLA_BAXTER_AUTO_LOAD', true),
    'private_key' => env('BELLA_BAXTER_PRIVATE_KEY'),
];
```

→ [Full Laravel sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/php/samples/03-laravel)

## Symfony Integration

```sh
composer require bella-baxter/symfony
```

Register the bundle in `config/bundles.php`:

```php
BellaBaxter\Symfony\BellaBundle::class => ['all' => true],
```

Then configure it. The config root is `bella`:

```yaml
# config/packages/bella.yaml
bella:
    url: '%env(BELLA_BAXTER_URL)%'
    api_key: '%env(BELLA_BAXTER_API_KEY)%'
    auto_load: true   # optional, default true
```

Secrets are loaded into `$_ENV` and `putenv()` by a `KernelEvents::REQUEST` event subscriber, before any controller runs.

→ [Full Symfony sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/php/samples/04-symfony)

## Zero-Knowledge Encryption (ZKE)

By default the SDK generates an ephemeral P-256 keypair (ephemeral E2EE). With ZKE the app presents a **persistent device key**. The server audits which host fetched each secret. The SDK passes the wrapped DEK it receives to your `onWrappedDekReceived` callback, so you can cache it.

**Create a device key once, on each machine:**

```sh
bella auth setup
```

This creates a P-256 key on the machine, stores it encrypted under `~/.config/bella-cli`, and registers the public half with Bella. It prints the device's fingerprint, not the key. The private key stays on the machine.

**Run your app under `bella sdk run`:**

```sh
bella sdk run -- php app.php
```

`bella sdk run` sets `BELLA_BAXTER_PRIVATE_KEY` in the process it starts, and `BaxterClient` reads that variable. If you sign in with an API key (`bax-...`), the CLI sets it only when the server confirms that this machine's device is the one recorded against the key.

For Laravel, `config/bella.php` reads the same variable into its `private_key` setting.

To receive the wrapped DEK, add a callback. The callback takes two parameters. `privateKey` takes a PKCS#8 PEM; when it is not set, the client reads `BELLA_BAXTER_PRIVATE_KEY`:

```php
use BellaBaxter\BaxterClient;
use BellaBaxter\BaxterClientOptions;

$client = new BaxterClient(new BaxterClientOptions(
    baxterUrl: $_ENV['BELLA_BAXTER_URL'],
    apiKey:    $_ENV['BELLA_BAXTER_API_KEY'],
    privateKey: getenv('BELLA_BAXTER_PRIVATE_KEY') ?: null,
    onWrappedDekReceived: function (string $wrappedDek, ?string $leaseExpires): void {
        error_log("DEK wrapped, expires {$leaseExpires}");
    },
));
```

If no device key is set, the SDK uses ephemeral E2EE.

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
| `03-laravel` | BellaServiceProvider | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/php/samples/03-laravel) |
| `04-symfony` | BellaBundle event subscriber | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/php/samples/04-symfony) |
| `05-typed-secrets` | Generated typed AppSecrets class | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/php/samples/05-typed-secrets) |
