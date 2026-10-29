import { Suspense } from "react";
import { AccountSettings } from "@/components/dashboard/account-settings";
import { SessionsPage } from "@/components/dashboard/sessions-page";
import { requireSession } from "@/lib/data/security/session";
import { DashboardPageSkeleton } from "@/components/dashboard/page-skeleton";

async function Settings() {
  const { user } = await requireSession();
  const profile = {
    name: user.name,
    username: user.username ?? "",
    bio: user.bio ?? "",
    website: user.website ?? "",
    location: user.location ?? "",
  };
  return (
    <div className="space-y-12">
      <AccountSettings profile={profile} email={user.email} emailVerified={user.emailVerified} />
      <SessionsPage admin={false} />
    </div>
  );
}
export default function Page() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <Settings />
    </Suspense>
  );
}
