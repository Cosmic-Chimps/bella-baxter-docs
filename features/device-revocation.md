# What revoking a device does, and rotating its keys

Revoking a [registered device](/features/e2ee-zke#registered-devices) cuts it off. It does not make the
machine forget. This page says what revocation does, what rotating the device's keys adds, and what
neither one can do.

---

## What revocation does

- **Access stops on the next request.** There is no cache to wait out. A revoked device is refused the
  moment it asks again.
- **Knowledge does not stop.** The device still holds the keys it was handed with earlier reads. With
  those keys and a copy of the stored ciphertext (a backup, direct access to the secret store) it can
  open what it already holds.

Revocation stops access, not knowledge.

---

## What rotating the keys does

Rotation puts every affected project on a **new key** and **re-seals its values** under it. When the run
finishes, the keys the device holds open no current value of those projects, and none written later.

- **Offered at revoke time.** The console's revoke dialog and `bella auth devices revoke` show the
  projects the device received keys for and offer "revoke and rotate". Revoking alone stays possible.
- **Or later.** A revoked device can be rotated at any time, including one revoked before this existed.
  A rotation that was not run stays owed and is listed until someone runs it.
- **Reads keep working.** The rest of your team keeps reading secrets while the keys change. The re-sealing
  runs in the background, and the console's devices page shows its progress.

Revoking never depends on rotating. If the rotation cannot start, the device is still revoked.

---

## What rotation does not do

::: warning Read these before you rely on rotation
- **The device keeps what it already read.** Rotation does not make a machine forget a value it has
  already seen. **Rotate those secrets themselves** (the database password, the API token) at their
  source.
- **Past versions keep their original sealing.** Earlier versions of a secret stay sealed under the key
  they were written with, so the old key still opens them. If that matters, destroy those versions.
- **Organisation-level records are not rotated by revoking.** Provider credentials, webhook and notification
  secrets, and the audit-stream credential stay under the organisation's key. Rotating that key is a
  separate action, described below. A device that read before the per-environment keys were introduced may
  also hold the organisation's key itself.
:::

A run that could not re-seal everything says so and names what it left. Treat it as incomplete, not as done.

### Rotating the organisation key

The organisation Owner can rotate the organisation key in the console: **Settings**, then **Encryption**.
Admins and the CLI can see how many records a rotation would re-seal, but only the Owner can start it.
Revoking a device that used the organisation key offers it, unless the key was already rotated after that device's last read.

The rotation first gives every project that still used the organisation key a key of its own.
Then it writes one new organisation key and re-seals the provider credentials, the webhook and notification secrets, and the audit-stream credential under it.
Last, it checks every record again.
A record edited while the run moves is never overwritten.

You can run it again safely. A run that stopped half way continues and never creates a third key.
The old key is kept, so nothing stops opening.
Like any rotation, it does not make a device forget what it already read.

---

## Which projects are rotated

The projects come from the **access record**: the projects the device received keys for.

If any of them used the organisation's key (it had no key of its own), **every project that uses that
key** is included as well, because a read of such a project handed out the organisation's key itself. A
project with no key of its own is given one.

The preview is **as of the access record**. It lists what the record shows the device receiving, not what
it could have read. A record that cannot be read is never reported as "nothing to rotate". Rotation is
refused until it can be read.

A device that never received a key has nothing to rotate, and the dialog says so.

---

## Who can run a rotation

- **Tenant Owners and Admins** can rotate every affected project.
- **A project's managers** can rotate their own project. They see the rotation owed on the project, since
  the devices page shows them only their own devices.
- **A member who revokes their own device** may not be able to rotate it. The revocation still happens,
  and the rotation is left **owed** for the people above.

Someone who is not an Owner or Admin sees by name the projects their device read. Projects included only
because they share the organisation's key are shown to them as a count.

---

## From the CLI

```sh
bella auth devices revoke <device> --rotate
```

`<device>` is the device id or its `SHA256:` fingerprint. The command shows the projects first, revokes,
and then starts the rotation. Without `--rotate` it asks, in a terminal. `--yes` skips every prompt and
does **not** imply `--rotate`.

To rotate a device that was revoked earlier, run the same command with `--rotate`. Revoking an already
revoked device is not an error.

`-o json` prints one JSON document with the preview and the run, and never prompts. See the
[CLI reference](/cli/#registered-devices).

---

## See also

- [Zero-Knowledge Encryption](/features/e2ee-zke)
- [Projects](/features/projects)
