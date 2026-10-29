"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  revokeSessionAction,
  revokeOtherSessionsAction,
} from "@/lib/data/actions/account.actions";
import { PageHeading } from "./ui";

type SessionRow = {
  id: string;
  name: string;
  email: string;
  userAgent: string | null;
  ipAddress: string | null;
  updatedAt: string;
  expiresAt: string;
};
export function SessionList({
  sessions,
  currentId,
  admin,
  hasOtherSessions,
}: {
  sessions: SessionRow[];
  currentId: string;
  admin: boolean;
  hasOtherSessions: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function revoke(id?: string) {
    if (busy) return;
    setBusy(true);
    try {
      const result = id
        ? await revokeSessionAction(id, admin)
        : await revokeOtherSessionsAction();
      setMessage(result.message);
      if (result.success && "current" in result && result.current) {
        window.location.replace("/sign-in");
        return;
      }
      if (result.success) router.refresh();
    } catch {
      setMessage("Unable to revoke the session.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-5">
      <PageHeading
        title={admin ? "Account sessions" : "Your sessions"}
        description={admin ? "Review active sessions across accounts. Revoking your current session signs you out." : "Review your active devices and sign out sessions you no longer use."}
      >
        <Button disabled={busy || !hasOtherSessions} onClick={() => revoke()}>
          {admin ? "Sign out my other devices" : "Sign out other devices"}
        </Button>
      </PageHeading>
      {message && <p role="status">{message}</p>}
      <div className="space-y-3">
        {sessions.length === 0 && <p>No active sessions.</p>}
        {sessions.map((row) => (
          <article
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5"
          >
            <div>
              <p className="font-semibold">
                {admin ? `${row.name} · ${row.email}` : "Device"}
                {row.id === currentId ? " (current)" : ""}
              </p>
              <p className="mt-1 break-all text-sm text-muted-foreground">
                {row.userAgent || "Unknown device"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                IP: {row.ipAddress || "Unknown"} · Last updated:{" "}
                {row.updatedAt.replace("T", " ").slice(0, 19)} UTC
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Expires: {row.expiresAt.replace("T", " ").slice(0, 19)} UTC
              </p>
            </div>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => revoke(row.id)}
            >
              {row.id === currentId ? "Sign out this device" : "Revoke session"}
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
