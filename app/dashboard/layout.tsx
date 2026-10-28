import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import type { Viewport } from "next";
import { AdminShell } from "@/components/site/AdminShell";
import { isAdmin, requireSession } from "@/lib/data/security/session";
import { ROLES } from "@/lib/roles";
import { DashboardShellSkeleton } from "@/components/site/dashboard-shell-skeleton";

export const viewport: Viewport = {
  interactiveWidget: "resizes-content",
};

async function ProtectedUserShell({ children }: { children: ReactNode }) {
  const { user } = await requireSession();
  if (isAdmin(user.role)) redirect("/admin");

  return (
    <AdminShell role={ROLES.USER} userName={user.name} userEmail={user.email}>
      {children}
    </AdminShell>
  );
}

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <ProtectedUserShell>{children}</ProtectedUserShell>
    </Suspense>
  );
}
