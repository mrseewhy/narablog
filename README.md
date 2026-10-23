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

The public feed and category pages read static demo data. Article pages resolve
posts by slug and use shared placeholder body text. Unknown article and category
slugs render the marketing not-found page.

Account and contact forms are UI scaffolding without submission handlers.
Dashboard identities, statistics, and activity are mocked. Authentication,
authorization, persistence, publishing, and email delivery are not implemented.
The shell's role prop selects navigation only; it does not restrict access.

Author pages include post browsing, creation, editing, activity, and profile forms.
Admin pages include contacts, users, categories, posts, sessions, activities, and
profile settings. Tables support client-side search and filters; contact messages
can be opened and posts can be selected for editing. These screens use demo data
and forms do not persist changes. Sign-out remains unimplemented.

## Next.js conventions

React Compiler, Cache Components, and partial prefetching are enabled in
`next.config.ts`. Before changing framework-specific code, follow `AGENTS.md`
and read the relevant documentation bundled in `node_modules/next/dist/docs/`.
