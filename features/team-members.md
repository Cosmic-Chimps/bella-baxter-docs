# Team Members

Owners and Admins manage the people in an organisation from **Team Members**. Selecting a member opens their page, which shows who they are, what they can reach, and the actions you can take on them. Members with the User or Viewer role do not see this page.

## What the page shows

- **Identity.** Name, email address, tenant role, whether the membership is active or suspended, and when they joined.
- **Access.** Every project and environment the member can reach, with their role and how it was granted: directly, through a group (the group is named), or as the project's owner. Each entry links to the project or environment. An Owner or Admin reaches everything through their tenant role, so the page says that instead of listing it.
- **Actions.** Each action is shown enabled, or disabled with the reason. Nothing is hidden: if you cannot take an action on a member, the page tells you why.

If Bella Baxter cannot work out what a member reaches, the page says it could not determine access. It never shows an empty list in that case.

## Change a role, remove access, remove a member

| Action | What it does |
|---|---|
| **Change role** | Sets the member's tenant role to Admin, User or Viewer. Only the Owner can grant Admin, and nobody can grant a role above their own. |
| **Remove access** | Beside each directly granted project or environment entry. Takes that one grant away. Access that comes from a group is managed on the group, and the entry says which group grants it. |
| **Remove from organisation** | Ends the membership. The confirmation states how many projects, environments, API keys, assistant connections and pending invitations the person loses. |

The Owner cannot be changed or removed this way, an Admin cannot act on another Admin, and nobody can act on themselves here (use your own profile).

## Suspend and restore

Suspending a member stops them from acting in this organisation with any credential they hold: console sign-in, the CLI, API keys and assistant (MCP) connections. You give a reason, and it is recorded in the audit log.

- **Nothing is deleted.** Their grants, API keys and connections are kept. Restoring the member brings them back exactly as they were.
- **Only this organisation is affected.** If the person belongs to other organisations, they keep working there, and they can still switch to them.
- **While suspended, other changes wait.** Change their role or credentials after restoring them.
- The Owner cannot be suspended, an Admin cannot suspend another Admin, and nobody can suspend themselves.

Suspension takes effect on the next request. On a deployment with several API instances it can take up to a minute to reach all of them.

## Unblock a locked-out member

Two actions help a member who lost their authenticator app or whose password may have leaked. Both need a reason and an explicit confirmation, and both are recorded in the audit log.

| Action | What it does |
|---|---|
| **Require a password change** | The member must choose a new password at their next sign-in, and every open session of theirs is ended. |
| **Remove second factor** | Removes their one-time-password authenticator. At their next sign-in they are asked to set up a new one. Open sessions are not ended. |

### Who can take them

These actions change the sign-in of the whole account, not only the member's place in your organisation. So they are available only when:

- **this organisation is the only one the account belongs to.** An account that also belongs to another organisation (including one where its membership is suspended) shows: *This account also belongs to another organisation. Ask Bella Baxter support.*
- **the account signs in with a Bella Baxter password.** If it is linked to a company directory, the password and second factor are managed there, and the page says so.
- **the member is not the Owner,** and is not an Admin when you are an Admin.

If Bella Baxter cannot confirm any of this at the moment of the action, it changes nothing and says so. If the password change is accepted but ending the sessions fails, the page reports the action as partly done and names the step that did not finish.

### What these actions do not cover

- **Access already issued keeps working until it expires.** Forcing a password change ends the member's sessions, but a short-lived access token that was already issued stays valid until it expires. How long that is depends on the sign-in settings of your deployment, from minutes up to an hour. Suspending the member refuses those tokens straight away.
- **API keys are not touched.** A new password does not revoke keys the member created. If the keys must stop working, suspend the member.
- **Only authenticator-app (one-time password) second factors are removed.** Passkeys and security keys are not.

## Audit

Every action taken from this page, and every refused credential action, is written to the [audit log](/audit/) with who acted, on whom, what changed and the reason. Filter the action list for "Member" entries to find them.
