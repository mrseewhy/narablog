import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  getAdminUsersDAL,
  USERS_PER_PAGE,
  type UserFilters,
} from "@/lib/data/dal/user.dal";
import { UserManagement } from "./user-management";
import { fieldClass, PageHeading } from "./ui";

function pageLink(page: number, filters: UserFilters) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.role) params.set("role", filters.role);
  if (filters.status) params.set("status", filters.status);
  params.set("page", String(page));
  return `/admin/users?${params}`;
}

export async function UsersPage({
  requestedPage,
  filters,
}: {
  requestedPage: number;
  filters: UserFilters;
}) {
  const { records, currentId, total, pages, page } = await getAdminUsersDAL(
    requestedPage,
    filters,
  );
  const first = total ? (page - 1) * USERS_PER_PAGE + 1 : 0;
  const last = Math.min(page * USERS_PER_PAGE, total);
  return (
    <div className="space-y-6">
      <PageHeading
        title="Users"
        description="Manage registered accounts and their access."
      >
        <Link href="/admin/users/create" className={buttonVariants()}>
          Create user
        </Link>
      </PageHeading>
      <form
        action="/admin/users"
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4"
      >
        <div className="min-w-48 flex-1 space-y-1">
          <label htmlFor="user-query" className="text-sm font-medium">
            Find a user
          </label>
          <input
            id="user-query"
            name="q"
            type="search"
            maxLength={100}
            defaultValue={filters.query}
            placeholder="Name or email"
            className={fieldClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="user-role-filter" className="text-sm font-medium">
            Role
          </label>
          <select
            id="user-role-filter"
            name="role"
            defaultValue={filters.role || ""}
            className={fieldClass}
          >
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="user-status-filter" className="text-sm font-medium">
            Status
          </label>
          <select
            id="user-status-filter"
            name="status"
            defaultValue={filters.status || ""}
            className={fieldClass}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <button type="submit" className={buttonVariants()}>
          Apply filters
        </button>
        <Link
          href="/admin/users"
          className={buttonVariants({ variant: "outline" })}
        >
          Clear
        </Link>
      </form>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {first}–{last} of {total} accounts
      </p>
      <UserManagement users={records} currentId={currentId} />
      <nav className="flex items-center gap-5" aria-label="User pages">
        {page > 1 && (
          <Link
            className="text-primary underline"
            href={pageLink(page - 1, filters)}
          >
            Previous
          </Link>
        )}
        <span>
          Page {page} of {pages}
        </span>
        {page < pages && (
          <Link
            className="text-primary underline"
            href={pageLink(page + 1, filters)}
          >
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}
