import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/data/security/session";

async function GuestOnly({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();
  if (session) redirect("/redirect");
  return children;
}
export function AuthEntry({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          aria-label="Loading sign-in"
          className="h-96 w-full max-w-md rounded-2xl bg-muted motion-safe:animate-pulse"
        />
      }
    >
      <GuestOnly>{children}</GuestOnly>
    </Suspense>
  );
}
