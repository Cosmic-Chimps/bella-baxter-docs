# Transfer a project to another organisation

A transfer moves a project from one organisation to another. Bella does it in two steps. It copies the project into the receiving organisation as a new project. Then it deletes the project in the organisation it came from.

Read this before you start:

- **A completed transfer cannot be undone.** The original project is deleted.
- **Trust is reset.** The project's certificate authorities, token signing keys and workload identities are created again in the receiving organisation. Everything that trusted the old ones must be updated.
- **Every API key is revoked.** Services that read the project's secrets need new keys.
- **Version history is not carried.** Only the current value of each secret moves. Read any older version you need before you transfer.
- **Archived environments are not carried.** They are deleted with the original project.

In this page, the **source** is the organisation the project leaves. The **target** is the organisation that receives it. A **run** is one attempt at a transfer.

## Who can transfer a project

You must be the **Owner of both organisations**, the source and the target. An Admin cannot transfer a project. A person who is suspended in either organisation does not count as its Owner, so they cannot start, resume or abandon a transfer.

The target does not approve the transfer in a separate step, because the same person owns both.

Only a person can transfer a project. Every API key is refused, personal keys included. A session in which an operator acts on your behalf is refused too.

## Before you start

Check each of these. Bella refuses the transfer until the blocking items are removed.

**Remove what blocks a transfer.** The preview lists each one by environment and name:

- **TOTP keys.** Bella cannot read a TOTP seed back, so it cannot copy one. Delete the keys, and enrol them again in the target afterwards.
- **Live leases.** These are the secret leases Bella records, which you can see and revoke. Wait for them to expire, or revoke them.
- **Certificate deployment targets** on the project's environments.
- **DNS delegations** on the project's environments.
- **Scout scan scopes and claimed domains** on the project's environments.

Bella checks again at the start of the run and just before it deletes the source. A lease or target created while the run works stops it.

**Prepare the providers:**

- **The default provider needs nothing.** Its values go to the target's default provider.
- **Map every custom provider that holds values.** For each one, choose a provider of the same type in the target. The preview lists the target's providers. The provider must exist, must not be deleted and must be able to hold secrets. Without a mapping for each one, the transfer is refused. Bella never drops values silently.
- **A custom provider that was deleted in Bella but still holds values cannot be mapped.** It keeps the transfer refused.
- **Do not map to the same storage.** If the provider you choose in the target reaches the same storage as the source provider, with the same slug, the run stops when it starts. Choose another provider, or give the project a new slug.
- **Grant the target in your cloud first.** An AWS or GCP provider is tied to the organisation's identity. Before the transfer, grant the target's identity in your cloud account, and create the provider in the target. See [Providers](/features/providers).

**Check the slug.** The project keeps its slug if the target has never used it. A slug that a deleted project once had counts as used. If it is taken, choose a new slug. A slug has 2 to 63 characters: lowercase letters and digits, with single hyphens between them, and no hyphen at the start or the end.

**Check the target's plan limits.** Bella checks that the target can hold one more project, and that its plan allows as many environments per project as the project has. The preview also shows the limits for custom providers and team members. A transfer cannot raise those two, so they never block it.

**Plan the trust reset.** List the hosts that trust the project's SSH or PKI certificate authority, the workloads that use SPIFFE identities, and any CI or Kubernetes configuration that contains an environment ID. All of them change.

**Tell the people affected.** Members who are not already active in the target lose access. Services lose their API keys. While the transfer runs, nobody can change the project.

## What moves, what stays, and what you must redo

| Item | What happens | What you do |
|---|---|---|
| Project name, description and tags | Copied | Nothing |
| Environments | Copied to the target. Each one gets a new ID. Its name, description, lease policy and SPIFFE settings are copied | Update any CI or Kubernetes configuration that contains an environment ID |
| Secrets | The current value of each secret is copied and encrypted again for the target. Its description, tags, type, expiry and certificate details are copied | Nothing |
| Secret version history | Not copied. It is deleted with the source project | Read any older version you need before you start |
| Project-wide (global) secrets | Copied | Nothing |
| Scope tags | Copied with each secret | Nothing |
| Rotation policies | Copied. The next rotation date counts from the time of the copy. A rotation in progress is not carried | Nothing |
| Webhooks | Created again in the target, with the same signing secret, so a receiver that checks the signature keeps working. A webhook that mirrors its signing secret into a provider keeps that link only if the person who made the link is an active member of the target. Otherwise the link is dropped and listed in **Not moved** | Nothing, or create the link again in the target |
| Notification channels | Created again in the target, with their settings | Nothing |
| The default provider's values | Copied to the target's default provider | Nothing |
| Custom providers | Values go to the provider you mapped in the target. Providers that hold none of the project's values are not assigned in the target | Map each one before the transfer |
| Members | A member comes along with their role only if they are an active member of the target. Everyone else is dropped. The preview lists them. The person who starts the run becomes the owner of the new project and of each new environment | Add the dropped people to the target, then to the project |
| Groups | Dropped. A group exists only in its own organisation. The preview lists them | Assign groups of the target to the project |
| API keys | Revoked when the source is deleted. This covers every key scoped to the project or to one of its environments. The preview lists them | Create new keys in the target and give them to your services |
| Connected apps | The connections are revoked before the source is deleted. The preview lists them by app name | The person connects the app again in the target |
| PKI certificate authority | A new authority is created in the target, with a new key and new addresses. The link to the secret store that holds it is not copied | Make every relying party trust the new authority, and issue certificates again |
| SSH certificate authority | A new authority is created in the target, with a new key | Make every host trust the new authority |
| Workload identities | Created again with a new SPIFFE ID. The SPIFFE trust domain is the organisation's slug, so every SPIFFE ID changes. A revoked identity is not created again. A disabled one stays disabled. Node bindings, AWS instance bindings, issued identities (SVIDs) and leases are not carried | Update every workload and policy that names a SPIFFE ID |
| Trust domains (the OIDC issuers an environment accepts for keyless login) | Created again with the same issuer, claim rules and audiences. A disabled one stays disabled | Nothing |
| Environment token signing keys | New keys are created | Update anything that verifies tokens with the old keys |
| TOTP keys | Block the transfer | Delete them first, and enrol again in the target |
| Live leases | Block the transfer | Wait for them to expire, or revoke them |
| Certificate deployment targets, DNS delegations, Scout scan scopes and claimed domains | Block the transfer | Remove them first, and set them up again in the target |
| Dynamic database credentials | Bella keeps no record of them, so they do not block. Their leases expire in your database engine | Nothing |
| Archived environments | Not carried. They are listed in the preview, with their secret counts, and deleted with the source | Nothing |
| Security findings | Not copied. The target scans the project again | Nothing |
| Audit history | Stays in the source as a record | Read the project's earlier history in the source |
| Usage and billing history | Stays in the source | Nothing |
| The project's slug | Kept if the target has never used it. Otherwise you choose a new one | Update anything that names the slug, if it changed |
| Project and environment IDs | New | Update anything that stores an ID |

## Run the transfer

A transfer has three stages: a preview, a confirmation, and a run that works in the background.

### The preview

The preview changes nothing. No record is written, and every API key keeps working. It shows:

- what moves, with secret counts for each environment and provider (`moves`);
- what is created again, for each environment (`recreated`);
- which API keys and connected apps are revoked (`revoked`);
- which members and groups are dropped, which archived environments are not carried, and which kinds of history stay behind (`dropped`);
- what blocks the transfer (`blocks`);
- which providers still need a mapping, and which mappings cannot be used (`providersNeedingMapping`, `invalidMappings`);
- the mappings in effect (`mappedProviders`);
- the target's providers you can map to, each with its id, name and type (`targetProviders`). Use these ids in `providerMappings`;
- the slug the project would have in the target, and whether it is free (`targetSlug`, `targetSlugAvailable`);
- whether the target lacks an organisation key that the project needs (`targetUnencrypted`);
- the target's plan limits, before and after (`planLimits`);
- what deleting the source project destroys, with the same counts as the [project deletion preview](/features/projects#delete-a-project) (`deletionPreview`);
- warnings (`warnings`);
- a digest that you send back when you start (`previewDigest`).

The warnings are:

| Warning | What it means |
|---|---|
| `trust-reset` | Hosts, relying parties and workloads must trust the new authorities and identities. Environment IDs change. Shown when the project has at least one environment |
| `ca-store-binding-required` | An arriving environment would have more than one Vault-type store. An administrator in the target must choose which one holds the new certificate authorities |
| `dynamic-credentials-untracked` | Dynamic database credentials leave no record in Bella, so their leases are not checked. Always shown |
| `same-storage-checked-at-start` | A provider you mapped is checked when the transfer starts, to make sure it does not reach the source's own storage. Shown when you mapped at least one custom provider |

Each entry of `planLimits` has a `resource`, a `limit` (`-1` means unlimited), `current`, `after`, `exceeded` and a `note`. For custom providers and team members, `current` and `after` are empty and `exceeded` is always false.

If Bella cannot count something, the preview is refused. It never shows a zero it is not sure of.

### In the console

You must be an Owner of the project's organisation, and you must own at least one other organisation. Nobody else sees the action.

1. Open the project and choose **Settings**.
2. In the section **Organisation**, choose **Transfer to another organisation**. The dialog is titled "Transfer *project name* to another organisation".
3. **1. Target organisation.** Choose the organisation. Only organisations you own are listed.
4. **2. Providers.** This step appears only when a custom provider holds the project's values. For each provider, choose a provider in the target from the list. The list shows only the target's providers of the same type, as name and type. The default store is not in the list, because it maps itself. If the target has no provider of that type, the step says so and you cannot start: add one in the target organisation, then open the dialog again.
5. **3. Project slug.** The field starts with the project's slug. Keep it, or write a new one. The console tells you whether the slug is free in the target.
6. **4. What will happen.** Read the preview. It opens with a warning headed **Everything that trusts this project must trust it again**. Below it are what moves, what is created again, what stops working, what does not come along, and what is deleted here.
7. **5. Confirm.** Type the project's slug.
8. Choose **Start the transfer**.

The button stays disabled until nothing is in the way. The dialog lists every reason under the button, for example a provider that needs a target, something that blocks the transfer, a slug that is taken, a plan limit, or a confirmation that does not match.

The console then opens the page of the run, at `/project-transfers/` followed by the run's id. The page shows the state, the phase and the progress. It also shows **Not moved** when something did not move. When the transfer is complete, it shows a button to open the project in the target.

While a transfer is under way, the project's **Settings** page shows **A transfer is under way** in the **Organisation** section, with a link, **View the transfer**, to the run page.

### With the API

Every route needs a person's session. The examples use the hosted address. `{projectRef}` is the project's id or its slug.

**1. Preview.**

```http
POST https://api.bella-baxter.io/api/v1/projects/{projectRef}/transfer/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetTenantId": "<id of the target organisation>",
  "providerMappings": [
    { "sourceProviderId": "<provider in the source>", "targetProviderId": "<provider in the target>" }
  ],
  "targetSlug": "my-api"
}
```

`providerMappings` has one entry for each custom provider that holds the project's values. It can be empty. Leave out `targetSlug` to keep the project's slug. The answer includes `previewDigest`, which you send back in the next step.

**2. Start.** Send the same body, plus the project's slug and the digest:

```http
POST https://api.bella-baxter.io/api/v1/projects/{projectRef}/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetTenantId": "<id of the target organisation>",
  "providerMappings": [
    { "sourceProviderId": "<provider in the source>", "targetProviderId": "<provider in the target>" }
  ],
  "targetSlug": "my-api",
  "confirmProjectSlug": "my-api",
  "previewDigest": "<digest from the preview>"
}
```

Bella builds the preview again from the live state and compares its digest with yours. If the project has changed since your preview, the start is refused with `project-transfer-preview-stale`. The answer is `202`, with the run in the body and its address in the `Location` header: `/api/v1/project-transfers/{runId}`.

A project has one run record. Its id comes from the project, so it stays the same if you abandon a run and start again.

**3. Follow the run.**

```http
GET https://api.bella-baxter.io/api/v1/project-transfers/{runId}
Authorization: Bearer <token>
```

| Field | What it holds |
|---|---|
| `id` | The run's id |
| `state` | `queued`, `running`, `stopped`, `completed` or `abandoned` |
| `phase` | The step the run is in, or the step it stopped at: `check`, `createtarget`, `copyvalues`, `copyconfiguration`, `verify` or `retiresource` |
| `failureCode` | Why a stopped run stopped. See [If a transfer stops](#if-a-transfer-stops) |
| `source`, `target` | The organisation and project on each side: `tenantId`, `tenantSlug`, `projectId`, `projectSlug` |
| `startedBy`, `startedByName` | The Owner who started the run |
| `requestedAt`, `heartbeatAt`, `completedAt` | When the run was requested, when it last showed signs of life, and when it completed |
| `progress` | Counters for environments, environment secrets, global secrets, webhooks, notification channels, workload identities and trust domains. Each has `created`, `copied` and `verified` |
| `notMoved` | Each item the run could not move, with its `subject`, `name`, `reason`, `count` and where it is |

`GET /api/v1/projects/{projectRef}/transfer` returns the project's current run. It answers `404` when there is none. It is for the Owner of the project's organisation.

You can read a run by its id if you are the Owner of the source or of the target. Anyone else gets `404`, so a run does not reveal that it exists.

No answer in these routes contains a secret value, a key or a secret's name. They carry counts and names of things such as providers and environments.

There is no CLI command for a transfer.

## While a transfer runs

A run works through these phases, in this order:

| Phase | What Bella does |
|---|---|
| `check` | Checks everything again against live state: you are still the Owner of both organisations, the target is active, nothing blocks, encryption, the slug, the target's plan limits, and that no mapped provider reaches the source's own storage. Writes nothing |
| `createtarget` | Creates the project, its data key, its environments, their provider assignments and the members who arrive |
| `copyvalues` | Copies the secret values, encrypted again for the target |
| `copyconfiguration` | Creates webhooks, notification channels, workload identities and trust domains |
| `verify` | Reads every value in the source and in the target and compares them. This waits until the run is 30 seconds old, so that every server has seen that the project is read-only. Nothing is deleted until this passes |
| `retiresource` | Checks again that you own both organisations and that nothing blocks. Then it ends connected app connections, deletes the source project, revokes its API keys and writes the audit rows |

While it works:

- **The project is read-only on both sides.** Reads work. Changes to the source project, or to the project arriving in the target, are refused with `project-transfer-in-progress`.
- **Scheduled work pauses for the project.** Secret rotations, webhook secret rotations and expiry notices wait until the run ends. They run again afterwards.
- **One run at a time.** A second transfer of the same project is refused.
- **The source is deleted last.** Bella deletes the source project only after it has checked every value in the target.

A run that shows no sign of life for 30 minutes is shown as `stopped` with the failure code `abandoned`. You can resume or abandon it.

## If a transfer stops

A run that fails part way stops. The source project stays intact and read-only. The run shows why it stopped, and what did not move. You then choose one of two actions. Both need you to be the Owner of **both** organisations. Both answer `202` with the run. You can use them only while the run is `stopped`.

- **Resume.** The run continues at the step where it stopped. A value that already arrived is not copied again. If the run stopped because values in the target did not match the source, resuming copies only those values again, then verifies again. The console button is **Resume**.

  ```http
  POST https://api.bella-baxter.io/api/v1/project-transfers/{runId}/resume
  Authorization: Bearer <token>
  Content-Type: application/json

  { "acceptNotMoved": true }
  ```

  The body is required. Send `{}` to resume without accepting anything. Send `{"acceptNotMoved": true}` only if you accept losing the items listed in `notMoved`. The console shows this as the box **Accept the items not moved**. It appears only when there are items.

  Your acceptance covers exactly the list you were shown. If the list is different when Bella is about to delete the source, the run stops again with `not-moved`, forgets your acceptance, and deletes nothing. You then see the new list and decide again. A resume without `acceptNotMoved` clears any earlier acceptance.
- **Abandon.** Bella deletes the partly created project in the target, with the values copied into it, and makes the source project writable again. The console button is **Abandon**, and it asks you to confirm.

  ```http
  POST https://api.bella-baxter.io/api/v1/project-transfers/{runId}/abandon
  Authorization: Bearer <token>
  ```

If you own only one of the two organisations, resume and abandon answer `403` with `project-transfer-owner-required`. If you own neither, they answer `404`.

### Failure codes

| `failureCode` | What it means | What to do |
|---|---|---|
| `blocked` | Something that blocks a transfer appeared while the run worked: a TOTP key, a lease, a certificate deployment target, a DNS delegation, or a Scout scope or claimed domain | Remove it, then resume |
| `owner-lost` | The person who started the run is no longer an active Owner of both organisations. An Owner who is suspended in either organisation does not count | Restore that person's Owner role, then resume. Or abandon |
| `target-inactive` | The target organisation is no longer active | Wait until it is active again, then resume. Or abandon |
| `provider-shares-storage` | A provider you mapped reaches the same storage as the provider it replaces. Copying would overwrite the original | Abandon, then start again with another provider or a new slug |
| `provider-unavailable` | A mapped provider is gone, cannot be used, or could not be reached to check or copy values | Fix the provider and resume. If it was deleted, abandon and start again, because the mappings are fixed when the run starts |
| `store-unavailable` | A secret store, key store or database could not be read or written. Bella does not guess | Check that the stores are reachable, then resume |
| `not-moved` | Some items did not move, and you have not accepted that. Or the values in the source and the target did not match when Bella verified them. The source was not deleted | Read **Not moved**. Resume to copy again the values that did not match. For an item that cannot move, fix the cause, or resume with `acceptNotMoved` if you do not need it. Or abandon |
| `grants-not-ended` | The access of a connected app could not be ended. The source was not deleted | Resume to try again |
| `keys-not-revoked` | The project's API keys could not all be revoked. The source was not deleted | Resume to try again |
| `slug-taken` | The slug is now used in the target | Abandon, then start again with another slug |
| `target-unencrypted` | The project's values are encrypted and the target has no organisation key | Set up the organisation's encryption keys in the target, then resume |
| `plan-limit` | The target's plan would be exceeded: projects, or environments per project | Free capacity in the target or change its plan, then resume |
| `abandoned` | The run showed no sign of life for 30 minutes, so it is shown as stopped. This is not the same as the `abandoned` state | Resume, or abandon |

### Items that did not move

Each entry in `notMoved` names a `subject`, with a `reason`. The reasons that a transfer can report are:

- `Undecryptable`: no key opens the value. It was left exactly as stored. Restore the key or enter the value again.
- `WriteFailed`: the value or setting could not be written in the target, what is in the target does not match, or it has no target. Check that the target store accepts writes, then resume: the values are copied again. This also covers a webhook mirror link that was dropped, a webhook or channel of an environment that is not carried, and a provider that holds values but has no mapping.
- `Unreadable`: a record could not be read from the secret store.

## After the transfer

Do these in order:

1. **Create new API keys** in the target and give them to your services.
2. **Add the people who were dropped**, and assign groups of the target to the project.
3. **Reset trust.** Make hosts trust the new SSH authority and relying parties trust the new PKI authority. Issue certificates again. Update workloads and policies that name a SPIFFE ID.
4. **Update stored IDs.** Change the environment ID in CI and Kubernetes configuration.
5. **Reconnect connected apps.** Each person connects their app again.
6. **Set up again what you removed:** TOTP keys, certificate deployment targets, DNS delegations and Scout scan scopes.
7. **Check a read.** Read one secret with a new key to confirm the services work.

## Zero-knowledge encryption

You can transfer a project whether or not either organisation enforces zero-knowledge encryption. The transfer routes do not ask for a registered device. Bella opens the values on the server and encrypts them again for the target. It never returns a value or a key to you during a transfer.

One case is refused: the source project is encrypted with an organisation key, and the target has no organisation key. The target's Owner sets up the organisation's encryption keys first. The copy is then encrypted with a new key in the target.

## Errors

Each refusal before a run starts changes nothing. The `type` of `person-only`, `impersonation-refused` and `plan-limit-exceeded` is the bare name. For every other problem, the `type` is `https://bellabaxter.dev/problems/` followed by the name in the table.

| Status | Problem type | When | What to do |
|---|---|---|---|
| `403` | `person-only` | The caller is an API key | Sign in as a person |
| `403` | `impersonation-refused` | An operator is acting on your behalf | Sign in yourself |
| `403` | `project-transfer-owner-required` | You are not the Owner of the source organisation. Also on resume and abandon when you own only one of the two organisations | Ask an Owner |
| `400` | `project-transfer-target-refused` | The target does not exist, is not active, is the source itself, or you are not its Owner. Bella gives one answer for all of these, so it does not reveal whether an organisation exists | Check the target's ID and your role in it |
| `409` | `project-transfer-blocked` | Something blocks the transfer. The answer lists each item | Remove them and try again |
| `422` | `project-transfer-provider-unmapped` | A custom provider that holds values has no mapping | Map it |
| `422` | `project-transfer-provider-mapping-invalid` | A mapping names a provider that does not exist in the target, is deleted, cannot hold secrets or is of another type | Choose a provider of the same type |
| `409` | `project-transfer-target-unencrypted` | The source project is encrypted and the target has no organisation key | Set up encryption in the target |
| `402` | `plan-limit-exceeded` | The transfer would exceed a limit of the target's plan. The answer names the `resource` and the `limit` | Free capacity in the target, or change its plan |
| `409` | `project-transfer-slug-taken` | The slug is used in the target by a live or a deleted project. This applies to the slug you chose, too | Send a different `targetSlug` |
| `422` | `project-transfer-slug-invalid` | The new slug breaks the slug rules | Choose a valid slug |
| `422` | `project-transfer-confirmation-missing` | `confirmProjectSlug` or `previewDigest` is missing | Send both |
| `422` | `project-transfer-confirmation-mismatch` | The slug you typed is not the project's slug | Type it exactly |
| `409` | `project-transfer-preview-stale` | The project or your choices changed since the preview | Take a new preview |
| `503` | `project-transfer-preview-unavailable` | Bella could not count something, or could not read an organisation record | Try again later |
| `409` | `project-transfer-in-progress` | A transfer of this project is already running, or you tried to change a project that is being transferred | Wait for the run to end |
| `409` | `project-transfer-not-resumable` | The run is not stopped, so it cannot be resumed | Check the run's state |
| `409` | `project-transfer-not-abandonable` | The run is not stopped, so it cannot be abandoned | Check the run's state |

A project or run that does not exist answers `404`.

## In the audit log

| Action | Recorded in | When |
|---|---|---|
| `project_transfer_started` | The source | A transfer starts |
| `project_transferred_out` | The source | The transfer completes |
| `project_transferred_in` | The target | The transfer completes |
| `project_transfer_abandoned` | Both | A run is abandoned |

A row names the other organisation and the run, and the completed rows carry counts. It never holds a value or a secret's name. A transfer that is refused before it starts writes no row. The rows for the completed transfer are written with the person who started the run. The project's earlier audit history stays in the source.

Deleting the source project is also recorded there as `project_deleted`. Abandoning a run records `project_deleted` in the target for the partly created project.

## See also

- [Projects](/features/projects), including deleting a project
- [Providers](/features/providers)
- [Environments](/features/environments)
- [API Keys](/features/api-keys)
- [PKI certificates](/features/pki-certificates)
- [SSH certificates](/features/ssh-ca)
- [Manage connected apps](/features/connected-apps-manage)
- [Audit Logs](/audit/)
