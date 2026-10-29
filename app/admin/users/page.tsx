import { Suspense } from "react";
import { UsersPage } from "@/components/dashboard/users-page";
import { DashboardPageSkeleton } from "@/components/dashboard/page-skeleton";
import type { UserFilters } from "@/lib/data/dal/user.dal";

type Search = {
  page?: string | string[];
  q?: string | string[];
  role?: string | string[];
  status?: string | string[];
};
async function Content({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const rawPage = typeof params.page === "string" ? params.page : "";
  const requestedPage = /^[1-9]\d{0,4}$/.test(rawPage) ? Number(rawPage) : 1;
  const filters: UserFilters = {
    query: typeof params.q === "string" ? params.q.trim().slice(0, 100) : "",
    role:
      params.role === "admin" || params.role === "user"
        ? params.role
        : undefined,
    status:
      params.status === "active" || params.status === "suspended"
        ? params.status
        : undefined,
  };
  return <UsersPage requestedPage={requestedPage} filters={filters} />;
}
export default function Page(props: { searchParams: Promise<Search> }) {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
