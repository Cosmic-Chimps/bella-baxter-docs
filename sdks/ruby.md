# Ruby SDK

Zero-dependency Ruby client for Bella Baxter. First-class Rails Railtie integration — secrets are available before `database.yml` is evaluated.

## Installation

```ruby
# Gemfile
gem "bella_baxter"
```

```sh
bundle install
```

## Quick Start

```ruby
require "bella_baxter"

client = BellaBaxter::Client.new(
  baxter_url:  ENV["BELLA_BAXTER_URL"],
  api_key:     ENV["BELLA_BAXTER_API_KEY"],
)

secrets = client.all_secrets.secrets
puts secrets["DATABASE_URL"]
```

## Rails Integration

Add `bella_baxter` to your Gemfile. The Railtie automatically loads secrets before Rails initialises its configuration, so `ENV["DATABASE_URL"]` is available in `database.yml` and all initializers.

```ruby
# config/initializers/bella_baxter.rb (optional override)
BellaBaxter.configure do |c|
  c.baxter_url = ENV["BELLA_BAXTER_URL"]
  c.api_key    = ENV["BELLA_BAXTER_API_KEY"]
end
```

→ [Full Rails sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/ruby/samples/04-rails)

## Zero-Knowledge Encryption (ZKE)

By default the SDK generates a fresh P-256 keypair per request (ephemeral E2EE). With ZKE you supply a **persistent device key** — the server audits which host fetched each secret and the SDK caches the wrapped DEK.

**Generate your device key once:**

```sh
bella auth setup   # stores in OS keychain; copy the printed PEM
```

**Use it in your app:**

```ruby
client = BellaBaxter::Client.new(
  baxter_url:  ENV["BELLA_BAXTER_URL"],
  api_key:     ENV["BELLA_BAXTER_API_KEY"],
  # Optional — reads BELLA_BAXTER_PRIVATE_KEY env var automatically
  private_key: ENV["BELLA_BAXTER_PRIVATE_KEY"],
  on_wrapped_dek_received: ->(project, env, wrapped_dek, lease_expires) {
    puts "DEK for #{project}/#{env} expires #{lease_expires}"
  }
)
```

**Rails:** just set the environment variable — the Railtie reads `BELLA_BAXTER_PRIVATE_KEY` automatically. No code changes needed.

```sh
export BELLA_BAXTER_PRIVATE_KEY="$(cat ~/.bella/device-key.pem)"
```

If the variable is not set the SDK falls back to ephemeral E2EE — fully backward-compatible.

## Typed Secrets

```sh
bella secrets generate ruby
```

Generates a `AppSecrets` struct class with typed accessors.

→ [Full typed secrets sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/ruby/samples/05-typed-secrets)

## All Samples

| Sample | Pattern | Link |
|--------|---------|------|
| `01-dotenv-file` | `bella pull` → dotenv gem | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/ruby/samples/01-dotenv-file) |
| `02-process-inject` | `bella run -- ruby app.rb` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/ruby/samples/02-process-inject) |
| `03-standalone` | SDK in standalone Ruby script | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/ruby/samples/03-standalone) |
| `04-rails` | SDK via Railtie (auto-load) | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/ruby/samples/04-rails) |
| `05-typed-secrets` | Generated typed AppSecrets | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/ruby/samples/05-typed-secrets) |
