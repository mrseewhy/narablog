import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { io } from "next/cache";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/roles";

// React cache deduplicates checks within a render, not across requests.
export const getCurrentSession = cache(async () => {
  // Better Auth reads the clock during initialization and session validation.
  // Exclude those reads from prerendering while allowing runtime prefetching.
  await io();
  const requestHeaders = await headers();

  return auth.api.getSession({
    headers: requestHeaders,
    query: { disableCookieCache: true },
  });
});

export function isAdmin(role: string | null | undefined) {
  return role?.split(",").some((value) => value.trim() === ROLES.ADMIN) ?? false;
}

export async function requireSession() {
  const session = await getCurrentSession();

  if (!session) redirect("/sign-in");

  if (!session.user.emailVerified) redirect("/verify-email");

  const { banned, banExpires } = session.user;
  if (banned && (!banExpires || new Date(banExpires).getTime() > Date.now())) {
    redirect("/unauthorized");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();
  if (!isAdmin(session.user.role)) redirect("/dashboard");
  return session;
}
