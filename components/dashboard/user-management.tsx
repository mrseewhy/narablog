"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { manageUserAction } from "@/lib/data/actions/account.actions";
import { ROLES } from "@/lib/roles";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
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
  const [feedback, setFeedback] = useState({ message: "", success: true });
  async function manage(
    account: UserRow,
    operation: "role" | "ban" | "unban" | "revoke",
    value?: string,
  ) {
    if (busy) return;
    const prompt =
      operation === "role"
        ? `Change ${account.name}'s role to ${value === ROLES.ADMIN ? "admin" : "user"}? This changes their access immediately.`
        : operation === "ban"
          ? `Suspend ${account.name}? They will lose access immediately.`
          : operation === "revoke"
            ? `Revoke all sessions for ${account.name}? They will need to sign in again.`
            : null;
    if (prompt && !window.confirm(prompt)) return;
    setBusy(true);
    setFeedback({ message: "", success: true });
    try {
      const result = await manageUserAction(account.id, operation, value);
      setFeedback({ message: result.message, success: result.success });
      if (result.success) router.refresh();
    } catch {
      setFeedback({ message: "Unable to update this user.", success: false });
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-4" aria-label="User accounts">
      {feedback.message && (
        <p
          role={feedback.success ? "status" : "alert"}
          className={feedback.success ? "text-sm" : "text-sm text-destructive"}
        >
          {feedback.message}
        </p>
      )}
      {users.length === 0 && (
        <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          No accounts match these filters.
        </p>
      )}
      {users.map((account) => {
        const self = account.id === currentId;
        const admin =
          account.role
            ?.split(",")
            .some((role) => role.trim() === ROLES.ADMIN) ?? false;
        return (
          <article
            key={account.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5"
          >
            <div>
              <h2 className="font-semibold">
                {account.name}
                {self ? " (you)" : ""}
              </h2>
              <p className="break-all text-sm text-muted-foreground">
                {account.email}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {admin ? "Admin" : "User"} ·{" "}
                {account.banned ? "Suspended" : "Active"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                disabled={busy || self}
                onClick={() =>
                  manage(account, "role", admin ? ROLES.USER : ROLES.ADMIN)
                }
              >
                {admin ? "Make user" : "Make admin"}
              </Button>
              <Button
                variant="outline"
                disabled={busy || self}
                onClick={() =>
                  manage(account, account.banned ? "unban" : "ban")
                }
              >
                {account.banned ? "Restore access" : "Suspend"}
              </Button>
              <Button
                variant="outline"
                disabled={busy || self}
                onClick={() => manage(account, "revoke")}
              >
                Revoke sessions
              </Button>
            </div>
          </article>
        );
      })}
    </section>
  );
}
