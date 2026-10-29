# Demo accounts and scrolling feed

Run `npm run db:seed-demo` from a local development configuration after applying
migrations. The script is restricted to a localhost app origin. It creates two
regular accounts and one admin account, five topic categories, and ten published
posts for each category. It runs in one database transaction and can be rerun
without duplicating its fixtures. Existing unrelated accounts and posts are
left in place.

The accounts are `ada@naroblog.test`, `tunde@naroblog.test`, and
`amina@naroblog.test` (admin). Random passwords are stored in the ignored,
mode-0600 file `.seed-credentials.json` at the project root. Keep that file
private. If fixture accounts already exist and the file is missing, the seed
stops rather than resetting their passwords.

The home feed renders ten posts initially. When the reader approaches its end,
the browser requests another page from `/api/posts` using a publication-time
and post-ID cursor. A manual “Load more stories” button remains available.
Cursor pages show published posts only, preserve a stable order for posts with
the same timestamp, and deduplicate cards if content changes while scrolling.
Category feeds continue to show all posts in their category.
