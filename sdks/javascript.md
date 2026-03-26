# JavaScript / TypeScript SDK

The `@bella-baxter/sdk` package works in Node.js and supports all major frameworks.

## Installation

::: code-group

```sh [npm]
npm install @bella-baxter/sdk
```

```sh [pnpm]
pnpm add @bella-baxter/sdk
```

```sh [yarn]
yarn add @bella-baxter/sdk
```

:::

## Quick Start

```typescript
import { BaxterClient } from '@bella-baxter/sdk'

const client = new BaxterClient({
  baxterUrl: process.env.BELLA_BAXTER_URL!,
  apiKey: process.env.BELLA_BAXTER_API_KEY!,
})

const secrets = await client.getAllSecrets()
console.log(secrets.DATABASE_URL)
```

## Framework Integrations

All samples are available on GitHub — each one shows a teaser pattern below.

### Express

```typescript
// Load secrets before creating the app
const secrets = await client.getAllSecrets()
const app = express()
app.get('/health', (req, res) => res.json({ db: secrets.DATABASE_URL }))
```

→ [Full Express sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/03-express)

### NestJS

```typescript
// In your AppModule bootstrap
const secrets = await client.getAllSecrets()
Object.entries(secrets).forEach(([k, v]) => process.env[k] = v)
```

→ [Full NestJS sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/04-nestjs)

### Next.js

```typescript
// next.config.js — load secrets before Next starts
import { loadSecretsToEnv } from '@bella-baxter/sdk'
await loadSecretsToEnv()
```

→ [Full Next.js sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/05-nextjs)

### Fastify

```typescript
await fastify.register(bellaPlugin)
fastify.get('/db', (req, reply) => reply.send({ url: fastify.secrets.DATABASE_URL }))
```

→ [Full Fastify sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/06-fastify)

## Zero-Knowledge Encryption (ZKE)

By default the SDK generates a fresh P-256 keypair for every secrets request (ephemeral E2EE over TLS). With ZKE you supply a **persistent device key** — the server can then audit _which device_ fetched each secret and the SDK caches the wrapped DEK to reduce round-trips.

**Generate your device key once:**

```sh
bella auth setup   # stores key in OS keychain and prints the PEM
```

**Use it in your app:**

```typescript
import { BaxterClient } from '@bella-baxter/sdk'

const client = new BaxterClient({
  baxterUrl: process.env.BELLA_BAXTER_URL!,
  apiKey: process.env.BELLA_BAXTER_API_KEY!,
  // Optional — reads BELLA_BAXTER_PRIVATE_KEY env var automatically
  privateKey: process.env.BELLA_BAXTER_PRIVATE_KEY,
  onWrappedDekReceived(project, env, wrappedDek, leaseExpires) {
    // Optional: cache the wrapped DEK for faster re-auth
    console.log(`DEK for ${project}/${env} expires ${leaseExpires}`)
  },
})
```

Or via environment variable (recommended):

```sh
export BELLA_BAXTER_PRIVATE_KEY="$(cat ~/.bella/device-key.pem)"
```

The SDK auto-reads `BELLA_BAXTER_PRIVATE_KEY` — no code change needed. If the variable is not set the SDK falls back to ephemeral E2EE, so this is fully backward-compatible.

## Typed Secrets

```sh
bella secrets generate typescript
```

Generates a `secrets.ts` file with typed properties. No more `process.env.MY_SECRET as string`.

## All Samples

| Sample | Pattern | Link |
|--------|---------|------|
| `01-dotenv-file` | `bella pull` → read `.env` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/01-dotenv-file) |
| `02-process-inject` | `bella run -- node index.js` | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/02-process-inject) |
| `03-express` | SDK in Express middleware | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/03-express) |
| `04-nestjs` | SDK in NestJS bootstrap | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/04-nestjs) |
| `05-nextjs` | SDK in next.config.js | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/05-nextjs) |
| `06-fastify` | SDK as Fastify plugin | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/06-fastify) |
| `07-adonisjs` | SDK in AdonisJS provider | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/07-adonisjs) |
