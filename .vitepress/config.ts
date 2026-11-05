import { defineConfig } from 'vitepress';

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
      { text: 'Team Members', link: '/features/team-members' },
      { text: 'Single Sign-On', link: '/features/sso' },
      { text: 'SSH Certificate Authority', link: '/features/ssh-ca' },
      { text: 'PKI Certificates', link: '/features/pki-certificates' },
      { text: 'TOTP', link: '/features/totp' },
      { text: 'Keyless / Workload Identity', link: '/features/keyless' },
      { text: 'Secret Leases', link: '/features/secret-leases' },
      { text: 'Dynamic Secrets', link: '/features/dynamic-secrets' },
      { text: 'Secure Shares', link: '/features/secure-shares' },
      { text: 'Webhooks', link: '/features/webhooks' },
      { text: 'Notifications', link: '/features/notifications' },
      {
        text: 'Security Intelligence',
        link: '/features/security-intelligence',
      },
      { text: 'Zero-Knowledge Encryption', link: '/features/e2ee-zke' },
      { text: 'Audit Logs', link: '/audit/' },
    ],
  },
  {
    text: 'Integrations',
    items: [
      { text: 'GitHub Actions', link: '/integrations/github-actions' },
      { text: 'MCP / AI', link: '/integrations/mcp-ai' },
      { text: 'AI Coding Agents', link: '/integrations/ai-coding-agents' },
    ],
  },
  { text: 'API Reference', link: '/api-reference/' },
  { text: 'Source-available', link: '/open-source/' },
  { text: 'Console →', link: 'https://console.bella-baxter.io' },
];

const enSidebar = {
  '/getting-started/': [
    {
      text: 'Getting Started',
      items: [
        { text: 'Quick Start', link: '/getting-started/' },
        { text: 'Core Concepts', link: '/getting-started/concepts' },
        { text: 'Self-Hosting', link: '/getting-started/self-hosting' },
      ],
    },
  ],
  '/cli/': [
    {
      text: 'CLI Reference',
      items: [{ text: 'Overview', link: '/cli/' }],
    },
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
      ],
    },
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
        { text: 'Team Members', link: '/features/team-members' },
        { text: 'Single Sign-On', link: '/features/sso' },
      ],
    },
    {
      text: 'Advanced Features',
      items: [
        { text: 'SSH Certificate Authority', link: '/features/ssh-ca' },
        { text: 'PKI Certificates', link: '/features/pki-certificates' },
        { text: 'TOTP / 2FA Keys', link: '/features/totp' },
        { text: 'Keyless / Workload Identity', link: '/features/keyless' },
        { text: 'Workload Identity on EC2', link: '/features/spiffe-ec2' },
        { text: 'Secret Leases', link: '/features/secret-leases' },
        { text: 'Dynamic Secrets', link: '/features/dynamic-secrets' },
        { text: 'Secure Shares', link: '/features/secure-shares' },
        { text: 'Webhooks', link: '/features/webhooks' },
        { text: 'Notifications', link: '/features/notifications' },
        {
          text: 'Security Intelligence',
          link: '/features/security-intelligence',
        },
        { text: 'Zero-Knowledge Encryption', link: '/features/e2ee-zke' },
        { text: 'Audit Logs', link: '/audit/' },
      ],
    },
  ],
  '/integrations/': [
    {
      text: 'Integrations',
      items: [
        { text: 'GitHub Actions', link: '/integrations/github-actions' },
        { text: 'MCP / AI Integration', link: '/integrations/mcp-ai' },
        { text: 'AI Coding Agents', link: '/integrations/ai-coding-agents' },
      ],
    },
  ],
  '/open-source/': [
    {
      text: 'Source-available',
      items: [
        { text: 'Community vs Enterprise', link: '/open-source/' },
        {
          text: 'Enterprise Features',
          link: '/open-source/enterprise-features',
        },
      ],
    },
  ],
};

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
      { text: 'API keys', link: '/es/features/api-keys' },
    ],
  },
  {
    text: 'Integraciones',
    items: [
      { text: 'GitHub Actions', link: '/es/integrations/github-actions' },
      { text: 'MCP / IA', link: '/es/integrations/mcp-ai' },
      { text: 'Agentes de programación', link: '/es/integrations/ai-coding-agents' },
    ],
  },
  { text: 'Referencia API', link: '/api-reference/' },
  { text: 'Source-available', link: '/es/open-source/' },
  { text: 'Consola →', link: 'https://console.bella-baxter.io' },
];

const esSidebar = {
  '/es/getting-started/': [
    {
      text: 'Primeros Pasos',
      items: [
        { text: 'Inicio Rápido', link: '/es/getting-started/' },
        { text: 'Conceptos Clave', link: '/es/getting-started/concepts' },
        { text: 'Auto-alojamiento', link: '/es/getting-started/self-hosting' },
      ],
    },
  ],
  '/es/cli/': [
    {
      text: 'CLI',
      items: [{ text: 'Referencia CLI', link: '/es/cli/' }],
    },
  ],
  '/es/sdks/': [
    {
      text: 'SDKs',
      items: [{ text: 'Resumen', link: '/es/sdks/' }],
    },
  ],
  '/es/features/': [
    {
      text: 'Funcionalidades',
      items: [
        { text: 'Secretos', link: '/es/features/secrets' },
        { text: 'Proveedores', link: '/es/features/providers' },
        { text: 'Proyectos', link: '/es/features/projects' },
        { text: 'Entornos', link: '/es/features/environments' },
        { text: 'API keys', link: '/es/features/api-keys' },
        { text: 'SPIFFE y ZKE', link: '/es/features/spiffe-zke' },
      ],
    },
  ],
  '/es/integrations/': [
    {
      text: 'Integraciones',
      items: [
        { text: 'GitHub Actions', link: '/es/integrations/github-actions' },
        { text: 'MCP / IA', link: '/es/integrations/mcp-ai' },
        { text: 'Agentes de programación', link: '/es/integrations/ai-coding-agents' },
      ],
    },
  ],
  '/es/audit/': [
    {
      text: 'Auditoría',
      items: [{ text: 'Logs de Auditoría', link: '/es/audit/' }],
    },
  ],
  '/es/open-source/': [
    {
      text: 'Source-available',
      items: [{ text: 'Comunidad vs Enterprise', link: '/es/open-source/' }],
    },
  ],
};

// Catalan (#1478). Only the pages that are really translated live under /ca/.
// The six feature pages, github-actions and open-source are untranslated stubs in
// `es`; Catalan carries no stubs, so those entries point at the English page.
const caNav = [
  { text: 'Primers passos', link: '/ca/getting-started/' },
  { text: 'CLI', link: '/ca/cli/' },
  { text: 'SDKs', link: '/ca/sdks/' },
  {
    text: 'Funcionalitats',
    items: [
      { text: 'Secrets', link: '/features/secrets' },
      { text: 'Proveïdors', link: '/features/providers' },
      { text: 'Projectes', link: '/features/projects' },
      { text: 'Entorns', link: '/features/environments' },
      { text: 'API keys', link: '/features/api-keys' },
      { text: 'SPIFFE i ZKE', link: '/ca/features/spiffe-zke' },
    ],
  },
  {
    text: 'Integracions',
    items: [
      { text: 'GitHub Actions', link: '/integrations/github-actions' },
      { text: 'MCP / IA', link: '/ca/integrations/mcp-ai' },
      { text: 'Agents de programació', link: '/ca/integrations/ai-coding-agents' },
    ],
  },
  { text: "Referència de l'API", link: '/ca/api-reference/' },
  { text: 'Source-available', link: '/open-source/' },
  { text: 'Consola →', link: 'https://console.bella-baxter.io' },
];

const caSidebar = {
  '/ca/getting-started/': [
    {
      text: 'Primers passos',
      items: [
        { text: 'Inici ràpid', link: '/ca/getting-started/' },
        { text: 'Conceptes clau', link: '/ca/getting-started/concepts' },
        { text: 'Autoallotjament', link: '/ca/getting-started/self-hosting' },
      ],
    },
  ],
  '/ca/cli/': [
    {
      text: 'CLI',
      items: [{ text: 'Referència de la CLI', link: '/ca/cli/' }],
    },
  ],
  '/ca/sdks/': [
    {
      text: 'SDKs',
      items: [{ text: 'Resum', link: '/ca/sdks/' }],
    },
  ],
  '/ca/features/': [
    {
      text: 'Funcionalitats',
      items: [
        { text: 'Secrets', link: '/features/secrets' },
        { text: 'Proveïdors', link: '/features/providers' },
        { text: 'Projectes', link: '/features/projects' },
        { text: 'Entorns', link: '/features/environments' },
        { text: 'API keys', link: '/features/api-keys' },
        { text: 'SPIFFE i ZKE', link: '/ca/features/spiffe-zke' },
      ],
    },
  ],
  '/ca/integrations/': [
    {
      text: 'Integracions',
      items: [
        { text: 'GitHub Actions', link: '/integrations/github-actions' },
        { text: 'MCP / IA', link: '/ca/integrations/mcp-ai' },
        { text: 'Agents de programació', link: '/ca/integrations/ai-coding-agents' },
      ],
    },
  ],
  '/ca/audit/': [
    {
      text: 'Auditoria',
      items: [{ text: "Logs d'auditoria", link: '/ca/audit/' }],
    },
  ],
  '/ca/api-reference/': [
    {
      text: 'API',
      items: [{ text: "Referència de l'API", link: '/ca/api-reference/' }],
    },
  ],
};

export default defineConfig({
  title: 'Bella Baxter',
  description:
    'Unified secret management gateway — connect your own Vault, AWS, Azure, or GCP and manage secrets from one place.',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'og:type', content: 'website' }],
    [
      'meta',
      { name: 'og:title', content: 'Bella Baxter — Secret Management Gateway' },
    ],
    [
      'meta',
      {
        name: 'og:description',
        content:
          'Unified secret management gateway — connect your own Vault, AWS, Azure, or GCP.',
      },
    ],
    // Security headers as meta equivalents (GitHub Pages cannot set HTTP response headers).
    // Full enforcement (HSTS, X-Frame-Options) requires Cloudflare or a CDN in front.
    ['meta', { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' }],
    [
      'meta',
      {
        'http-equiv': 'Referrer-Policy',
        content: 'strict-origin-when-cross-origin',
      },
    ],
    ['meta', { name: 'referrer', content: 'strict-origin-when-cross-origin' }],
    [
      'meta',
      {
        'http-equiv': 'Permissions-Policy',
        content: 'geolocation=(), microphone=(), camera=()',
      },
    ],
    [
      'meta',
      {
        'http-equiv': 'Content-Security-Policy',
        content:
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; connect-src 'self' https:; object-src 'none'; frame-ancestors 'none'; base-uri 'self';",
      },
    ],
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
      },
    },
    es: {
      label: 'Español',
      lang: 'es',
      title: 'Bella Baxter',
      description: 'Gestor unificado de secretos',
      themeConfig: {
        nav: esNav,
        sidebar: esSidebar,
      },
    },
    ca: {
      label: 'Català',
      lang: 'ca',
      title: 'Bella Baxter',
      description: 'Passarel·la unificada de gestió de secrets',
      themeConfig: {
        nav: caNav,
        sidebar: caSidebar,
      },
    },
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
      provider: 'local',
    },
  },

  vite: {},
});
