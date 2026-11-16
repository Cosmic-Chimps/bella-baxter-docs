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
import { createBellaConfig } from '@bella-baxter/sdk'

const bella = await createBellaConfig({
  baxterUrl: process.env.BELLA_BAXTER_URL!,
  apiKey: process.env.BELLA_BAXTER_API_KEY!,
  projectSlug: 'my-project',        // or set BELLA_BAXTER_PROJECT
  environmentSlug: 'production',    // or set BELLA_BAXTER_ENV
})

console.log(bella.get('DATABASE_URL'))    // string | undefined
console.log(bella.getOrThrow('PORT'))     // throws if the secret is missing
console.log(bella.getAll())               // Record<string, string>

// Write every secret into process.env, for code that reads it directly
bella.intoProcessEnv()

// Stop background polling when your app shuts down
bella.destroy()
```

`createBellaConfig` loads the secrets and keeps them fresh by polling in the background.

If you only want a one-off read, use the lower-level client. `getAllSecrets` takes the project slug and the environment slug. The values are in `.secrets`:

```typescript
import { createBaxterClient } from '@bella-baxter/sdk'

const client = await createBaxterClient({
  baxterUrl: process.env.BELLA_BAXTER_URL!,
  apiKey: process.env.BELLA_BAXTER_API_KEY!,
})

const response = await client.getAllSecrets('my-project', 'production')
console.log(response.secrets.DATABASE_URL)
```

## Framework Integrations

Each framework has its own package. All samples are available on GitHub — each one shows a teaser pattern below.

### Express

```typescript
// npm install @bella-baxter/express
import express from 'express'
import { createBellaMiddleware } from '@bella-baxter/express'

const app = express()
app.use(await createBellaMiddleware({
  baxterUrl: process.env.BELLA_BAXTER_URL!,
  apiKey: process.env.BELLA_BAXTER_API_KEY!,
  projectSlug: 'my-project',
  environmentSlug: 'production',
}))

// The middleware sets req.bella
app.get('/health', (req, res) => res.json({ db: req.bella.get('DATABASE_URL') }))
```

→ [Full Express sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/03-express)

### NestJS

```typescript
// npm install @bella-baxter/nestjs
// app.module.ts
import { BellaModule } from '@bella-baxter/nestjs'

@Module({
  imports: [
    BellaModule.register({
      baxterUrl: process.env.BELLA_BAXTER_URL!,
      apiKey: process.env.BELLA_BAXTER_API_KEY!,
      projectSlug: 'my-project',
      environmentSlug: 'production',
    }),
  ],
})
export class AppModule {}

// your.service.ts
import { BellaConfigService } from '@bella-baxter/nestjs'

@Injectable()
export class YourService {
  constructor(private readonly bella: BellaConfigService) {}

  dbUrl() {
    return this.bella.getOrThrow('DATABASE_URL')
  }
}
```

→ [Full NestJS sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/04-nestjs)

### Next.js

```typescript
// npm install @bella-baxter/next
// instrumentation.ts
import { initBella } from '@bella-baxter/next'

export async function register() {
  await initBella({
    baxterUrl: process.env.BELLA_BAXTER_URL!,
    apiKey: process.env.BELLA_BAXTER_API_KEY!,
    projectSlug: 'my-project',
    environmentSlug: 'production',
  })
}

// Any server component or route handler
import { getBella } from '@bella-baxter/next'

export async function GET() {
  return Response.json({ hasDb: !!getBella().get('DATABASE_URL') })
}
```

This works in the Node.js runtime only, not the Edge runtime.

→ [Full Next.js sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/05-nextjs)

### Fastify

```typescript
// npm install @bella-baxter/fastify
import { bellaPlugin } from '@bella-baxter/fastify'

await fastify.register(bellaPlugin, {
  baxterUrl: process.env.BELLA_BAXTER_URL!,
  apiKey: process.env.BELLA_BAXTER_API_KEY!,
  projectSlug: 'my-project',
  environmentSlug: 'production',
})

// The plugin decorates the instance with `bella`
fastify.get('/db', (req, reply) => reply.send({ url: fastify.bella.get('DATABASE_URL') }))
```

→ [Full Fastify sample](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/06-fastify)

## Zero-Knowledge Encryption (ZKE)

By default the SDK generates a fresh P-256 keypair each time the client starts (ephemeral E2EE over TLS). With ZKE the app presents a **persistent device key**, so the server can audit _which device_ fetched each secret. The SDK passes the wrapped DEK it receives to your `onWrappedDekReceived` callback, so you can cache it.

**Create a device key once, on each machine:**

```sh
bella auth setup
```

This creates a P-256 key on the machine, stores it encrypted under `~/.config/bella-cli`, and registers the public half with Bella. It prints the device's fingerprint, not the key. The private key stays on the machine.

**Run your app under `bella sdk run`:**

```sh
bella sdk run -- node index.js
```

`bella sdk run` sets `BELLA_BAXTER_PRIVATE_KEY` in the process it starts. The SDK reads that variable, so you need no code change. If you sign in with an API key (`bax-...`), the CLI sets it only when the server confirms that this machine's device is the one recorded against the key.

To receive the wrapped DEK, add a callback. `privateKey` takes a PKCS#8 PEM; when it is not set, the SDK reads `BELLA_BAXTER_PRIVATE_KEY`:

```typescript
import { createBaxterClient } from '@bella-baxter/sdk'

const client = await createBaxterClient({
  baxterUrl: process.env.BELLA_BAXTER_URL!,
  apiKey: process.env.BELLA_BAXTER_API_KEY!,
  privateKey: process.env.BELLA_BAXTER_PRIVATE_KEY,
  onWrappedDekReceived(project, env, wrappedDek, leaseExpires) {
    console.log(`DEK for ${project}/${env} expires ${leaseExpires}`)
  },
})
```

If no device key is set, the SDK uses ephemeral E2EE.

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
| `05-nextjs` | SDK in instrumentation.ts | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/05-nextjs) |
| `06-fastify` | SDK as Fastify plugin | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/06-fastify) |
| `07-adonisjs` | SDK in AdonisJS provider | [GitHub](https://github.com/cosmic-chimps/bella-baxter/tree/main/apps/sdk/js/samples/07-adonisjs) |
