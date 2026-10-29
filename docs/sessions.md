# Session management

The profile page lists only the signed-in account's active sessions. The admin
session page lists active sessions for all accounts and identifies each owner.
The current session appears first. Each row shows the device's user agent, IP
address, last update, and expiration in UTC. These values may be unavailable
or approximate when supplied by a proxy or browser.

Users may revoke their own sessions. Admins may revoke any session. Session IDs
are sent to the action; bearer tokens remain on the server. Revoking the current
session sends the browser to sign-in. The bulk action revokes only the current
account's *other* sessions, including when used by an admin.

Expired sessions are excluded from lists and cannot be revoked through the UI.
Authentication rejects expired or revoked sessions on the next request. The
daily protected cleanup job deletes expired session rows. It requires
`CRON_SECRET` as a bearer token.
