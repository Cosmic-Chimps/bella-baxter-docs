# Planes y licencia

> 🌐 **English version**: [Plans and licence](/open-source/)

Bella Baxter es open-core y de código disponible (source-available) bajo la [licencia ELv2](https://www.elastic.co/licensing/elastic-license). El núcleo es gratuito. Los planes de pago agregan módulos encima, en la nube y en tu propia infraestructura.

## El principio rector

> **El núcleo nunca tiene tope y nunca se cobra por usuario. Cobramos los módulos de organización y la automatización en la nube: nunca los recursos que necesitas para hacer tu trabajo.**

Una persona desarrolladora o una startup de 3 personas nunca debería toparse con un muro mientras hace trabajo legítimo.

## Dos formas de usar Bella, cuatro planes en cada una

Puedes usar la **nube** administrada, alojar Bella tú mismo (**auto-alojado**) en tu propia infraestructura, o ambas. Cada una tiene cuatro planes. Cada plan incluye todo lo del anterior.

### Nube

| Plan | Qué incluye | Cómo se cobra |
|------|-------------|---------------|
| **Pago por uso** | El núcleo. La automatización se mide: 2,000 llamadas al mes son gratis en la primera organización de una persona, y después se cobra cada llamada. | $0.005 por petición después de las 2,000 gratis. |
| **Pro** | Pago por uso, más inicio de sesión único (SSO) y exportación SIEM. | Contáctanos. |
| **Enterprise** | Pro, sin medición y con soporte 24/7. | Por contrato. |

Pago por uso es el plan por defecto de cada organización. Las sesiones de las personas en la consola y en la CLI nunca se miden.

### Auto-alojado

| Plan | Qué incluye | Cómo se cobra |
|------|-------------|---------------|
| **Community Edition (CE)** | El núcleo. Gratis, sin tope y sin medición. | Gratis. |
| **Pro** | CE, más SSO y exportación SIEM. | Contáctanos. |
| **Premium** | Pro, más rotación de certificados (incluidos ACME y appliances de proveedores) y descubrimiento de certificados con Scout. | Contáctanos. |
| **Enterprise** | Premium, más soporte 24/7. | Por contrato. |

## Lo que se cumple en todos los planes

- **El núcleo nunca tiene tope y nunca se cobra por usuario.** Proyectos, entornos, secretos, API keys, proveedores y el resto de la lista de abajo no tienen límite en ningún plan.
- **El auto-alojado nunca se mide.** La medición existe solo en la nube, donde se puede facturar.
- **«Gratis» significa el núcleo y Community Edition.** No se aplica a los planes de pago.
- **La rotación de certificados y Scout son solo para auto-alojado, por ahora.** Necesitan una ruta hacia tu red, y un servicio compartido en la nube no debe tenerla. Un plan Premium en la nube espera un agente de salida que ejecutas dentro de tu red. Todavía no está construido.

## Qué existe hoy y qué viene

**Hoy**

- La nube está activa, con Pago por uso. Pro y Enterprise se acuerdan contactándonos: [enterprise@cosmic-chimps.io](mailto:enterprise@cosmic-chimps.io). Todavía no hay compra en línea para ellos.
- SSO y la exportación SIEM funcionan en la nube y en auto-alojado. Una organización los solicita, y un operador aprueba el SSO o activa el envío. Consulta [Inicio de sesión único](/features/sso) y [Logs de auditoría](/es/audit/).
- En auto-alojado, un módulo de pago funciona cuando tu clave de licencia lo incluye y el operador de la instalación lo ha activado para una organización. Consulta [La clave de licencia para auto-alojado](#la-clave-de-licencia-para-auto-alojado).

**Lo que viene**

- Compra en línea del plan Pro en la nube.
- Rotación de certificados y Scout en la nube, mediante el agente de salida.

## La clave de licencia para auto-alojado

Una instalación auto-alojada activa los módulos de pago con una **clave de licencia**. La emitimos cuando contratas un plan de pago.

- **Qué activa.** Tres módulos: inicio de sesión único (SSO), exportación SIEM (envío del registro de auditoría) y rotación de certificados, que incluye el descubrimiento de certificados con Scout. Una clave Pro incluye los dos primeros. Una clave Premium o Enterprise incluye los tres. El operador de la instalación sigue decidiendo qué organizaciones reciben cada módulo.
- **Cómo se comprueba.** La clave es un token firmado (ES256). La instalación verifica la firma por sí sola, sin conexión, con claves públicas incluidas en la versión. No hace ninguna llamada de red para ello, así que funciona en un equipo sin salida a internet, y no nos envía nada sobre tu clave ni sobre tu instalación.
- **Dónde se configura.** Como configuración del despliegue, en el ajuste `BELLA_LICENSE`. En el paquete auto-alojado, el asistente de instalación la escribe y `./bella.sh apply` la lleva a los contenedores. Consulta la guía de instalación del paquete.
- **Qué cubre una clave.** El mismo modelo que las herramientas de JetBrains. Una clave cubre las versiones hasta la fecha impresa en ella (`upgrades_until`). Una línea de versiones publicada por primera vez en esa fecha o antes sigue funcionando con la clave, sin fecha de fin, igual que cada parche de esa línea. Una línea posterior necesita una clave renovada. Consulta la [política de soporte](/es/open-source/support-policy).
- **Con una clave, nada se apaga por fecha.** Cuando una clave no cubre la versión que ejecutas, el núcleo no cambia, ni nada de lo que figura en [Siempre gratis](#siempre-gratis-community). Un control que ya está activo nunca se baja: el SSO obligatorio sigue siendo obligatorio y las rotaciones de certificados programadas continúan. Los tres módulos dejan de aceptar configuración nueva y trabajo nuevo, y no se borra nada. Renueva la clave, o vuelve a una versión cubierta, y se reanudan sin reconfigurar. El envío del registro de auditoría a un SIEM se suspende mientras el módulo no tiene licencia: se envía un único mensaje de control `stream suspended` al destino, no se pone nada en cola y tu registro de auditoría en Bella Baxter sigue completo. El envío se reanuda solo cuando la licencia vuelve a incluir el módulo.
- **Una única gracia de 30 días si actualizas sin clave.** Una instalación que ya usa SSO, envío de auditoría o rotación de certificados y actualiza a esta versión sin clave conserva cada uno de esos módulos durante 30 días, contados desde el primer arranque de una versión que puede verificar una clave de producción. Un módulo que no usabas no forma parte de la gracia. Una clave con una errata o cortada no termina la gracia; una clave válida sí, y los módulos que lista siguen funcionando.
- **Un problema con la clave nunca detiene la instalación.** Una clave ausente, mal escrita o ilegible nunca impide que la instalación arranque ni que sirva secretos. Los módulos de pago se comportan como Community hasta que se corrija la clave, y la consola del operador dice por qué.

## Siempre gratis (Community)

Esto es parte del núcleo. Community Edition lo ejecuta todo gratis y sin tope. En la nube está incluido en todos los planes, y solo se miden las llamadas de automatización.

| Funcionalidad | Por qué es siempre gratis |
|---------------|---------------------------|
| Proyectos ilimitados | El tope exacto que hizo frustrante usar Infisical |
| Entornos ilimitados | Dev/staging/prod es lo mínimo |
| Secretos ilimitados | Funcionalidad básica |
| API keys ilimitadas | Autenticación principal para CI/CD: limitarlas rompe la automatización |
| Todos los proveedores personalizados (Vault, AWS, Azure, GCP) | Toda la propuesta de valor: conectar tu propia infraestructura |
| Acceso a la CLI | Flujo de trabajo fundamental del desarrollador |
| Todos los SDKs (10 lenguajes) | Herramientas para desarrolladores |
| Autoridad de certificación SSH | Seguridad operativa, no gobierno de la organización |
| Trust Domains / Workload Identity (OIDC) | Autenticación de CI/CD: la misma categoría que las API keys |
| TOTP (gestión de claves 2FA) | Función de seguridad para todo desarrollador |
| Webhooks | Notificaciones operativas de eventos |
| Secure Shares | Utilidad para desarrolladores |
| Detección de drift | Higiene operativa |
| Integración MCP / IA | Herramientas para desarrolladores |
| Notificaciones (Slack, Discord, Teams, Telegram) | Alertas operativas |
| Escaneos de Security Intelligence | Detectar `password123` es un derecho básico, no una mejora de pago |
| Integración con .NET Aspire | Flujo de trabajo del desarrollador |

Ejecutar más de una organización en una instancia no tiene restricción. Cualquier persona con sesión iniciada puede crear otra organización hoy.

Para los módulos de pago, consulta [Funcionalidades por plan](/es/open-source/enterprise-features).

## Uso en la nube

La nube administrada de Bella Baxter mide la automatización, no a las personas.

- **Cuota gratuita**: 2,000 peticiones API por mes, sin tarjeta de crédito.
  La cuota gratuita pertenece a la primera organización que crea una persona. Una organización que cree después empieza sin cuota, y sus peticiones con API key devuelven `429` hasta que se agregue un método de pago. Las sesiones de la consola y de la CLI de una persona nunca se miden.
  Cuando se agota la cuota gratuita y no hay método de pago registrado, las peticiones con API key devuelven `429` hasta que agregues uno.
- **Exceso**: $0.005 por petición por encima de 2,000 (~$5 por cada 1,000 peticiones).
- **Enterprise**: sin medición. Se acuerda por contrato.

La cuota gratuita y la tarifa son los valores por defecto. Un operador puede fijar otros para una organización por contrato.

Una «petición» = una llamada HTTP a la API de secretos hecha por una identidad de máquina (API key). Esto incluye:
- `bella pull` / `bella run`: cuenta como **una petición** sin importar cuántos secretos se devuelvan
- Lecturas desde pipelines de CI/CD (cada despliegue = una petición)
- Llamadas de agentes de IA / herramientas MCP (cada `get_secret` o `list_secret_keys` = una petición)

El servidor MCP de la CLI usa caché basada en ETag. Cuando los secretos no han cambiado, las llamadas posteriores de la herramienta de IA devuelven resultados en caché sin tocar la API, así que una sesión larga de IA suele consumir solo 1 o 2 peticiones medidas.

Los flujos humanos (WebApp, gestión de proyectos, gestión de usuarios) **nunca se miden**.

### Cuánto cuesta un uso típico

| Equipo | Actividad | Peticiones al mes | ¿Dentro de las 2,000 gratis? | Costo |
|--------|-----------|-------------------|------------------------------|-------|
| Desarrollador individual | Desarrollo activo | ~200 | Sí | $0 |
| Startup de 3 personas | Dev + CI/CD (20 despliegues al día) | ~600 | Sí | $0 |
| Startup de 3 personas + IA | CI/CD + sesiones MCP diarias | ~1,800 | Sí | $0 |
| Equipo de 10 personas | CI/CD intenso (100 despliegues al día) | ~3,000 | No | $5 |
| Equipo de 10 personas | 500 despliegues al día | ~15,000 | No | $65 |
| Empresa de 50 personas | 2,000 despliegues al día | ~60,000 | No | $290 |

Pagas más cuando despliegas más (o cuando tus agentes de IA están muy activos). Que la factura crezca es una señal de que el equipo crece.

## Auto-alojado frente a nube

| | Auto-alojado | Nube |
|--|--------------|------|
| Planes | Community Edition, Pro, Premium, Enterprise | Pago por uso, Pro, Enterprise |
| Costo del núcleo | Gratis, sin tope y sin medición | $0 para empezar, $0.005 por petición después de 2,000 |
| Infraestructura | La administras tú (Docker/Aspire/K8s) | La administra Cosmic Chimps |
| Residencia de datos | Tu infraestructura | Cosmic Chimps (UE / EE. UU.) |
| SSO y exportación SIEM | Pro y superiores | Pro y superiores |
| Rotación de certificados y Scout | Premium y superiores | Todavía no disponible |
| Soporte 24/7 | Enterprise | Enterprise |
| Actualizaciones | Manuales | Automáticas |

## Licencia

Bella Baxter se publica bajo la **Elastic License v2 (ELv2)**:

- ✅ Auto-aloja libremente para cualquier uso interno
- ✅ Modifica el código fuente
- ✅ Contribuye al proyecto original
- ❌ No puedes ofrecer Bella Baxter como servicio administrado a terceros sin un acuerdo comercial

Esto impide que los proveedores de nube envuelvan Bella Baxter como un servicio competidor, y mantiene el auto-alojamiento completamente libre.

[→ Lee el texto completo de la licencia](https://www.elastic.co/licensing/elastic-license)

### Las bibliotecas cliente son MIT

La Elastic License cubre el servidor de Bella Baxter: el producto que auto-alojas, y el que Cosmic Chimps opera como servicio en la nube.

Las bibliotecas cliente se publican bajo la **licencia MIT**. Eso incluye los SDKs de todos los lenguajes, la biblioteca de criptografía compartida `BellaBaxter.Crypto`, la CLI `bella`, el proveedor de Terraform, la colección de Ansible y la acción de configuración para GitHub. Puedes usarlas en tu propio software, abierto o cerrado, sin restricción. Cada una incluye su propio archivo `LICENSE`.

Las versiones del paquete de Swift publicadas antes del 16 de noviembre de 2026 todavía llevan la Elastic License en su archivo `LICENSE`. Las versiones posteriores llevan MIT.

### Software de terceros

Bella Baxter se ejecuta sobre software de código abierto que conserva su propia licencia, incluidos OpenBao (MPL 2.0), Keycloak (Apache 2.0), PostgreSQL, Redis y el entorno de ejecución de .NET. El archivo `NOTICE` del paquete auto-alojado enumera cada uno, con su licencia.
