import { Suspense } from "react";
import { ActivityPage } from "@/components/dashboard/activity-page";
import { DashboardPageSkeleton } from "@/components/dashboard/page-skeleton";

export default function Page() {
  return <Suspense fallback={<DashboardPageSkeleton />}><ActivityPage /></Suspense>;
}
