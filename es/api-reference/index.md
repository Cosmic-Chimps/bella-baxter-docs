# Referencia de API

> 🌐 **English version**: [API Reference](/api-reference/)

La referencia interactiva de la API está disponible en inglés.

[→ Ver Referencia de API](/api-reference/)

## Autenticación

Todos los endpoints de la API requieren una de estas opciones:

- **Bearer token**: `Authorization: Bearer <jwt>` (de `bella login`).
- **API key**: una API key (`bax-...`) creada en la consola, en la pestaña **API Keys** de un entorno. Envíala como `Authorization: Bearer bax-...`. O firma cada petición con las cabeceras `X-Bella-Key-Id`, `X-Bella-Timestamp` y `X-Bella-Signature`. Consulta [API keys](/es/features/api-keys).
- **Token de aplicación conectada**: el token de una [aplicación conectada](/es/features/connected-apps) solo se acepta en las tres rutas bajo `/api/v1/connected-apps/` (setup, grant y grant/secrets). Todas las demás rutas lo rechazan.
