import "server-only";

import { and, desc, eq, gt, sql, lte } from "drizzle-orm";
import { db } from "../index";
import { session as sessions, user as users } from "../auth-schema";
import { requireSession, requireAdminSession } from "../security/session";

const databaseNow = sql`timezone('UTC', statement_timestamp())`;

export async function getAccountSessionsDAL(admin: boolean) {
  const current = admin ? await requireAdminSession() : await requireSession();
  const rows = await db
    .select({
      id: sessions.id,
      userId: sessions.userId,
      name: users.name,
      email: users.email,
      ipAddress: sessions.ipAddress,
      userAgent: sessions.userAgent,
      expiresAt: sessions.expiresAt,
      updatedAt: sessions.updatedAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        gt(sessions.expiresAt, databaseNow),
        admin ? undefined : eq(sessions.userId, current.user.id),
      ),
    )
    .orderBy(
      sql`case when ${sessions.id} = ${current.session.id} then 0 else 1 end`,
      desc(sessions.updatedAt),
      desc(sessions.id),
    );
  return {
    rows,
    currentId: current.session.id,
    hasOtherSessions: rows.some(
      (row) => row.userId === current.user.id && row.id !== current.session.id,
    ),
  };
}

export async function cleanupExpiredSessions() {
  await db.delete(sessions).where(lte(sessions.expiresAt, databaseNow));
}
