# Funcionalidades por plan

> 🌐 **English version**: [Features by plan](/open-source/enterprise-features)

Referencia de qué funcionalidades están en el núcleo, cuáles son módulos de pago y qué plan incluye cada una. Para los planes en sí, consulta [Planes y licencia](/es/open-source/).

::: info Cómo se activan los planes de pago
Pro y Enterprise se acuerdan contactándonos. Todavía no hay compra en línea. En la nube, un operador activa tus módulos. En auto-alojado, el operador de la instalación los activa, una vez que tienes un contrato con nosotros. Una clave de licencia para auto-alojado está en camino. Todavía no hay clave de licencia.
:::

## ✅ Siempre gratis

| Funcionalidad | Motivo |
|---------------|--------|
| Proyectos ilimitados | El tope exacto que nos llevó a construir Bella Baxter |
| Entornos ilimitados por proyecto | Dev/staging/prod es lo mínimo |
| Secretos ilimitados | Funcionalidad básica |
| API keys ilimitadas | Autenticación principal para CI/CD: limitarlas rompe la automatización |
| Proveedores personalizados (cualquier cantidad) | Toda la propuesta de valor es conectar tu propia infraestructura |
| Detección de drift | Higiene operativa, no gobierno de la organización |
| Autoridad de certificación SSH | Función de seguridad operativa |
| Trust domains / Workload identity (OIDC) | Autenticación de CI/CD: la misma categoría que las API keys |
| TOTP (gestión de claves 2FA) | Seguridad, no gobierno |
| Webhooks | Notificaciones operativas de eventos |
| Secure Shares | Utilidad para desarrolladores |
| Integración MCP de IA | Herramientas para desarrolladores |
| CLI, todos los SDKs | Flujo de trabajo fundamental del desarrollador |
| Integración con .NET Aspire | Flujo de trabajo del desarrollador |
| Notificaciones (Slack, Discord, Teams, Telegram) | Alertas operativas |
| Escaneos de Security Intelligence | La higiene de seguridad es un derecho básico |
| Visor del log de auditoría (en la WebApp) | Acceso de solo lectura a tu propio registro de accesos |

**Prueba:** *«¿Una persona desarrolladora o una startup de 3 personas se toparía con esto haciendo trabajo legítimo?»* → Si la respuesta es sí, tiene que ser gratis.

## Módulos de pago

Solo importan a **escala de organización**, así que los equipos pequeños nunca los necesitan.

| Módulo | Nube | Auto-alojado |
|--------|------|--------------|
| **Inicio de sesión único (SAML u OIDC)** | Pro y Enterprise | Pro, Premium y Enterprise |
| **Exportación a SIEM** (Splunk, Datadog, Azure Monitor) | Pro y Enterprise | Pro, Premium y Enterprise |
| **Rotación de certificados** (incluidos ACME y appliances de proveedores) | Todavía no disponible | Premium y Enterprise |
| **Descubrimiento de certificados con Scout** | Todavía no disponible | Premium y Enterprise |
| **Sin medición** | Enterprise | Nunca se mide en ningún plan |
| **Soporte 24/7** | Enterprise | Enterprise |

- **SSO.** Una organización lo solicita, y un operador aprueba la solicitud. Consulta [Inicio de sesión único](/features/sso).
- **Exportación a SIEM.** El visor del log de auditoría de la consola sigue siendo gratis. Un operador activa el envío para la organización. Consulta [Logs de auditoría](/es/audit/).
- **La rotación de certificados y Scout** son solo para auto-alojado, por ahora. Premium en la nube espera un agente de salida que ejecutas dentro de tu red. Todavía no está construido.

Ejecutar más de una organización en una instancia no tiene restricción. Cualquier persona con sesión iniciada puede crear otra organización hoy.

## ❌ NO se limitará

| Funcionalidad | Motivo |
|---------------|--------|
| Cantidad de proyectos | Este es el error de Infisical: repetirlo traicionaría la razón por la que se creó Bella Baxter |
| Cantidad de entornos | Igual |
| Cantidad de proveedores | Obliga a usar nuestra infraestructura y destruye la propuesta de valor |
| Cantidad de API keys | Rompe el CI/CD para los usuarios de la comunidad |
| Detección de drift | Castiga las buenas prácticas |
| Escaneos de seguridad | Detectar contraseñas débiles es un derecho básico de seguridad |

## Cómo obtener un plan de pago

Contáctanos: [enterprise@cosmic-chimps.io](mailto:enterprise@cosmic-chimps.io)

- **Pro:** SSO y exportación a SIEM, en la nube o auto-alojado.
- **Premium (auto-alojado):** Pro, más rotación de certificados y Scout.
- **Enterprise:** todo lo de Pro (nube) o de Premium (auto-alojado), más soporte 24/7 bajo contrato. En la nube también significa sin medición.

Aquí no publicamos precios. Contáctanos y te enviaremos las condiciones.

El auto-alojamiento está disponible bajo petición; consulta [Auto-alojamiento](/es/getting-started/self-hosting).
