# Connect with Bella Baxter

"Connect with Bella Baxter" lets a third-party app read the secrets of one environment, after the person who owns them approves it. The app never gets an API key and never sees anything the person did not choose.

This page is for the developer who builds an app. If you are a person an app has asked to connect, or an organisation Owner or Admin, read [Manage connected apps](/features/connected-apps-manage) instead.

## What it is

- **Read-only.** An app can read secret values. It cannot create, change or delete anything.
- **One environment.** The person picks one organisation, one project and one environment. They can narrow it further to one scope tag. A scope tag is a label on a secret. With a scope tag, the app sees only the secrets that carry that tag.
- **The person approves on Bella's page.** The page shows the app's name, the domain the developer proved they own, and the organisation that registered the app. Nothing is granted until the person chooses **Allow**.
- **The person can revoke at any time** from **Connected apps** in the console. The app's next read is refused.
- **Access can end on a date.** On the approval page the person chooses how long access lasts: until they revoke it, 30 days, 90 days or 1 year.

## Who pays

Every read counts against the **app owner's** organisation API quota. It never counts against the person who connected the app, and it never touches their own allowance or their own API keys.

If the app owner's organisation is over its quota, the app gets `429` with the problem type `monthly-quota-exceeded`.

## Register an app

You need to be an Owner or Admin of your organisation. Open **Settings**, then the **Developer apps** tab, then choose **Register an app**.

1. **Register the app.** Enter three things:
   - **App name.** People decide based on this name. It cannot be changed later.
   - **Domain.** The domain you control, for example `app.example.com`. It cannot be changed later.
   - **Redirect addresses.** One per line. A redirect address is where Bella sends the person's browser after they allow or decline. Each one must use `https`. Its host must be your domain or a subdomain of it.

   Registering creates a draft. The app is **Pending**, nobody can connect it, and an operator does not see it yet.
2. **Prove the domain.** The app page shows a record name and a record value. Add a TXT record to your DNS:

   | Record name | Record value |
   |---|---|
   | `_bella-app-challenge.<your-domain>` | `bella-app-verification=<token>` |

   This is not the single sign-on proof. It never affects SSO. A domain can be verified for apps by one organisation at a time.
3. **Verify the domain.** Choose **Verify the domain**. Bella checks the record. DNS changes can take a few minutes to arrive. You can verify 10 times per hour for each app.
4. **Submit for approval.** Choose **Submit for approval**. The button works once the domain is **Verified** and the app has at least one redirect address. The app stays **Pending** while an operator reviews it.
5. **Get the client secret.** After you submit, the app page shows **Rotate the client secret**. Choose it and confirm. Bella shows the new secret once. Copy it, then choose **I have copied it**. Bella does not keep the secret and cannot show it again. If you lose it, rotate again. The old secret stops working at once.
6. **Wait for approval.** A Bella operator approves the app. Until then the app cannot sign anyone in, because its client is switched off. The client ID (`bella-app-<id>`) is on the app page at any time.

If an operator rejects the app, the app page shows the reason.

You can change two things after registration:

- **The redirect addresses.** Choose **Edit** next to the redirect addresses. You can do this only while the app is Pending or Approved. They must stay on your domain.
- **The client secret.** Rotate it as in step 5.

A rejected app cannot be submitted again. To try again, register a new app. Deleting an app revokes every connection to it.

### Domain proof

Bella checks your TXT record again every day. The proof lapses only after three daily checks in a row agree that the record is missing. A check that cannot reach DNS does not count. A check that finds the record starts the count again. While the proof is lapsed, new connections stop. Connections that already exist keep working. Publish the record again and verify to restore it.

## App states

The app list and the app page show two states for each app: the state of the app, and the state of its domain proof.

| App state | What it means |
|---|---|
| **Pending**, with the message "This app is a draft" | You registered the app and have not submitted it. Nobody can connect it. |
| **Pending**, with the message "Waiting for an operator to review this app" | You submitted the app. An operator has not decided yet. |
| **Approved** | An operator approved it. People can connect it while its domain is **Verified**. If the domain is not verified, nobody can connect it until you verify again. |
| **Rejected** | An operator rejected it. The page shows the reason. It cannot be submitted again. Register a new app, or delete this one. |
| **Suspended** | An operator suspended it. The page shows the reason. Every connection to it is refused until an operator reinstates it. |

| Domain state | What it means |
|---|---|
| **Not verified** | Bella has not found the TXT record yet. |
| **Verified** | Bella found the record. |
| **Lapsed** | The proof was verified and then the record was missing on three daily checks in a row. Publish the record and verify again. |

## The flow

Your app signs the person in with Bella's identity provider, asks Bella for a setup address, and sends the person there to choose what to share. Then it reads.

The examples use the hosted service. For a self-hosted installation, replace `https://api.bella-baxter.io` with your own API address, and replace the issuer with the one your installation publishes. Read it from the `issuer` field of `GET /api/v1/auth/config`, a route that needs no sign-in:

```sh
curl https://api.bella-baxter.io/api/v1/auth/config
```

The hosted service's issuer is `https://auth.bella-baxter.io/realms/bella-baxter`. The `setupUrl` in step 2 is built from the installation's console address, so on a self-hosted installation it points at your console.

1. **Sign the person in with authorization code and PKCE.** Use your client id, the scope `openid offline_access` and the challenge method `S256`. There is no consent screen from the identity provider. Bella's setup page is the consent.

   PKCE ties the code to your session. It is required: the identity provider refuses a code exchange that has no `S256` verifier.

   Ask for the scope `offline_access`. With it you get a refresh token that keeps working after the person's browser session ends, so your app keeps access until the connection is revoked or expires. Your access token carries none of the person's roles.

   ```http
   GET https://auth.bella-baxter.io/realms/bella-baxter/protocol/openid-connect/auth
       ?client_id=bella-app-<id>
       &response_type=code
       &scope=openid%20offline_access
       &redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback
       &code_challenge=<S256 challenge>
       &code_challenge_method=S256
       &state=<random>
   ```

   The `redirect_uri` here is an address registered for your app. Then exchange the code. Your app is a confidential client, so send the client secret:

   ```http
   POST https://auth.bella-baxter.io/realms/bella-baxter/protocol/openid-connect/token
   Content-Type: application/x-www-form-urlencoded

   grant_type=authorization_code
   &client_id=bella-app-<id>
   &client_secret=<client secret>
   &code=<code>
   &redirect_uri=https://app.example.com/callback
   &code_verifier=<verifier>
   ```

   Keep the refresh token. The access token is short-lived. To get a new access token, call the same token address with `grant_type=refresh_token`, your client id and secret, and the refresh token.

2. **Ask Bella for a setup address.** Send the access token. The `redirectUri` must equal one of your registered addresses exactly, character for character. `state` is optional, up to 512 characters, and Bella gives it back to you at the end.

   ```http
   POST https://api.bella-baxter.io/api/v1/connected-apps/setup
   Authorization: Bearer <access token>
   Content-Type: application/json

   {
     "redirectUri": "https://app.example.com/connected",
     "state": "b7c1f0"
   }
   ```

   ```json
   {
     "setupUrl": "https://console.bella-baxter.io/connect/setup/<token>",
     "expiresAt": "2026-01-01T12:10:00Z"
   }
   ```

   The address works once and lasts 10 minutes. If the redirect address is not registered, the answer is `400` with the problem type `connected-app-redirect-invalid`, and nothing is created.

3. **Send the person to `setupUrl`.** Open it in their browser. Only the person you signed in can complete it.

4. **The person allows or declines.** They pick the organisation, project, environment, an optional scope tag and how long access lasts. Environments they cannot read are not listed. An organisation that cannot take a connection is shown with the reason. If your app is not approved, or its domain is not verified, the page refuses the connection and says the app cannot take new connections.

5. **The browser comes back to your redirect address.** Bella sends it to the address you gave in step 2 and adds your `state`:

   ```text
   https://app.example.com/connected?state=b7c1f0
   ```

   If the person declined, the address also carries `error=access_denied`:

   ```text
   https://app.example.com/connected?error=access_denied&state=b7c1f0
   ```

   Check `state` against the one you sent. Declining, or closing the page, creates no connection.

6. **Read the grant and the secrets.** Send the same access token, and refresh it with the refresh token when it expires.

   ```http
   GET https://api.bella-baxter.io/api/v1/connected-apps/grant
   Authorization: Bearer <access token>
   ```

   ```json
   {
     "organisationName": "Example Organisation",
     "projectSlug": "my-project",
     "environmentSlug": "production",
     "scopeTag": null,
     "expiresAt": null
   }
   ```

   ```http
   GET https://api.bella-baxter.io/api/v1/connected-apps/grant/secrets
   Authorization: Bearer <access token>
   ```

   ```json
   {
     "environmentSlug": "production",
     "environmentName": "Production",
     "secrets": { "DATABASE_URL": "postgres://...", "STRIPE_KEY": "sk_live_..." },
     "version": 42,
     "lastModified": "2026-01-01T12:00:00Z"
   }
   ```

   This is the same response shape as reading an environment's secrets with an API key. If the grant has a scope tag, only the secrets with that tag are returned. A tag that no secret carries gives an empty `secrets` object.

The grant belongs to the sign-in session that ran the setup. If you sign the person in again from scratch, you start a new session and run the setup again.

## Refusals

- **`403` `connected-app-grant-refused`.** Every refusal is the same answer, with the same status, headers and body. It happens when the connection was revoked, expired or never existed. It also happens when the app is suspended, the person who connected it was removed from the organisation or is suspended, the person can no longer read the environment, the environment is gone, the organisation turned connected apps off, or the organisation enforces zero-knowledge encryption. The app cannot tell which, by design, so it cannot be used to learn about the organisation. Treat it as "ask the person to connect again". Do not retry in a loop.
- **`503` `connected-app-unavailable`.** Bella could not decide right now. Nothing was granted. Try again later.
- **`429` `monthly-quota-exceeded`.** Your organisation is over its API quota. See [Who pays](#who-pays).
- **`400` `connected-app-redirect-invalid`.** The redirect address on the setup request is not one of your registered addresses.

An app token works **only** on these three routes. The rest of the Bella API refuses it.

## Rotation and caching

Every read returns the current values, so a secret that was rotated is seen on your next read. Bella does not cache the grant either: a revocation applies on the next read.

- **Cache with a refresh interval.** Re-read every few minutes, or whenever your app starts a job that needs fresh values. Pick the interval that matches how quickly you need to see a rotation.
- **Do not use webhooks for this.** Webhooks belong to the person's organisation, and an app cannot create one. See [Webhooks](/features/webhooks) for what the organisation itself can subscribe to.
- **Never cache across a `403`.** When you get `connected-app-grant-refused`, drop what you cached for that person. The values are no longer yours to hold.
- **There is no SDK helper.** Call the routes with any HTTP client.

## What the person sees

Every read appears in the audit log of the organisation that granted access, with the actor `application: <your app name>` and the person who connected the app beneath it. A refused read is recorded only when the connection exists. A request that matches no connection, a `503` and a `429` are not recorded. The person sees and revokes each connection under **Connected apps**; see [Manage connected apps](/features/connected-apps-manage).

## For organisations

An Owner or Admin can switch connected apps off for the organisation. While it is off, nobody can connect an app, and every existing connection is refused. An organisation that enforces zero-knowledge encryption cannot take connected apps at all. See [Manage connected apps](/features/connected-apps-manage).

## See also

- [Manage connected apps](/features/connected-apps-manage)
- [Webhooks](/features/webhooks)
- [Audit Logs](/audit/)
- [API Keys](/features/api-keys)
