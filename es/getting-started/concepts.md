# Conceptos Clave

Cómo organiza Bella Baxter tus secretos.

## Visión General de la Arquitectura

Bella Baxter es una **pasarela**, no un almacén de secretos. Los valores de tus secretos viven en el proveedor externo que ya operas. Bella Baxter gestiona el acceso, el contexto y la identidad — nunca almacena los valores raw de los secretos.

```
Tu Aplicación
  └── Bella CLI / SDK
        └── API de Bella Baxter
              └── Proveedor de Secretos (Vault, AWS, Azure, GCP...)
                    └── Tus valores de secretos (almacenados aquí, no en Bella)
```

---

## Conceptos Clave

### Tenant (Inquilino)

El límite de aislamiento de nivel superior. Cuando te registras (o despliegas una instancia auto-alojada), obtienes un tenant. Tu equipo, proyectos y proveedores viven dentro de tu tenant.

### Proveedor

Un **Proveedor** es una conexión a un almacén de secretos externo. Lo configuras una vez con credenciales y una URL. Bella lo usa para leer y escribir secretos en tu nombre.

Tipos de proveedores soportados:

| Tipo | Descripción |
|------|-------------|
| `Vault` / OpenBao | HashiCorp Vault o OpenBao — el proveedor del sistema por defecto |
| `AwsSecretsManager` | AWS Secrets Manager |
| `AwsParameterStore` | AWS Systems Manager Parameter Store |
| `AzureKeyVault` | Azure Key Vault |
| `GoogleSecretManager` | GCP Secret Manager |
| `HttpRest` | Cualquier API HTTP genérica de secretos |

Cada tenant obtiene automáticamente un **Proveedor del Sistema** — una instancia de OpenBao gestionada por Bella. Puedes usarlo inmediatamente sin ninguna configuración.

### Proyecto

Un **Proyecto** es una agrupación lógica de secretos, generalmente correspondiente a una aplicación o servicio. Los proyectos tienen miembros con roles (Propietario, Gestor, Miembro, Consumidor).

Los proyectos se asignan a uno o más Proveedores. Los secretos de un proyecto se almacenan en esos proveedores.

### Entorno

Un **Entorno** es una parte de un proyecto para una etapa de despliegue: `dev`, `staging`, `production`, etc. Cada entorno:
- Tiene su propio conjunto de secretos (aislado de otros entornos)
- Puede ser asignado a un subconjunto de los proveedores del proyecto
- Puede tener su propia lista de acceso de miembros

Un secreto para `DATABASE_URL` en `dev` está completamente separado de `DATABASE_URL` en `production`.

### Secreto

Un **Secreto** es un par clave-valor almacenado en un proveedor. Bella Baxter nunca almacena el valor en sí — hace de proxy para lecturas y escrituras al proveedor.

### Clave API

Una **Clave API** (`bax-...`) es una credencial de máquina de larga duración, con ámbito limitado a un proyecto+entorno. Úsala en pipelines de CI/CD, servidores y clientes SDK.

### Trust Domain (Dominio de Confianza)

Un **Trust Domain** habilita la **autenticación sin credenciales** — sin clave API estática requerida. Las cargas de trabajo presentan un token OIDC de corta duración (de GitHub Actions, Kubernetes, etc.) y Bella lo intercambia por un token de secretos con ámbito.

---

## Jerarquía de Datos

```
Tenant
 └── Proveedores (ámbito de tenant, reutilizables entre proyectos)
 └── Proyectos
      └── Proveedores (asignados a este proyecto)
      └── Miembros (con roles)
      └── Entornos (dev, staging, production…)
           └── Proveedores (subconjunto de proveedores del proyecto)
           └── Miembros (acceso opcional por entorno)
           └── Secretos (almacenados en el proveedor del entorno)
```

---

## Cómo Funciona `bella pull`

1. La CLI lee tu contexto (proyecto + entorno desde el archivo `.bella` o `BELLA_BAXTER_API_KEY`)
2. Envía una solicitud a la API de Bella Baxter
3. La API resuelve el proveedor para tu entorno
4. La API obtiene secretos del proveedor externo (Vault, AWS…)
5. Los secretos son devueltos a la CLI
6. La CLI los escribe en `.env` o los inyecta en un proceso hijo

Los valores de los secretos viajan desde proveedor → API → CLI. **Nunca se almacenan en la base de datos de Bella**.
