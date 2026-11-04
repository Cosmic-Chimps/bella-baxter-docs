# Auditoría

> 🌐 **English version**: [Audit Logs](/audit/)

Traducción próximamente. Consulta la [versión en inglés](/audit/) para documentación completa.

## Envío a un SIEM: lo que CEF no puede llevar

Los destinos JSON (HTTPS genérico, Splunk HEC, Datadog, Azure Monitor) reciben cada evento como un sobre JSON cuyo
miembro `raw` contiene la fila de auditoría completa, incluidos `raw.scopeNarrowing` (cuántas claves ocultó un listado
limitado por alcance), `raw.trustDomainId`, `raw.presentedAudiences` y `raw.audienceMatched`. Las audiencias
presentadas las aporta quien llama y Bella no las verifica: como máximo 8 valores de 256 caracteres, con los
caracteres de control reemplazados. Trátalas como entrada no confiable al mostrarlas.

**El destino CEF (syslog sobre TLS) lleva solo los campos promovidos y no incluye `raw`.** Por eso no distingue un
listado recortado por alcance de una lectura rechazada, ni lleva el dominio de confianza ni las audiencias presentadas.
Si una regla depende de ellos, usa un destino JSON.

