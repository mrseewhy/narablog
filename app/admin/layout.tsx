import { Suspense, type ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { AdminShell } from "@/components/site/AdminShell";
import { requireAdminSession } from "@/lib/data/security/session";
import { ROLES } from "@/lib/roles";
import { DashboardShellSkeleton } from "@/components/site/dashboard-shell-skeleton";

export const viewport: Viewport = { interactiveWidget: "resizes-content" };
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

async function ProtectedAdminShell({ children }: { children: ReactNode }) {
  const { user } = await requireAdminSession();

  return (
    <AdminShell role={ROLES.ADMIN} userName={user.name} userEmail={user.email}>
      {children}
    </AdminShell>
  );
}

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <ProtectedAdminShell>{children}</ProtectedAdminShell>
    </Suspense>
  );
}
