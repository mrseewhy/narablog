"use client";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";
import { signOutAction } from "@/lib/data/actions/auth.actions";
import { toast } from "sonner";

export function AccountNavigation() {
  const { data, isPending } = authClient.useSession();
  const [busy, setBusy] = useState(false);
  if (isPending)
    return (
      <span
        aria-label="Loading account"
        className="h-8 w-28 rounded bg-muted motion-safe:animate-pulse"
      />
    );
  if (!data)
    return (
      <>
        <Link href="/sign-in" className="text-sm font-medium">
          Login
        </Link>
        <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
          Register
        </Link>
      </>
    );
  async function logout() {
    setBusy(true);
    try {
      const result = await signOutAction();
      if (!result.success) {
        toast.error(result.message);
        setBusy(false);
        return;
      }
      window.location.replace("/sign-in");
    } catch {
      toast.error("Unable to sign out.");
      setBusy(false);
    }
  }
  return (
    <>
      <Link href="/redirect" className="text-sm font-medium">
        My account
      </Link>
      <button
        type="button"
        disabled={busy}
        onClick={logout}
        className={buttonVariants({ size: "sm", variant: "outline" })}
      >
        {busy ? "Signing out..." : "Sign out"}
      </button>
    </>
  );
}
