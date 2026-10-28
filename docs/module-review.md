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

## Remaining modules, in order

5. Admin user management: role/status controls, pagination, permission boundaries.
6. Session management: device lists, revocation, expiry, current-session behavior.
7. Dashboards: statistics and remaining demo activity.
8. Public site: navigation, feeds, metadata, accessibility, and mobile layouts.
9. Deployment and final regression checks: configuration, migrations, and complete
   cross-module checks. Deployment itself requires a separate request.
