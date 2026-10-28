"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function AccountError({ retry }: { retry: () => void }) {
  return (
    <section className="w-full max-w-md rounded-2xl border bg-card p-6 text-center">
      <h1 className="text-2xl font-bold">We couldn’t load your account</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Account services are temporarily unavailable. Please try again.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={retry}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to home
        </Link>
      </div>
    </section>
  );
}
