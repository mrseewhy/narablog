# Admin user management

`/admin/users` is available only to active administrators. The
server checks authorization again before querying account records, and the
management action checks it before changing any role, status, or session.
The list returns only the fields displayed in the interface; passwords and
session tokens are never included.

The list contains 25 accounts per page in a stable creation order. Search by
name or email, filter by role and active/suspended status, or combine filters.
The database applies filters before counting and paging, so navigation and
result totals match. Invalid page values use page one; pages beyond the result
set show the final valid page. Search terms are limited to 100 characters and
SQL wildcards in them are treated as literal characters.

Role and suspension actions identify the target and effect before confirmation.
Admins cannot change their own role or status from this screen, or revoke their
own sessions here. Role changes revoke the target's existing sessions. The
session management screen handles an admin's own sessions. Admin account
creation uses the shared signup password and role validation. New accounts can sign in immediately without email verification. The supplied
address is not verified in this temporary registration mode.

The list uses skeleton loading and has a retryable error screen. Integration
checks use a disposable database schema to verify pagination, filtering,
role/status actions, and permission boundaries.
