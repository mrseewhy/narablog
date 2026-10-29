# Module review order

Each module is reviewed for UI behavior, validation, database operations,
authorization, loading/error states, and regression coverage before moving on.

## 1. Authentication and accounts

Completed on 2026-10-27. Verification passed: 20 integration checks, 4 unit
checks, ESLint, TypeScript, and the production build. Integration data used a
disposable database schema, which was removed afterward.

Changes in this review:

- Enforced profile limits and the application's two roles in shared user-create
  and user-update hooks. Direct signup/admin requests use the same rules.
- Trimmed website input before URL validation while preserving passwords exactly.
- Replaced the password regex's accidental first-character restriction with
  explicit complexity checks.
- Added accessible signup field errors, pending-state input protection, and
  clearing of old errors before submission. Removed a nested main landmark from
  the shared auth layout.
- Made signup verification links return to the sign-in confirmation state.
- Added an account-specific error boundary using this Next.js version's retry API.

Real email delivery remains intentionally deferred until Resend is connected.
Development delivery is restricted to loopback URLs; deployed requests do not
print auth links or falsely report email delivery.

## 2. Categories

Reviewed on 2026-10-27. Added admin-only editing and confirmed deletion, shared
client/server validation, stable URLs after renaming, and database enforcement
of case-insensitive name uniqueness. Deletion is blocked for categories with
draft or published posts, including concurrent assignments.

Public and admin directory counts now use aggregate queries. Admin statistics
show actual published posts, drafts, and empty categories. Changes invalidate
the relevant public caches. Edit pages use skeleton loading states.

The name-index migration was applied after checking for existing conflicts.
See [category behavior and maintenance](categories.md).

Verification passed: 25 integration checks, 5 unit checks, ESLint, TypeScript,
and the production build. Integration data used a disposable schema, which was
removed afterward.

## 3. Posts and publishing

Reviewed on 2026-10-28. Publishing requires article text; empty drafts remain
supported. Added bounded, structured rich-content validation and safe URL
checks. Public articles preserve document structure with escaped React output.

Admin edits keep ownership unless another author is selected. Ordinary users
cannot assign, edit, or delete another account's posts. First publication dates
and article URLs remain stable through editing and republishing; the publication
date migration was applied with a backfill for existing published articles.

Article routes query a single published record, category feeds filter in the
database, and management lists omit article bodies. Editor saves wait for content
readiness and lock fields while pending. Post routes have retryable error states.

See [post behavior and current limits](posts.md).

Verification passed: 27 integration checks, 8 unit checks, ESLint, TypeScript,
and the production build. The disposable integration schema was removed.
The browser smoke check could not be completed because the page context changed
repeatedly during interaction; editor behavior was not visually verified.

## 4. Contact messages

Reviewed on 2026-10-28. The admin inbox reads stored contact submissions and
shows real total, unread, and read counts. Opening a message marks it read, and
admins can mark it unread again. Public submissions and state changes refresh
the unread count on the admin dashboard. Inbox access and state changes require
an admin session.

The public form and action share bounded validation, an IP rate limit, and a
honeypot. The action returns only success or validation feedback. The form
confirms that a message was saved without promising an email reply. The inbox
has skeleton loading and retryable error states. See [contact behavior](contacts.md).

Verification passed: 29 integration checks, 9 unit checks, ESLint, TypeScript,
and the production build. Integration data used a disposable schema, which was
removed afterward.

## 5. Admin user management

Reviewed on 2026-10-28. Added database search and role/status filters to the
admin user list. Counts and pagination use the same filters, with deterministic
ordering and out-of-range pages clamped to the last available page. The list
returns only display fields and has a retryable error state.

Role and suspension controls now describe their effects before confirmation.
The action blocks changes to an administrator's own account and sessions;
role changes revoke the affected account's existing sessions. Account creation
uses shared signup validation and accessible field feedback. See [admin user
management](admin-users.md).

Verification passed: 31 integration checks, 9 unit checks, ESLint, TypeScript,
and the production build. The disposable integration schema was removed.

## 6. Session management

Reviewed on 2026-10-28. Account session lists use database time to exclude
expired records, show the current session first, and display expiry. The admin
bulk sign-out action now states that it affects only the admin's own other
devices. Session revocation accepts an ID while bearer tokens remain on the
server; ordinary users can affect only their own sessions. Revoking the current
session returns the browser to sign-in. The protected daily cleanup job removes
expired session rows. Session and profile pages have retryable error states.
See [session behavior and expiry](sessions.md).

Verification passed: 33 integration checks, 9 unit checks, ESLint, TypeScript,
and the production build. The disposable integration schema was removed.

## 7. Dashboards

Reviewed on 2026-10-28. Dashboard counts already came from stored records.
Replaced both demo activity timelines with account, post, and active-session
events derived from database records. User activity is owner-scoped; the admin
view covers all accounts. The visible counts describe at most 100 recent
events. Retryable error states and loading skeletons cover both routes. See
[dashboard and public-site behavior](dashboards-and-public-site.md) for the
limits of a record-derived timeline.

## 8. Public site

Reviewed on 2026-10-28. Removed demo post fallbacks, mock images, and unused
demo files. Home and category feeds show published records; category links use
stored slugs. Added route metadata and canonical URLs for home, categories,
category feeds, articles, and contact. The navigation and footer wrap on narrow
screens, and the public layout gives pages their full responsive width. The
contact page no longer promises an unconfigured email address or response time.

## 9. Final regression and deployment review

Reviewed on 2026-10-28. Migration consistency, ESLint, TypeScript, unit checks,
and the production build passed. The streamed not-found assertion was aligned
with this Next.js version's documented HTTP 200 plus `noindex` behavior.
Deployment was not requested or performed.

## Temporary registration mode

On 2026-10-28, registration was changed to create a session immediately
without sending verification email. Public and admin-created accounts can sign
in without email delivery. The private-route and author checks no longer treat
`email_verified` as an access gate. Password recovery and email changes still
require email delivery. Account ownership by address is unconfirmed until
verification is restored. The later full integration run covers this mode.

## Demo seed and home feed

Completed on 2026-10-29. The local-only, repeatable seed created two regular
accounts, one admin, five categories, and fifty published posts. Database
verification confirmed each category has ten published posts and all three
generated credentials match the stored password hashes. Credentials are kept
in an ignored, owner-readable local file.

The home feed now renders ten posts initially and loads additional pages as a
scroll sentinel enters view. Cursor pagination orders by publication time and
post ID, and a manual load button remains available. See [demo seed and
scrolling feed](demo-seed-and-feed.md).

Final verification passed: 36 integration checks, 9 unit checks, ESLint,
TypeScript, and the production build. The disposable integration schema was
removed.
