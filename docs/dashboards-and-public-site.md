# Dashboards and public site

Dashboard counts use persisted users, posts, categories, and contact messages.
The activity screens show the latest 100 events inferred from current account,
post, and active session records. An ordinary account sees only its own records;
an administrator can see all accounts. The counts above the table describe the
100 displayed events. This is a recent-record view, not a permanent audit log:
deleted records and ended sessions no longer appear, and repeated edits to the
same record are not preserved as separate events. A durable audit log would
require a dedicated event table and write hooks.

The home feed and category feeds display published posts only. Drafts are
excluded from feeds, public article routes, and category counts. Posts without
uploaded cover images render as text cards. Category pills link to their
category feed. Invalid category and article slugs show the not-found page and
receive `noindex`; Next.js can send HTTP 200 when that page streams after the
response has started.

Home, categories, category feeds, articles, and contact have route metadata.
Published article metadata includes its title, excerpt, canonical URL, and
publication date. Category metadata uses its current name and description.
The public navigation and footer wrap on narrow screens; article and feed
content keep their own responsive widths.

Deployment checklist: apply all migrations, set `DATABASE_URL`, the exact HTTPS
`BETTER_AUTH_URL`, a strong `BETTER_AUTH_SECRET`, and `CRON_SECRET` in Vercel.
Registration works without email delivery, but the address is unverified.
Recovery and email changes still need a provider in production. The daily cron cleans rate limits and expired sessions. The final
regression suite uses a disposable database schema and never deploys the app.
