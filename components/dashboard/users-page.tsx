import { desc, sql } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/lib/data";
import { user } from "@/lib/data/auth-schema";
import { requireAdminSession } from "@/lib/data/security/session";
import { UserManagement } from "./user-management";

export async function UsersPage({ page = 1 }: { page?: number }) {
  const current = await requireAdminSession();
  const records = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned,
      emailVerified: user.emailVerified,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(25)
    .offset((page - 1) * 25);
  const [total] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(user);
  return (
    <div className="space-y-6">
      <UserManagement users={records} currentId={current.user.id} />
      <nav className="flex items-center gap-5" aria-label="User pages">
        {page > 1 && (
          <Link
            className="text-primary underline"
            href={`/admin/users?page=${page - 1}`}
          >
            Previous
          </Link>
        )}
        <span>Page {page}</span>
        {page * 25 < total.count && (
          <Link
            className="text-primary underline"
            href={`/admin/users?page=${page + 1}`}
          >
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}
