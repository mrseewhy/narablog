import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdmin, requireSession } from "@/lib/data/security/session";

async function RedirectByRole() {
  const { user } = await requireSession();
  return redirect(isAdmin(user.role) ? "/admin" : "/dashboard");
}

export default function RedirectPage() {
  return (
    <Suspense fallback={<p role="status">Redirecting...</p>}>
      <RedirectByRole />
    </Suspense>
  );
}
