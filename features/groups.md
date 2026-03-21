# Groups

Groups let you manage access for multiple users at once. Assign a group to a project or environment and all group members inherit the specified role.

## Create a Group

From the WebApp: **Settings → Groups → Create Group**

```sh
bella groups create --name "Backend Team"
bella groups create --name "Ops Team"
```

## Add Members to a Group

```sh
bella groups add-member --group "Backend Team" --user alice@example.com
bella groups add-member --group "Backend Team" --user bob@example.com
```

## Assign a Group to a Project

```sh
bella groups assign-project \
  --group "Backend Team" \
  --project my-api \
  --role MEMBER
```

All current and future members of **Backend Team** will have `MEMBER` access to `my-api`.

## Assign a Group to an Environment

```sh
bella groups assign-environment \
  --group "Ops Team" \
  --project my-api \
  --environment production \
  --role ENVIRONMENT_OWNER
```

## Remove a Group from a Project

```sh
bella groups unassign-project \
  --group "Backend Team" \
  --project my-api
```

## Remove a Member from a Group

```sh
bella groups remove-member --group "Backend Team" --user alice@example.com
```

Removing a user from a group immediately revokes any project/environment access they had via that group (unless they also have direct access).

## List Groups

```sh
bella groups list
bella groups members "Backend Team"
```

## Use Cases

- **Onboarding** — add a new developer to the "Backend Team" group and they get access to all relevant projects automatically
- **Off-boarding** — remove from the group and access is revoked everywhere at once
- **Environment restrictions** — only the "Ops Team" group has access to `production`; everyone else is limited to `dev` and `staging`
