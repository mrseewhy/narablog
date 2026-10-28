import { Suspense } from "react";
import { DashboardPageSkeleton } from "@/components/dashboard/page-skeleton";
import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/data";
import { user } from "@/lib/data/auth-schema";
import { contactsTable, postsTable, categoriesTable } from "@/lib/data/schema";
import { requireAdminSession } from "@/lib/data/security/session";
import { PageHeading, Stats } from "@/components/dashboard/ui";
async function DashboardContent() {
  const current = await requireAdminSession();
  const [users, published, categories, unread, recent] = await Promise.all([
    db.select({ value: count() }).from(user),
    db
      .select({ value: count() })
      .from(postsTable)
      .where(eq(postsTable.status, "Published")),
    db.select({ value: count() }).from(categoriesTable),
    db
      .select({ value: count() })
      .from(contactsTable)
      .where(eq(contactsTable.isRead, false)),
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.emailVerified,
      })
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(5),
  ]);
  return (
    <div className="space-y-8">
      <PageHeading
        title="Dashboard"
        description={`Welcome back, ${current.user.name}.`}
      />
      <Stats
        items={[
          { label: "Users", value: users[0].value },
          { label: "Published posts", value: published[0].value },
          { label: "Categories", value: categories[0].value },
          { label: "Unread messages", value: unread[0].value },
        ]}
      />
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Recent members</h2>
        <ul className="mt-4 divide-y">
          {recent.map((row) => (
            <li key={row.id} className="py-4">
              <p className="font-medium">{row.name}</p>
              <p className="text-sm text-muted-foreground">
                {row.email} ·{" "}
                {row.verified ? "Verified" : "Awaiting verification"}
              </p>
            </li>
          ))}
        </ul>
        <Link href="/admin/users" className="text-primary underline">
          Manage users
        </Link>
      </section>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
