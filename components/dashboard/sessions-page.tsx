import { Suspense } from "react";
import { DashboardPageSkeleton } from "./page-skeleton";
import {
  requireSession,
  requireAdminSession,
} from "@/lib/data/security/session";
import { listAccountSessions } from "@/lib/data/actions/account.actions";
import { SessionList } from "./session-list";

async function SessionsPageContent({ admin = true }: { admin?: boolean }) {
  const current = admin ? await requireAdminSession() : await requireSession();
  const records = await listAccountSessions(admin);
  return (
    <SessionList
      admin={admin}
      sessions={records.map((row) => ({
        ...row,
        expiresAt: row.expiresAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      }))}
      currentId={current.session.id}
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
