# Workload identity on EC2

A workload on an EC2 instance can prove which instance it runs on with the instance's **AWS-signed identity document**. Bella checks the signature against AWS's certificate for the instance's Region, then issues the workload an X.509 or JWT SVID.

An identity document is not a secret, and it never expires. Anyone who has seen it can present it: from a log, a support bundle, or a request forged against the instance's metadata service. So Bella **binds** each instance to its workload the first time it attests:

- The first attestation records the binding and gives the agent a **re-attestation credential**. The agent keeps it in a file only its own user can read.
- Every later attestation of that instance must present the credential. A copy of the document without it is refused.
- The instance can never attest for a different workload in the same environment, whatever it presents.
- After a **stop/start**, AWS issues a new document with a newer launch time (`pendingTime`). Bella re-binds the instance and issues a new credential, so no operator action is needed.

## Before you start

- The instance uses **IMDSv2** (session tokens). The agent never falls back to IMDSv1.
- If the agent runs **in a container**, the instance's metadata `HttpPutResponseHopLimit` must be at least **2**. Otherwise the session token cannot reach the container:

  ```sh
  aws ec2 modify-instance-metadata-options --instance-id i-0abc… \
    --http-tokens required --http-put-response-hop-limit 2
  ```

- Bella already trusts AWS's published certificates for every Region, so there is nothing to paste. To add or replace one (a new Region, or a rotated certificate), set `Spiffe__AwsIid__TrustedCertificates__<region>` to its PEM.

## 1. Set the environment to Strict

Node evidence is checked only in Strict mode. Restrict which AWS accounts may attest:

```sh
bella spiffe set-mode --strict --aws-account 123456789012
```

Without an account allow-list, a workload registered with no `aws:account` constraint could be attested by any EC2 instance in any account.

## 2. Register the workload with an AWS constraint

```sh
bella spiffe add --name billing --node aws:account=123456789012
```

`aws:region` and `aws:instance-id` are also available.

## 3. Run the agent on the instance

```sh
export BELLA_BOOTSTRAP_TOKEN=bax-…
bella spiffe agent --environment-id <environment-id> --name billing --node-type aws-iid
```

The agent prints which instance it presents, and whether it already holds a credential:

```
Node evidence: aws-iid instance i-0abc… (eu-west-1, account 123456789012); re-attestation credential: not yet issued.
```

The credential is kept under `$XDG_STATE_HOME/bella/spiffe-agent` (or `~/.local/state/bella/spiffe-agent`). To keep it elsewhere, use `--state-dir` or `BELLA_AGENT_STATE_DIR`. **Keep that directory on persistent storage**, so a restart of the agent or the instance does not lose it.

To check what the instance would present without starting the agent:

```sh
bella spiffe whoami --node-type aws-iid --environment-id <environment-id> --name billing
```

## Seeing and releasing bindings

```sh
bella spiffe node-bindings
bella spiffe node-bindings release <id>
```

The console shows the same list under the environment's **Identity → Bound EC2 instances**.

Release a binding when:

- the agent **lost its state directory**, and the instance has not been restarted since. Its next attestation is refused until you release the binding;
- you **replaced an instance** under the same id;
- the listing shows a binding **you did not make**.

After a release, the next valid document for that instance binds afresh, to whichever workload attests first. Deleting a workload identity releases its bindings automatically. Every bind, re-bind and release is recorded in the audit log as `node_bound`, `node_rebound` or `node_binding_released`.

## What this does not protect against

- **First use wins.** Someone who holds both an instance's document and the environment's bootstrap token can claim an instance that has **never** attested. The genuine agent is then refused, and the unexpected binding shows in the listing. Release it, and rotate the bootstrap token.
- **The machine itself.** Anyone who can read the agent's state directory on the instance can present its credential. Protect the instance the way you protect any credential on it.
