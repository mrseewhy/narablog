import { Suspense } from "react";
import { UsersPage } from "@/components/dashboard/users-page";
import { DashboardPageSkeleton } from "@/components/dashboard/page-skeleton";
async function Content({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Math.min(100000, Number(params.page) || 1));
  return <UsersPage page={Math.floor(page)} />;
}
export default function Page(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
