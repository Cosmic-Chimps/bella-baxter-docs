# Manage connected apps

A connected app is a third-party app that you let read the secrets of one environment. This page is for two readers: a person an app has asked to connect, and an organisation Owner or Admin. If you build apps, read [Connect with Bella Baxter](/features/connected-apps) instead.

## What a connected app can and cannot do

- **It can read.** It can read the secret values of the one environment you choose.
- **It cannot change anything.** It cannot create, change or delete a secret.
- **It sees one environment only.** You can narrow it further to one scope tag. A scope tag is a label on a secret. With a scope tag, the app sees only the secrets that carry that tag.
- **It never gets an API key.** It reads through a connection that you can revoke at any time.

## Approve or decline a connection

An app starts a connection by sending you to a Bella page titled **Connect Bella Baxter**. You must be signed in to Bella. Nothing is shared until you choose **Allow**.

### Check the app before you allow it

The page shows three things about the app:

- **The app's name.**
- **The domain it belongs to.** Bella checked that the app's developer controls this domain.
- **The organisation that registered the app.**

Read the domain, not only the name. A name is just text the developer chose. The domain is the part Bella verified. If the domain is not the one you expect, choose **Decline**.

### Choose what to share

1. **Organisation.** Pick the organisation. You see only organisations you belong to.
2. **Project.** Pick the project.
3. **Environment.** Pick the environment. Only environments you can read are listed.
4. **Scope tag (optional).** Enter a tag to limit the app to the secrets that carry it. Leave it empty to share every secret in the environment. Use lower-case letters, digits, hyphens and underscores only.
5. **Access lasts.** Choose how long the app can read. After that the app can no longer read. You can still revoke it sooner. The choices are:
   - **Until I revoke it**
   - **30 days**
   - **90 days**
   - **1 year**
6. Choose **Allow** to connect the app, or **Decline** to refuse it.

If you choose **Decline**, or you close the page, nothing is shared. Bella then sends your browser back to the app.

### When an organisation is greyed out

An organisation can appear greyed out, with a reason. You cannot pick it. The reasons are:

- **Connected apps are switched off.** An Owner or Admin turned connected apps off for that organisation.
- **Registered devices are required.** The organisation requires registered devices, and a connected app has none, so apps cannot read its secrets.
- **The organisation is not active.**

If no organisation is available, or none has an environment you can read, the page says there is no environment you can share. Nothing can be connected from that page.

### Messages on the approval page

- **"This link expired, was already used, or belongs to another person. Start again from the app."** The link works once, lasts 10 minutes and is for the person who was signed in to the app. Go back to the app and start again.
- **"This app cannot take new connections right now. Ask its developer."** The app is not approved (for example, it is suspended), or Bella can no longer verify its developer's domain. Ask the developer.
- **"Nothing was shared. Start again from the app."** The page ended without a connection. Start again from the app.

## See and revoke your connections

Open **My Profile**, then the **Connected apps** tab. The tab lists every connection you made, across all your organisations.

| Column | What it shows |
|---|---|
| **App** | The app's name, its domain and the organisation that registered it |
| **Organisation** | The organisation the connection reads from |
| **Project / environment** | What the app reads, with the scope tag if there is one |
| **Connected** | The date you connected it |
| **Last used** | When the app last read, or **Never** |
| **Expires** | The expiry date, or **No expiry** |
| **Status** | **Active**, **Stopped** or **Revoked** |

A connection has one of three statuses:

- **Active.** The app can read now.
- **Stopped.** The connection exists, but Bella refuses the app's reads for now. The row says why. A stopped connection can start serving again when its cause ends. The reasons are:
  - The app was suspended by the platform operator.
  - The organisation now requires registered devices.
  - Connected apps are switched off for the organisation.
  - The person who connected it is suspended.
  - The connection expired.
  - The organisation is suspended.
  - The person who connected it can no longer read this environment.
  - The environment is no longer available.
- **Revoked.** The connection was ended. The row says who ended it and when. A revoked connection stays in the list for 30 days, so you can see what was cut. It cannot start serving again.

To revoke a connection, choose the revoke button at the end of its row, then confirm with **Revoke**. A revoke takes effect on the app's next read. To connect again, the app must ask again and a person must approve it.

## For Owners and Admins

Open **Settings**, then the **Connected apps** tab. Only an organisation Owner or Admin can use this tab.

### The switch

The switch **Allow connected apps in this organisation** is on by default.

- **While it is off,** nobody can connect an app, and every read through an existing connection is refused.
- **When you turn it on again,** existing connections resume without asking again.

### Every connection in the organisation

Below the switch, the tab lists every connection that members of the organisation made. It has the same columns as the personal list, with **Connected by** in place of **Organisation**. You see who connected each app. You can revoke any connection, including while the switch is off. The row then shows "Revoked by an organisation administrator".

### When a member is removed, leaves or is suspended

- **A member is removed, or leaves the organisation.** Bella revokes every connection that member made.
- **A member is suspended.** Bella refuses reads through their connections while the suspension lasts. The connections show as **Stopped**, with the reason "The person who connected it is suspended". Nothing is revoked, so the connections work again when the member is restored.

## Organisations that require registered devices

An organisation that requires registered devices cannot take connected apps. A connected app has no registered device, so it cannot read secrets that only a registered device may read. Members cannot connect an app to that organisation, and its existing connections show as **Stopped**.

## Who pays

The app's owner pays for every read. The reads count against the API quota of the organisation that registered the app. They never count against you, your organisation, your allowance or your API keys.

## In the audit log

Each read by a connected app is a row in your organisation's audit log. The actor shows as `application: <app name>`, with `Connected by <person>` beneath it. The action is `export_all`, the same as when a person reads all of an environment's secrets.

A read that Bella refuses, through a connection that exists, appears as **Connected app read refused**. The row's detail says why.

These events do not write an audit row today:

- Connecting an app.
- Revoking a connection.
- Switching connected apps on or off for the organisation.
- Registering or changing a developer app.

If a control of yours depends on evidence of these, keep that evidence outside Bella for now. See [Audit Logs](/audit/) for the fields of a row.

## See also

- [Connect with Bella Baxter](/features/connected-apps), for developers
- [Audit Logs](/audit/)
- [Team members](/features/team-members)
