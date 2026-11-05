# Conceptes clau

Com organitza Bella Baxter els teus secrets.

## Visió general de l'arquitectura

Bella Baxter és una **passarel·la**, no un magatzem de secrets. Els valors dels teus secrets viuen al proveïdor extern que ja operes. Bella Baxter gestiona l'accés, el context i la identitat — mai no emmagatzema els valors raw dels secrets.

```
La teva aplicació
  └── Bella CLI / SDK
        └── API de Bella Baxter
              └── Proveïdor de secrets (Vault, AWS, Azure, GCP...)
                    └── Els teus valors de secrets (emmagatzemats aquí, no a Bella)
```

---

## Conceptes clau

### Tenant (inquilí)

El límit d'aïllament de nivell superior. Quan et registres (o desplegues una instància autoallotjada), obtens un tenant. El teu equip, els teus projectes i els teus proveïdors viuen dins del teu tenant.

### Proveïdor

Un **proveïdor** és una connexió a un magatzem de secrets extern. El configures una sola vegada amb credencials i una URL. Bella l'usa per llegir i escriure secrets en nom teu.

Tipus de proveïdors suportats:

| Tipus | Descripció |
|------|-------------|
| `Vault` / OpenBao | HashiCorp Vault o OpenBao — el proveïdor del sistema per defecte |
| `AwsSecretsManager` | AWS Secrets Manager |
| `AwsParameterStore` | AWS Systems Manager Parameter Store |
| `AzureKeyVault` | Azure Key Vault |
| `GoogleSecretManager` | GCP Secret Manager |
| `HttpRest` | Qualsevol API HTTP genèrica de secrets |

Cada tenant obté automàticament un **proveïdor del sistema** — una instància d'OpenBao gestionada per Bella. Pots fer-lo servir immediatament, sense cap configuració.

### Projecte

Un **projecte** és una agrupació lògica de secrets, normalment corresponent a una aplicació o un servei. Els projectes tenen membres amb rols (Propietari, Gestor, Membre, Consumidor).

Els projectes s'assignen a un o més proveïdors. Els secrets d'un projecte s'emmagatzemen en aquests proveïdors.

### Entorn

Un **entorn** és una part d'un projecte per a una etapa de desplegament: `dev`, `staging`, `production`, etc. Cada entorn:
- Té el seu propi conjunt de secrets (aïllat dels altres entorns)
- Es pot assignar a un subconjunt dels proveïdors del projecte
- Pot tenir la seva pròpia llista d'accés de membres

Un secret per a `DATABASE_URL` a `dev` està completament separat de `DATABASE_URL` a `production`.

### Secret

Un **secret** és un parell clau-valor emmagatzemat en un proveïdor. Bella Baxter mai no emmagatzema el valor en si — fa de proxy per a les lectures i escriptures al proveïdor.

### API key

Una **API key** (`bax-...`) és una credencial de màquina de llarga durada, amb àmbit limitat a un projecte+entorn. Fes-la servir en pipelines de CI/CD, servidors i clients SDK.

### Trust Domain (domini de confiança)

Un **Trust Domain** habilita l'**autenticació sense credencials** — no cal cap API key estàtica. Les càrregues de treball presenten un token OIDC de curta durada (de GitHub Actions, Kubernetes, etc.) i Bella l'intercanvia per un token de secrets amb àmbit.

---

## Jerarquia de dades

```
Tenant
 └── Proveïdors (àmbit de tenant, reutilitzables entre projectes)
 └── Projectes
      └── Proveïdors (assignats a aquest projecte)
      └── Membres (amb rols)
      └── Entorns (dev, staging, production…)
           └── Proveïdors (subconjunt de proveïdors del projecte)
           └── Membres (accés opcional per entorn)
           └── Secrets (emmagatzemats al proveïdor de l'entorn)
```

---

## Com funciona `bella pull`

1. La CLI llegeix el teu context (projecte + entorn des del fitxer `.bella` o `BELLA_BAXTER_API_KEY`)
2. Envia una sol·licitud a l'API de Bella Baxter
3. L'API resol el proveïdor del teu entorn
4. L'API obté els secrets del proveïdor extern (Vault, AWS…)
5. Els secrets es retornen a la CLI
6. La CLI els escriu a `.env` o els injecta en un procés fill

Els valors dels secrets viatgen des del proveïdor → API → CLI. **Mai no s'emmagatzemen a la base de dades de Bella**.
