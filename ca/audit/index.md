# Auditoria

> 🌐 **Versió en anglès**: [Audit Logs](/audit/)

Traducció properament. Consulta la [versió en anglès](/audit/) per a la documentació completa.

## Enviament a un SIEM: el que CEF no pot portar

Les destinacions JSON (HTTPS genèric, Splunk HEC, Datadog, Azure Monitor) reben cada esdeveniment com un sobre JSON el
membre `raw` del qual conté la fila d'auditoria completa, inclosos `raw.scopeNarrowing` (quantes claus ha amagat un llistat
limitat per àmbit), `raw.trustDomainId`, `raw.presentedAudiences` i `raw.audienceMatched`. Les audiències
presentades les aporta qui crida i Bella no les verifica: com a màxim 8 valors de 256 caràcters, amb els
caràcters de control reemplaçats. Tracta-les com a entrada no fiable en mostrar-les.

**La destinació CEF (syslog sobre TLS) porta només els camps promoguts i no inclou `raw`.** Per això no distingeix un
llistat retallat per àmbit d'una lectura rebutjada, ni porta el domini de confiança ni les audiències presentades.
Si una regla en depèn, fes servir una destinació JSON.
