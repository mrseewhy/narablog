"use client";

import { Button } from "@/components/ui/button";

export default function SessionError({ retry }: { retry: () => void }) {
  return (
    <section className="rounded-xl border bg-card p-6 text-center">
      <h2 className="text-xl font-semibold">Unable to load sessions</h2>
      <p className="mt-3 text-muted-foreground">Please try again in a moment.</p>
      <Button className="mt-5" onClick={retry}>Try again</Button>
    </section>
  );
}
