import { Suspense } from "react";
import { AuthEmailForm } from "@/components/site/auth-email-form";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div
          className="h-96 w-full max-w-md animate-pulse rounded-2xl bg-muted"
          aria-label="Loading form"
        />
      }
    >
      <AuthEmailForm mode="reset" />
    </Suspense>
  );
}
