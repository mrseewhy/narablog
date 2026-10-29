import { Suspense } from "react";
import { DashboardPageSkeleton } from "./page-skeleton";
import { getAccountSessionsDAL } from "@/lib/data/dal/session.dal";
import { SessionList } from "./session-list";

async function SessionsPageContent({ admin = true }: { admin?: boolean }) {
  const { rows, currentId, hasOtherSessions } = await getAccountSessionsDAL(admin);
  return (
    <SessionList
      admin={admin}
      sessions={rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        ipAddress: row.ipAddress,
        userAgent: row.userAgent,
        expiresAt: row.expiresAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      }))}
      currentId={currentId}
      hasOtherSessions={hasOtherSessions}
    />
  );
}

export function SessionsPage(props: { admin?: boolean }) {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <SessionsPageContent {...props} />
    </Suspense>
  );
}
