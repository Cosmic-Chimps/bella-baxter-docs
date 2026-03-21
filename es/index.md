---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Bella Baxter"
  text: "Gestor Unificado de Secretos"
  tagline: Conecta tu propio Vault, AWS Secrets Manager, Azure Key Vault o GCP Secret Manager — y gestiona todo desde un solo lugar.
  image:
    src: /logo.svg
    alt: Bella Baxter
  actions:
    - theme: brand
      text: Comenzar
      link: /es/getting-started/
    - theme: alt
      text: Ver en GitHub
      link: https://github.com/cosmic-chimps/bella-baxter
    - theme: alt
      text: Referencia API
      link: /api-reference/

features:
  - icon: 🔐
    title: Tu Infraestructura, Tus Reglas
    details: Bella Baxter nunca almacena tus secretos. Se conecta a los almacenes de secretos que ya operas — Vault/OpenBao, AWS, Azure, GCP — y actúa como proxy unificado.
  - icon: ⚡
    title: Experiencia de Desarrollador Sin Fricciones
    details: Obtén secretos con un solo comando. Ejecuta cualquier proceso con secretos inyectados. Sin archivos .env comprometidos ni credenciales en el YAML de CI/CD.
  - icon: 🌐
    title: SDKs Multi-Lenguaje
    details: SDKs oficiales para JavaScript/TypeScript, .NET, Python, Go, Ruby, PHP, Swift, Java, Dart y Ansible. Todos con generación de código de secretos tipados.
  - icon: 🔑
    title: Autenticación Sin Credenciales
    details: GitHub Actions, Kubernetes y cualquier carga de trabajo compatible con OIDC pueden autenticarse sin claves API estáticas. Los trust domains verifican la identidad automáticamente.
  - icon: 🛡️
    title: Autoridad de Certificados SSH
    details: Emite certificados SSH de corta duración en lugar de distribuir claves estáticas. Se integra con tu instancia de Vault. Los desarrolladores firman con bella ssh sign.
  - icon: 🔔
    title: Webhooks y Notificaciones
    details: Recibe notificaciones en Slack, Discord, Teams o Telegram cuando los secretos cambian, los arrendamientos expiran o los análisis de seguridad detectan problemas.
  - icon: 🤖
    title: Integración MCP / IA
    details: Expón Bella Baxter como servidor MCP para Claude, GitHub Copilot y Cursor. Los agentes de IA pueden gestionar secretos de forma segura en tu nombre.
  - icon: 📊
    title: Inteligencia de Seguridad
    details: Análisis automatizados de contraseñas débiles, credenciales expuestas y violaciones de políticas. Un panel de seguridad para que nada se escape.
  - icon: 🏗️
    title: .NET Aspire Nativo
    details: Integración de primera clase con .NET Aspire. Agrega Bella Baxter a tu AppHost con una línea y todos los servicios obtienen secretos automáticamente.
---

## ¿Por qué Bella Baxter?

Las herramientas existentes de gestión de secretos bloquean las funciones que realmente necesitas detrás de planes costosos por usuario, o te obligan a usar su infraestructura.

Bella Baxter fue construida diferente:

- **Proyectos y entornos ilimitados** — sin límites artificiales
- **Tu propia infraestructura** — conecta Vault, AWS, Azure o GCP. Tú eres dueño de tus datos.
- **Gratis para comenzar** — 10,000 peticiones API por mes incluidas, sin tarjeta de crédito
- **Auto-alojable** — ejecútalo tú mismo con Docker o .NET Aspire, siempre gratis bajo ELv2

---

## Inicio Rápido

```sh
# Instalar la CLI
curl -sSL https://install.bella-baxter.io | sh

# Iniciar sesión
bella login

# Obtener secretos en tu shell actual
bella pull

# O ejecutar un comando con secretos inyectados
bella run -- npm start
```

[→ Guía completa de inicio](/es/getting-started/)
