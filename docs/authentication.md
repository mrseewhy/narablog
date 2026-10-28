# Authentication and authorization

## Local setup

Use Node.js 22.18 or newer. Copy `.env.example` to `.env`, configure a PostgreSQL
connection, set `BETTER_AUTH_URL` to the local origin, and generate a random
`BETTER_AUTH_SECRET` of at least 32 characters. Never commit `.env`.

Apply migrations before starting the updated app:

```sh
npm run db:migrate
npm run dev
```

`npm run db:generate` creates future migrations from the Drizzle schema. The
Better Auth generator can overwrite custom fields and the `ROLES` import;
review its output before replacing `lib/data/auth-schema.ts`.

## Email delivery

`lib/email/auth-email.ts` is the sole delivery adapter. In local development,
with a loopback `BETTER_AUTH_URL`, it prints verification, password reset, and email-change links to the server
terminal. It never returns those URLs to the browser. No mail is sent.

Production and Vercel deployments reject email-dependent requests with 503
until a provider is implemented. Do not enable terminal logging on deployed
hosts. To add Resend later, implement delivery in this adapter and replace its
availability check with validated provider configuration. Do not remove the
availability check without providing real delivery.

## Registration, verification, and recovery

Registration requires name, email, and an 8–70 character password containing
uppercase, lowercase, a number, and a supported special character. Passwords
are never trimmed. Shared server hooks enforce the policy for actions and
for direct Better Auth endpoint requests.

New accounts are regular users. Registration does not establish a session;
users must open the verification link and then sign in. Existing unverified
sessions cannot access private areas. Verification links expire after one
hour. The verification page can request a replacement link.

Password reset requests use the same response whether an account exists or
not. Reset links expire after 30 minutes, are single-use, and successful reset
revokes existing sessions. Invalid and expired links have a path to request a
replacement. Password changes require the current password and offer revocation
of other devices, enabled by default.

Email changes require approval at the current address and verification at the
new address before completion. A fresh session may be required by Better Auth.
Profile mutations accept only the explicitly validated profile fields, never
role, email verification, or ban flags. The same profile limits and role
validation also run in the shared user-create and user-update database hooks,
so extra signup fields and direct admin requests cannot bypass them. Website
values are trimmed before validation; passwords are never trimmed, and leading
or trailing spaces remain part of the password.

## Authorization

`proxy.ts` checks the database session before admin/dashboard rendering.
Layouts retain their own checks. Private queries and server actions check
again at their data boundary. A cookie's presence alone never grants access.

The only roles are the constants in `lib/roles.ts`. Administrators use `/admin`
and regular users use `/dashboard`. Unauthenticated requests redirect to
`/sign-in`, unverified sessions to `/verify-email`, and suspended accounts to
`/unauthorized`. Session lookup failures reject access instead of rendering
protected content. Client-controlled role values are never trusted.

Post lists, editing, saving, and deletion use real database records. Authors
can access only their own posts, including when manually changing an ID or
calling an action directly. Administrators may manage all posts and assign
active verified authors. Public queries return only published posts. Drafts
are not exposed by the blog route. Block content is rendered as React text;
raw authored HTML is not injected. Image uploads and rich public formatting
are separate publishing enhancements.

## Initial admin and user management

Register and verify the intended account locally, then run:

```sh
npm run auth:bootstrap -- --email owner@example.com
```

This local-only script uses a transaction and advisory lock, refuses to run if
an administrator already exists, requires an active verified account, assigns
`ROLES.ADMIN`, and revokes that account's existing sessions. Sign in again.
There is no public bootstrap endpoint and no default admin password.

The admin user screen lists persisted users with pagination. Admins can create
users, assign one of the two roles, suspend/restore accounts, and revoke
sessions. New admin-created users must also verify their email. An admin cannot
remove their own administrator access through the supported admin endpoints.
Role changes through the UI revoke the affected user's sessions.

Account settings show real profile details and the account's active sessions.
The admin session screen shows active sessions across users. Session revocation
uses IDs in the UI and resolves bearer tokens only on the server. Revoking the
current session returns the browser to sign-in.

## Production review

- Use the exact HTTPS production origin for `BETTER_AUTH_URL`; the same origin
  is the trusted origin. Add additional trusted origins only deliberately.
- Set a separately generated `BETTER_AUTH_SECRET` of at least 32 characters.
  Auth rejects requests in production if the secret or HTTPS URL is missing.
- Better Auth uses secure cookies in production; do not override that behavior.
- Enable real email delivery before enabling registration/recovery publicly.
- Vercel supplies `VERCEL=1`. Both auth and the custom rate limiter trust only
  `x-vercel-forwarded-for` there. Non-Vercel production requires a separately
  reviewed trusted proxy integration; it does not trust arbitrary headers.
- Local development deliberately shares one localhost rate-limit bucket.
- Configure a separate `CRON_SECRET` for rate-limit cleanup.
- Apply migrations before deploying, retain database backups, and use a
  database region close to the app's server region.

## Verification

```sh
npm run lint
npx tsc --noEmit
npm test
npm run build
```

`test:auth` creates a unique disposable PostgreSQL schema, applies migrations
there, and starts a separate development server with its own auth secret,
origin, and output directory. It verifies real HTTP auth requests, route guards,
and post server actions. It drops only its own schema afterward. The database
role needs permission to create/drop schemas. Neon tests use the direct endpoint
because its pooler does not accept startup `search_path` options. Never run
concurrent instances against the same `.next-auth-e2e` output directory.

The test runner does not submit external emails or use existing user accounts.
It prints pass/fail summaries, not delivery URLs, credentials, or session tokens.

### Existing schema baseline

This workspace's tables originally existed without corresponding migration
history. Before applying migration 0004, their columns, defaults, identities,
nullability, constraints, and indexes were compared with snapshot 0003. Only
then were migrations 0000–0003 recorded as already applied. No existing account
or content records were removed. Fresh databases should run normal migrations.
The one-time script `scripts/baseline-existing-database.mjs` refuses non-empty
migration history or a schema mismatch; its default mode is a read-only dry run.
