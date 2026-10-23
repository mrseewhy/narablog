import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

const UnauthorizedPage = () => {
  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-6 md:p-8">
      <div className="text-center">
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <ShieldAlert className="size-6" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className={buttonVariants({ size: "lg", className: "flex-1" })}
        >
          Back to home
        </Link>
        <Link
          href="/sign-in"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "flex-1",
          })}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
