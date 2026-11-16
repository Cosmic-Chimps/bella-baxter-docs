# Referència de l'API

> 🌐 **Versió en anglès**: [API Reference](/api-reference/)

La referència interactiva de l'API està disponible en anglès.

[→ Veure la referència de l'API](/api-reference/)

## Autenticació

Tots els endpoints de l'API requereixen una d'aquestes opcions:

- **Bearer token**: `Authorization: Bearer <jwt>` (de `bella login`).
- **API key**: una API key (`bax-...`) creada a la consola, a la pestanya **API Keys** d'un entorn. Envia-la com a `Authorization: Bearer bax-...`. O signa cada petició amb les capçaleres `X-Bella-Key-Id`, `X-Bella-Timestamp` i `X-Bella-Signature`. Consulta [API keys](/features/api-keys).
- **Token d'aplicació connectada**: el token d'una [aplicació connectada](/ca/features/connected-apps) només s'accepta a les tres rutes sota `/api/v1/connected-apps/` (setup, grant i grant/secrets). Totes les altres rutes el rebutgen.
