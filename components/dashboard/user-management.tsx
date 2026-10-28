"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { manageUserAction } from "@/lib/data/actions/account.actions";
import { ROLES } from "@/lib/roles";
import { PageHeading } from "./ui";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
  emailVerified: boolean;
};
export function UserManagement({
  users,
  currentId,
}: {
  users: UserRow[];
  currentId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function manage(
    id: string,
    operation: "role" | "ban" | "unban" | "revoke",
    value?: string,
  ) {
    if (
      (operation === "ban" || operation === "role") &&
      !window.confirm("Apply this account change?")
    )
      return;
    setBusy(true);
    try {
      const result = await manageUserAction(id, operation, value);
      setMessage(result.message);
      if (result.success) router.refresh();
    } catch {
      setMessage("Unable to update this user.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-6">
      <PageHeading
        title="Users"
        description="Manage registered accounts and their access."
      >
        <Link href="/admin/users/create" className={buttonVariants()}>
          Create user
        </Link>
      </PageHeading>
      {message && <p role="status">{message}</p>}
      {users.length === 0 && <p>No users found.</p>}
      {users.map((user) => (
        <article
          key={user.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5"
        >
          <div>
            <h2 className="font-semibold">
              {user.name}
              {user.id === currentId ? " (you)" : ""}
            </h2>
            <p className="text-sm text-muted-foreground">
              {user.email} ·{" "}
              {user.emailVerified ? "Verified" : "Awaiting verification"} ·{" "}
              {user.banned ? "Suspended" : "Active"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label={`Role for ${user.name}`}
              value={user.role || ROLES.USER}
              disabled={busy || user.id === currentId}
              onChange={(e) => manage(user.id, "role", e.target.value)}
              className="rounded border bg-background p-2"
            >
              <option value={ROLES.USER}>User</option>
              <option value={ROLES.ADMIN}>Admin</option>
            </select>
            <Button
              variant="outline"
              disabled={busy || user.id === currentId}
              onClick={() => manage(user.id, user.banned ? "unban" : "ban")}
            >
              {user.banned ? "Restore access" : "Suspend"}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => manage(user.id, "revoke")}
            >
              Revoke sessions
            </Button>
          </div>
        </article>
      ))}
    </section>
  );
}
