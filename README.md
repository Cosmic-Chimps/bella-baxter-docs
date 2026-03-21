# Bella Baxter Documentation

[![Deploy docs to GitHub Pages](https://github.com/Cosmic-Chimps/bella-baxter-docs/actions/workflows/deploy.yml/badge.svg)](https://github.com/Cosmic-Chimps/bella-baxter-docs/actions/workflows/deploy.yml)

Public documentation site for [Bella Baxter](https://github.com/cosmic-chimps/bella-baxter) — the unified secret management gateway.

Built with [VitePress](https://vitepress.dev) and [Scalar](https://scalar.com) for interactive API docs.

## Development

```sh
# Install dependencies
pnpm install

# Start dev server (hot reload)
pnpm docs:dev

# Build for production
pnpm docs:build

# Preview production build
pnpm docs:preview
```

The dev server starts at `http://localhost:5173`.

## Structure

```
public-docs/
├── .vitepress/          # VitePress config + custom theme
│   ├── config.ts        # Site config, nav, sidebar, i18n
│   └── theme/           # Custom styles (brand colors)
├── public/              # Static assets (logo.svg, favicon.ico)
├── index.md             # EN home / hero page
├── getting-started/     # Quick start, concepts, self-hosting
├── cli/                 # CLI reference
├── sdks/                # SDK docs (10 languages)
├── features/            # Feature documentation (15 pages)
├── integrations/        # GitHub Actions, MCP/AI
├── audit/               # Audit logs
├── api-reference/       # Interactive API docs (Scalar)
├── open-source/         # Community vs Enterprise
└── es/                  # Spanish translations (mirror of EN)
```

## i18n

- **English** — root (`/`) — fully written
- **Spanish** — `/es/` prefix — home + getting-started fully translated, other pages are stubs linking to EN

## API Reference

The API reference page embeds [Scalar](https://scalar.com) via CDN.

By default it loads the spec from `http://localhost:5522/openapi.json`.

To point at a different instance, append `?url=`:

```
/api-reference/?url=https://api.your-instance.bella-baxter.io/openapi.json
```

## Deployment

The build output is in `.vitepress/dist/` — a static site deployable to any CDN:

```sh
pnpm docs:build
# Upload .vitepress/dist/ to Cloudflare Pages, Netlify, or GitHub Pages
```

### Cloudflare Pages

Set:
- Build command: `pnpm docs:build`
- Build output directory: `.vitepress/dist`

### GitHub Pages

Set:
- Build command: `pnpm --prefix public-docs docs:build`
- Pages source: `public-docs/.vitepress/dist`

---

<div align="center">

Made with ❤️ by **[Cosmic Chimps](https://cosmic-chimps.com)**

[⬆ Back to Top](#)

</div>

