# Ruby SDK

Ruby client for Bella Baxter, built on the Kiota client libraries and Faraday. Requires Ruby 4.0+. A Rails Railtie is included — secrets are available before `database.yml` is evaluated.

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

## Device-bound encryption

By default the SDK generates an ephemeral P-256 keypair (ephemeral E2EE). With device-bound encryption the app presents a **persistent device key**. The server audits which host fetched each secret. The SDK passes the wrapped DEK it receives to your `on_wrapped_dek_received` callback, so you can cache it.

**Create a device key once, on each machine:**

```sh
bella auth setup
```

This creates a P-256 key on the machine, stores it encrypted under `~/.config/bella-cli`, and registers the public half with Bella. It prints the device's fingerprint, not the key. The private key stays on the machine.

**Run your app under `bella sdk run`:**

```sh
bella sdk run -- bundle exec rails server
```

`bella sdk run` sets `BELLA_BAXTER_PRIVATE_KEY` in the process it starts. The client and the Rails Railtie read that variable, so you need no code change. If you sign in with an API key (`bax-...`), the CLI sets it only when the server confirms that this machine's device is the one recorded against the key.

To receive the wrapped DEK, add a callback. `private_key` takes a PEM; when it is not set, the client reads `BELLA_BAXTER_PRIVATE_KEY`:

```ruby
client = BellaBaxter::Client.new(
  baxter_url:  ENV["BELLA_BAXTER_URL"],
  api_key:     ENV["BELLA_BAXTER_API_KEY"],
  private_key: ENV["BELLA_BAXTER_PRIVATE_KEY"],
  on_wrapped_dek_received: ->(project, env, wrapped_dek, lease_expires) {
    puts "DEK for #{project}/#{env} expires #{lease_expires}"
  }
)
```

If no device key is set, the SDK uses ephemeral E2EE.

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
