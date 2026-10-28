# Posts and publishing

Verified accounts create posts at `/dashboard/posts/create`. Admins can manage
all posts at `/admin/posts` and assign an active, verified author. Ordinary
accounts can only read, update, and delete their own private posts. A submitted
author ID cannot override that restriction. Admin edits keep the existing
author unless another author is explicitly selected.

At least one category must exist before the editor opens. When none exist,
admins see a link to create the first category, while ordinary accounts see a
message explaining that an administrator must add one. Both can return to their
post list. No default category is created automatically.

Posts start as drafts. Saving a draft requires a title and category but permits
an empty editor. Publishing requires article text. Returning a published post to
Draft removes it from the home feed, category directory counts, category feed,
and public article route after cache invalidation. This is unpublishing, not a
separate unpublished revision: editing and saving a Published post changes the
live article immediately. There is no autosave or revision history.

The server validates supported BlockNote blocks, nested content, tables, and
URLs. Documents are limited to 200,000 serialized characters, 1,000 top-level
blocks, and bounded nesting. Executable URL schemes are rejected. Public article
rendering uses React elements and escaped text rather than submitted HTML.
Headings, lists, emphasis, links, quotes, code, tables, checklists, and supported
media are rendered structurally. Media uses URL references; file storage and
uploads are not configured by this module.

Each post gets a stable URL on creation. Renaming does not change it.
`published_at` records the first publication time and remains stable through
editing, unpublishing, and republishing. Existing published posts retain their
previous displayed date through the migration backfill. The public feed sorts
by publication time rather than the time a draft was started.

Public article routes query a single published post by slug. Category feeds
filter in the database. Dashboard post lists and public summary results omit
article bodies from the data returned to their callers. Public summary queries
still read content internally to derive excerpts and reading times.

The editor waits until its content input is ready before allowing saves and
locks both form fields and rich text while saving. Post routes have retryable
error boundaries; private pages retain their skeleton loading states.

Regression checks run with `npm run test:unit` and `npm run test:auth`.
The integration suite uses a disposable schema and includes permissions,
publication validation, owner assignment, stable URLs and dates, formatted
articles, unpublishing, republishing, deletion, and cache invalidation.
