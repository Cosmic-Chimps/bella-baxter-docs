# Support policy

::: warning Placeholder
This page is a placeholder. It states how a licence key relates to the versions of a self-hosted installation, which is how the product works. **Which versions receive patches, and for how long, is the support policy, and that policy is still to be written.** Do not plan around the section marked below until it is completed.
:::

## How a licence key relates to versions

Bella Baxter is released in **version lines**. A line is a minor version: `1.1`, `1.2`, and so on. Its first release is `X.Y.0`, and later releases of the same line are patches: `X.Y.1`, `X.Y.2`.

A licence key for a self-hosted installation carries one date, `upgrades_until`.

- A key covers **every line whose first release (`X.Y.0`) is on or before that date**. A line first released after the date is not covered.
- A covered line stays covered: every patch of it that we publish runs with the licensed modules on, whenever the patch is released.
- A line that the key does not cover still installs and runs, and all of the core works. Only the licensed modules (single sign-on, audit streaming to a SIEM and certificate rotation) run as lapsed on it.
- A renewed key moves the date forward and covers the lines released up to it.

Each release of the self-hosted bundle says which line it belongs to and the date that line was first released, in a file named `RELEASE-LINE` inside the bundle. `bella.sh` reads it, together with your key, and tells you before the start if your key does not cover the line. This notice is informational: nothing is blocked by it.

## Which lines receive patches

Which lines receive patches, and for how long, is the support policy. A patch for an older line is cut from that line's own maintenance branch, so a security fix can reach a line that is no longer the newest one.

## To be completed by Business

::: info To be completed by Business
This section is the policy itself, and it is intentionally empty until it is decided:

- How many lines, or how long a line, receives security patches.
- Whether any line receives fixes that are not security fixes, and for how long.
- What a customer can expect when a line leaves support, and how long before it is announced.
- How a customer asks for a patch of a line the policy does not cover.
:::
