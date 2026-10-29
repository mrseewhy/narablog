import "server-only";

import { desc, eq, gt, and, sql } from "drizzle-orm";
import { db } from "../index";
import { user, session } from "../auth-schema";
import { postsTable } from "../schema";
import { requireAdminSession, requireSession } from "../security/session";

type Activity = {
  id: string;
  user: string;
  action: string;
  detail: string;
  type: "Posts" | "Account" | "Security";
  date: string;
};

export async function getRecentActivityDAL(admin: boolean): Promise<Activity[]> {
  const current = admin ? await requireAdminSession() : await requireSession();
  const all = admin;
  const owner = all ? undefined : eq(user.id, current.user.id);
  const [accounts, updates, posts, sessions] = await Promise.all([
    db.select({ id: user.id, name: user.name, createdAt: user.createdAt })
      .from(user).where(owner).orderBy(desc(user.createdAt)).limit(50),
    db.select({ id: user.id, name: user.name, updatedAt: user.updatedAt })
      .from(user).where(and(owner, gt(user.updatedAt, user.createdAt)))
      .orderBy(desc(user.updatedAt)).limit(50),
    db.select({ id: postsTable.id, title: postsTable.title, status: postsTable.status,
      createdAt: postsTable.createdAt, updatedAt: postsTable.updatedAt,
      publishedAt: postsTable.publishedAt, name: user.name })
      .from(postsTable).innerJoin(user, eq(postsTable.authorId, user.id))
      .where(owner).orderBy(desc(postsTable.updatedAt)).limit(50),
    db.select({ id: session.id, name: user.name, createdAt: session.createdAt,
      userAgent: session.userAgent })
      .from(session).innerJoin(user, eq(session.userId, user.id))
      .where(and(owner, gt(session.expiresAt, sql`timezone('UTC', statement_timestamp())`)))
      .orderBy(desc(session.createdAt)).limit(50),
  ]);
  const items: Activity[] = [
    ...accounts.map((row) => ({ id: `account-created-${row.id}`, user: row.name,
      action: "Account created", detail: "Registration", type: "Account" as const,
      date: row.createdAt.toISOString() })),
    ...updates.map((row) => ({ id: `account-updated-${row.id}`, user: row.name,
      action: "Account updated", detail: "Profile or account settings changed", type: "Account" as const,
      date: row.updatedAt.toISOString() })),
    ...posts.flatMap((row) => {
      const events: Activity[] = [{ id: `post-created-${row.id}`, user: row.name,
        action: "Post created", detail: row.title, type: "Posts", date: row.createdAt.toISOString() }];
      if (row.updatedAt > row.createdAt) events.push({ id: `post-updated-${row.id}`, user: row.name,
        action: "Post updated", detail: row.title, type: "Posts", date: row.updatedAt.toISOString() });
      if (row.status === "Published" && row.publishedAt) events.push({ id: `post-published-${row.id}`,
        user: row.name, action: "Post published", detail: row.title, type: "Posts", date: row.publishedAt.toISOString() });
      return events;
    }),
    ...sessions.map((row) => ({ id: `session-created-${row.id}`, user: row.name,
      action: "Session started", detail: row.userAgent || "Unknown device", type: "Security" as const,
      date: row.createdAt.toISOString() })),
  ];
  return items.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)).slice(0, 100);
}
