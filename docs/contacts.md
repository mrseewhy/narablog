# Contact messages

Visitors can submit a message through `/contact` without an account. The form
checks name, email, subject, and message length in the browser and in the server
action. Email addresses are normalized to lowercase. Messages are limited to
5,000 characters, and the server rate limits submissions by client IP. A filled
honeypot field is acknowledged without storing the submission.

The form stores accepted submissions in `contacts`. It does not send email.
The success screen confirms that the message was saved, without promising a
reply time. The server action returns only success and validation feedback;
message records are not returned to public callers.

Admins can read stored messages at `/admin/contacts`. The inbox displays real
counts, searchable sender and message details, and read/unread filters. Opening
a message marks it read; admins can mark it unread again. The unread count on
`/admin/dashboard` is refreshed when submissions or read states change.
Access to the inbox and state changes is checked in the data layer and server
action. There is no "Replied" state because replies are not sent through the
app yet.

The inbox loads a skeleton while its server data is pending and offers a retry
screen on unexpected errors. `npm run test:unit` checks validation;
`npm run test:auth` checks real submissions and admin permissions using a
disposable database schema.
