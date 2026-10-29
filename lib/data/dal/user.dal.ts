import "server-only";

import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "../index";
import { user } from "../auth-schema";
import { requireAdminSession } from "../security/session";

export const USERS_PER_PAGE = 25;
export type UserFilters = {
  query: string;
  role?: "admin" | "user";
  status?: "active" | "suspended";
};

export async function getAdminUsersDAL(
  requestedPage: number,
  filters: UserFilters,
) {
  const current = await requireAdminSession();
  const search = filters.query.replace(/[\\%_]/g, "\\$&");
  const where = and(
    filters.query
      ? or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`))
      : undefined,
    filters.role === "admin"
      ? eq(user.role, "admin")
      : filters.role === "user"
        ? or(eq(user.role, "user"), isNull(user.role))
        : undefined,
    filters.status === "suspended"
      ? eq(user.banned, true)
      : filters.status === "active"
        ? or(eq(user.banned, false), isNull(user.banned))
        : undefined,
  );
  const [total] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(user)
    .where(where);
  const pages = Math.max(1, Math.ceil(total.count / USERS_PER_PAGE));
  const page = Math.min(Math.max(1, requestedPage), pages);
  const records = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned,
    })
    .from(user)
    .where(where)
    .orderBy(desc(user.createdAt), desc(user.id))
    .limit(USERS_PER_PAGE)
    .offset((page - 1) * USERS_PER_PAGE);
  return {
    records,
    currentId: current.user.id,
    total: total.count,
    pages,
    page,
  };
}
