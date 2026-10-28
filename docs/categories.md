# Categories

Admins manage categories at `/admin/categories`. Creation and editing share
validation on the browser and server: names are trimmed, contain 2–70 characters,
and must produce a usable URL; descriptions contain at most 500 characters.
The server generates the initial slug. Renaming a category preserves that slug
so existing article and category links continue to work.

The database rejects duplicate names regardless of letter case and rejects
duplicate slugs. Migration `0005_lying_mister_fear.sql` adds the name index.
Existing installations must resolve any case-insensitive name duplicates before
applying this migration.

Creation, editing, and deletion require an admin session in both the action and
the data layer. A category containing any draft or published post cannot be
deleted. Move or delete those posts first. The foreign key enforces this even
when a post is assigned during a deletion request.

The public directory counts only published posts. Admin statistics include
drafts separately. Both use aggregate database queries instead of loading
article bodies. Category changes invalidate category and post caches.

Category regression checks are included in `npm run test:auth`, using a temporary
database schema that is removed afterward. Input validation also runs in
`npm run test:unit`.
