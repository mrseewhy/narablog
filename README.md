# NaroBlog

A Medium-style publishing frontend built with Next.js 16.4.2, React 19.3,
TypeScript, Tailwind CSS v4, and shadcn/Base UI components.

## Local development

Install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

```bash
npm run lint       # ESLint checks
npx tsc --noEmit   # TypeScript checks
npm run build     # Production build
npm start         # Serve the production build
```

The build uses `next/font/google` to download Bricolage Grotesque and Literata,
so it requires access to Google Fonts.

## Project structure

- `app/(marketing)/(index)/page.tsx`: homepage and post feed.
- `app/(marketing)/blog/[slug]/`: individual article pages.
- `app/(marketing)/categories/`: category directory and filtered post feeds.
- `app/(marketing)/(auth)/`: sign-in, registration, password recovery,
  email verification, and access-denied screens.
- `app/(marketing)/contact/`: contact page and form.
- `app/dashboard/`: author dashboard.
- `app/admin/dashboard/`: admin dashboard.
- `components/site/`: shared navigation, footer, post list, dashboard shell,
  and theme toggle.
- `components/ui/`: reusable UI primitives.
- `lib/data/demo/`: typed demo posts and categories.
- `app/globals.css`: design tokens, typography, and light/dark themes.

Public pages share the marketing layout. Author and admin layouts use
`AdminShell` with different navigation. The root layout provides system-aware
light/dark theme switching through `next-themes`.

## Current functionality

Authentication includes registration, required email verification, sign-in,
sign-out, password recovery, password changes, verified email changes, and
persisted profile updates. Admin user and session management use real records.
The initial administrator is assigned by a local, controlled bootstrap script.

Post creation, editing, deletion, private lists, and public published feeds use
PostgreSQL. Authors can manage only their own posts; administrators can manage
all posts. Category creation is admin-only. Contact submissions are persisted,
but the contact inbox and activity screens still use demo data.

Local email delivery prints links only to the server terminal. Email-dependent
requests are disabled on deployed hosts until a provider such as Resend is
connected. See [authentication setup, security, and verification](docs/authentication.md)
for migrations, bootstrap instructions, configuration, and test commands.

## Next.js conventions

React Compiler, Cache Components, and partial prefetching are enabled in
`next.config.ts`. Before changing framework-specific code, follow `AGENTS.md`
and read the relevant documentation bundled in `node_modules/next/dist/docs/`.
