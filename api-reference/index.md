---
title: API Reference
---

# API Reference

Interactive API documentation powered by [Scalar](https://scalar.com).

<div id="api-reference"></div>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const apiUrl = urlParams.get('url') || 'http://localhost:5522/openapi.json'

  const script = document.createElement('script')
  script.id = 'api-reference-script'
  script.setAttribute('data-url', apiUrl)
  script.setAttribute('data-theme', 'default')
  script.src = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest/dist/browser/standalone.min.js'
  document.getElementById('api-reference').appendChild(script)
})
</script>

::: tip Connecting to a different instance
Append `?url=https://your-instance.bella-baxter.io/openapi.json` to this page URL to load the spec from your own instance.
:::

::: info Authentication
All API endpoints require either:
- **Bearer token** — `Authorization: Bearer <jwt>` (from `bella login`)
- **HMAC API Key** — `Authorization: BaxterHmac ...` (from `bella login --api-key`)

Use the **Authorize** button in the Scalar UI to set your credentials.
:::

<style>
.api-reference-page .VPDoc {
  padding: 0 !important;
  max-width: 100% !important;
}
</style>
