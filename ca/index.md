---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Bella Baxter"
  text: "Gestor unificat de secrets"
  tagline: Connecta el teu propi Vault, AWS Secrets Manager, Azure Key Vault o GCP Secret Manager — i gestiona-ho tot des d'un sol lloc.
  image:
    src: /logo.svg
    alt: Bella Baxter
  actions:
    - theme: brand
      text: Comença
      link: /ca/getting-started/
    - theme: alt
      text: Mira-ho a GitHub
      link: https://github.com/cosmic-chimps/bella-baxter
    - theme: alt
      text: Referència de l'API
      link: /ca/api-reference/

features:
  - icon: 🔐
    title: La teva infraestructura, les teves regles
    details: Bella Baxter es connecta als magatzems de secrets que ja operes — Vault/OpenBao, AWS, Azure, GCP — i fa de passarel·la unificada. Els valors dels teus propis magatzems no es desen a la base de dades de Bella.
  - icon: ⚡
    title: Experiència de desenvolupador sense fricció
    details: Obtén secrets amb una sola ordre. Executa qualsevol procés amb els secrets injectats. Sense fitxers .env publicats per error ni credencials al YAML de CI/CD.
  - icon: 🌐
    title: SDKs multillenguatge
    details: SDKs oficials per a JavaScript/TypeScript, .NET, Python, Go, Ruby, PHP, Swift, Java, Dart i Ansible. Tots amb generació de codi de secrets tipats.
  - icon: 🔑
    title: Autenticació sense credencials
    details: GitHub Actions, Kubernetes i qualsevol càrrega de treball compatible amb OIDC poden autenticar-se sense API keys estàtiques. Els trust domains verifiquen la identitat automàticament.
  - icon: 🛡️
    title: Autoritat de certificats SSH
    details: Emet certificats SSH de curta durada en lloc de distribuir claus estàtiques. S'integra amb la teva instància de Vault. Els desenvolupadors signen amb bella ssh sign.
  - icon: 🔔
    title: Webhooks i notificacions
    details: Rep notificacions a Slack, Discord, Teams o Telegram quan els secrets canvien, els leases caduquen o les anàlisis de seguretat detecten problemes.
  - icon: 🤖
    title: Integració MCP / IA
    details: Exposa Bella Baxter com a servidor MCP per a Claude, GitHub Copilot i Cursor. Els agents d'IA poden gestionar secrets de manera segura en nom teu.
  - icon: 📊
    title: Intel·ligència de seguretat
    details: Anàlisis automatitzades de contrasenyes febles, credencials exposades i violacions de polítiques. Un tauler de seguretat perquè no se't escapi res.
  - icon: 🏗️
    title: .NET Aspire natiu
    details: Integració de primera classe amb .NET Aspire. Afegeix Bella Baxter al teu AppHost amb una sola línia i tots els serveis obtenen els secrets automàticament.
---

## Per què Bella Baxter?

Les eines existents de gestió de secrets tanquen les funcions que realment necessites darrere de plans cars per usuari, o t'obliguen a fer servir la seva infraestructura.

Bella Baxter s'ha construït diferent:

- **Projectes i entorns il·limitats** — sense límits artificials
- **La teva pròpia infraestructura** — connecta Vault, AWS, Azure o GCP. Les dades són teves.
- **Gratis per començar** — 2.000 peticions a l'API per mes incloses, sense targeta de crèdit
  Quan s'esgota la quota gratuïta i no hi ha cap mètode de pagament registrat, les peticions amb API key retornen `429` fins que n'afegeixis un. Iniciar la sessió a la consola o al CLI no es mesura.
- **Autoallotjable** — executa'l tu mateix amb Docker o .NET Aspire, sempre gratis sota ELv2

---

## Inici ràpid

```sh
# Instal·lar la CLI
curl -sSfL https://github.com/Cosmic-Chimps/bella-baxter-cli/releases/latest/download/install-bella.sh | bash

# Iniciar la sessió
bella login

# Obtenir secrets a la teva shell actual
bella pull

# O executar una ordre amb secrets injectats
bella run -- npm start
```

[→ Guia completa d'inici](/ca/getting-started/)
