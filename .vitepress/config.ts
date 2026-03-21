import { defineConfig } from 'vitepress'

const enNav = [
  { text: 'Getting Started', link: '/getting-started/' },
  { text: 'CLI', link: '/cli/' },
  { text: 'SDKs', link: '/sdks/' },
  {
    text: 'Features',
    items: [
      { text: 'Secrets', link: '/features/secrets' },
      { text: 'Providers', link: '/features/providers' },
      { text: 'Projects', link: '/features/projects' },
      { text: 'Environments', link: '/features/environments' },
      { text: 'API Keys', link: '/features/api-keys' },
      { text: 'Groups', link: '/features/groups' },
      { text: 'SSH Certificate Authority', link: '/features/ssh-ca' },
      { text: 'TOTP', link: '/features/totp' },
      { text: 'Keyless / Workload Identity', link: '/features/keyless' },
      { text: 'Secret Leases', link: '/features/secret-leases' },
      { text: 'Dynamic Secrets', link: '/features/dynamic-secrets' },
      { text: 'Secure Shares', link: '/features/secure-shares' },
      { text: 'Webhooks', link: '/features/webhooks' },
      { text: 'Notifications', link: '/features/notifications' },
      { text: 'Security Intelligence', link: '/features/security-intelligence' },
      { text: 'Audit Logs', link: '/audit/' },
    ]
  },
  {
    text: 'Integrations',
    items: [
      { text: 'GitHub Actions', link: '/integrations/github-actions' },
      { text: 'MCP / AI', link: '/integrations/mcp-ai' },
    ]
  },
  { text: 'API Reference', link: '/api-reference/' },
  { text: 'Open Source', link: '/open-source/' },
  { text: 'Console →', link: 'https://app.bella-baxter.io' },
]

const enSidebar = {
  '/getting-started/': [
    {
      text: 'Getting Started',
      items: [
        { text: 'Quick Start', link: '/getting-started/' },
        { text: 'Core Concepts', link: '/getting-started/concepts' },
        { text: 'Self-Hosting', link: '/getting-started/self-hosting' },
      ]
    }
  ],
  '/cli/': [
    {
      text: 'CLI Reference',
      items: [
        { text: 'Overview', link: '/cli/' },
      ]
    }
  ],
  '/sdks/': [
    {
      text: 'SDKs',
      items: [
        { text: 'Overview', link: '/sdks/' },
        { text: 'JavaScript / TypeScript', link: '/sdks/javascript' },
        { text: '.NET', link: '/sdks/dotnet' },
        { text: 'Python', link: '/sdks/python' },
        { text: 'Go', link: '/sdks/go' },
        { text: 'Ruby', link: '/sdks/ruby' },
        { text: 'PHP', link: '/sdks/php' },
        { text: 'Swift', link: '/sdks/swift' },
        { text: 'Java', link: '/sdks/java' },
        { text: 'Dart / Flutter', link: '/sdks/dart' },
        { text: 'Ansible', link: '/sdks/ansible' },
      ]
    }
  ],
  '/features/': [
    {
      text: 'Core Features',
      items: [
        { text: 'Secrets', link: '/features/secrets' },
        { text: 'Providers', link: '/features/providers' },
        { text: 'Projects', link: '/features/projects' },
        { text: 'Environments', link: '/features/environments' },
        { text: 'API Keys', link: '/features/api-keys' },
        { text: 'Groups', link: '/features/groups' },
      ]
    },
    {
      text: 'Advanced Features',
      items: [
        { text: 'SSH Certificate Authority', link: '/features/ssh-ca' },
        { text: 'TOTP / 2FA Keys', link: '/features/totp' },
        { text: 'Keyless / Workload Identity', link: '/features/keyless' },
        { text: 'Secret Leases', link: '/features/secret-leases' },
        { text: 'Dynamic Secrets', link: '/features/dynamic-secrets' },
        { text: 'Secure Shares', link: '/features/secure-shares' },
        { text: 'Webhooks', link: '/features/webhooks' },
        { text: 'Notifications', link: '/features/notifications' },
        { text: 'Security Intelligence', link: '/features/security-intelligence' },
        { text: 'Audit Logs', link: '/audit/' },
      ]
    }
  ],
  '/integrations/': [
    {
      text: 'Integrations',
      items: [
        { text: 'GitHub Actions', link: '/integrations/github-actions' },
        { text: 'MCP / AI Integration', link: '/integrations/mcp-ai' },
      ]
    }
  ],
  '/open-source/': [
    {
      text: 'Open Source',
      items: [
        { text: 'Community vs Enterprise', link: '/open-source/' },
        { text: 'Enterprise Features', link: '/open-source/enterprise-features' },
      ]
    }
  ],
}

const esNav = [
  { text: 'Primeros Pasos', link: '/es/getting-started/' },
  { text: 'CLI', link: '/es/cli/' },
  { text: 'SDKs', link: '/es/sdks/' },
  {
    text: 'Funcionalidades',
    items: [
      { text: 'Secretos', link: '/es/features/secrets' },
      { text: 'Proveedores', link: '/es/features/providers' },
      { text: 'Proyectos', link: '/es/features/projects' },
      { text: 'Entornos', link: '/es/features/environments' },
      { text: 'Claves API', link: '/es/features/api-keys' },
    ]
  },
  {
    text: 'Integraciones',
    items: [
      { text: 'GitHub Actions', link: '/es/integrations/github-actions' },
      { text: 'MCP / IA', link: '/es/integrations/mcp-ai' },
    ]
  },
  { text: 'Referencia API', link: '/api-reference/' },
  { text: 'Open Source', link: '/es/open-source/' },
  { text: 'Consola →', link: 'https://app.bella-baxter.io' },
]

const esSidebar = {
  '/es/getting-started/': [
    {
      text: 'Primeros Pasos',
      items: [
        { text: 'Inicio Rápido', link: '/es/getting-started/' },
        { text: 'Conceptos Clave', link: '/es/getting-started/concepts' },
        { text: 'Auto-alojamiento', link: '/es/getting-started/self-hosting' },
      ]
    }
  ],
  '/es/cli/': [
    {
      text: 'CLI',
      items: [
        { text: 'Referencia CLI', link: '/es/cli/' },
      ]
    }
  ],
  '/es/sdks/': [
    {
      text: 'SDKs',
      items: [
        { text: 'Resumen', link: '/es/sdks/' },
      ]
    }
  ],
  '/es/features/': [
    {
      text: 'Funcionalidades',
      items: [
        { text: 'Secretos', link: '/es/features/secrets' },
        { text: 'Proveedores', link: '/es/features/providers' },
        { text: 'Proyectos', link: '/es/features/projects' },
        { text: 'Entornos', link: '/es/features/environments' },
        { text: 'Claves API', link: '/es/features/api-keys' },
      ]
    }
  ],
  '/es/integrations/': [
    {
      text: 'Integraciones',
      items: [
        { text: 'GitHub Actions', link: '/es/integrations/github-actions' },
        { text: 'MCP / IA', link: '/es/integrations/mcp-ai' },
      ]
    }
  ],
  '/es/audit/': [
    {
      text: 'Auditoría',
      items: [
        { text: 'Logs de Auditoría', link: '/es/audit/' },
      ]
    }
  ],
  '/es/open-source/': [
    {
      text: 'Open Source',
      items: [
        { text: 'Comunidad vs Enterprise', link: '/es/open-source/' },
      ]
    }
  ],
}

export default defineConfig({
  title: 'Bella Baxter',
  description: 'Unified secret management gateway — connect your own Vault, AWS, Azure, or GCP and manage secrets from one place.',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: 'Bella Baxter — Secret Management Gateway' }],
    ['meta', { name: 'og:description', content: 'Unified secret management gateway — connect your own Vault, AWS, Azure, or GCP.' }],
    // Security headers as meta equivalents (GitHub Pages cannot set HTTP response headers).
    // Full enforcement (HSTS, X-Frame-Options) requires Cloudflare or a CDN in front.
    ['meta', { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' }],
    ['meta', { 'http-equiv': 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }],
    ['meta', { name: 'referrer', content: 'strict-origin-when-cross-origin' }],
    ['meta', { 'http-equiv': 'Permissions-Policy', content: 'geolocation=(), microphone=(), camera=()' }],
    ['meta', { 'http-equiv': 'Content-Security-Policy', content: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; connect-src 'self' https:; object-src 'none'; frame-ancestors 'none'; base-uri 'self';" }],
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'Bella Baxter',
      description: 'Unified secret management gateway',
      themeConfig: {
        nav: enNav,
        sidebar: enSidebar,
      }
    },
    es: {
      label: 'Español',
      lang: 'es',
      title: 'Bella Baxter',
      description: 'Gestor unificado de secretos',
      themeConfig: {
        nav: esNav,
        sidebar: esSidebar,
      }
    }
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Bella Baxter',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cosmic-chimps/bella-baxter' },
    ],

    footer: {
      message: 'Released under the ELv2 License.',
      copyright: 'Copyright © 2026 Cosmic Chimps',
    },

    search: {
      provider: 'local'
    },
  },

  vite: {
  },
})
