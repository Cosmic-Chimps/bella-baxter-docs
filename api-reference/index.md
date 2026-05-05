---
title: API Reference
---

# API Reference

Interactive API documentation powered by [Scalar](https://scalar.com).

<div style="display:flex;gap:0.75rem;margin-bottom:1.5rem;flex-wrap:wrap">
  <a href="https://api.scalar.com/redirect?url=https://docs.bella-baxter.io/openapi.json" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.4rem 1rem;background:#1a1a1a;color:#fff;border-radius:6px;font-size:0.875rem;text-decoration:none;font-weight:500">↗ Open in Scalar</a>
  <a href="/openapi.json" download style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.4rem 1rem;border:1px solid #ccc;border-radius:6px;font-size:0.875rem;text-decoration:none;font-weight:500">⬇ Download OpenAPI spec</a>
</div>

<div id="api-reference"></div>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const apiUrl = urlParams.get('url') || 'https://docs.bella-baxter.io/openapi.json'

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
