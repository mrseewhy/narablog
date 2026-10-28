export function DashboardShellSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard" className="min-h-screen bg-background">
      <span className="sr-only">Loading dashboard</span>
      <div aria-hidden="true" className="flex min-h-screen motion-safe:animate-pulse">
        <div className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r bg-sidebar p-6">
          <div className="mb-12 h-7 w-32 rounded-md bg-sidebar-accent" />
          <div className="space-y-4">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="flex h-10 items-center gap-3">
                <div className="size-5 rounded bg-sidebar-accent" />
                <div className="h-4 w-28 rounded bg-sidebar-accent" />
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-3 border-t pt-6">
            <div className="size-8 rounded-full bg-sidebar-accent" />
            <div className="h-4 w-24 rounded bg-sidebar-accent" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="h-5 w-28 rounded bg-muted" />
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-md bg-muted" />
              <div className="size-8 rounded-full bg-muted" />
            </div>
          </div>
          <div className="space-y-8 p-6">
            <div className="space-y-3">
              <div className="h-8 w-40 max-w-full rounded bg-muted" />
              <div className="h-4 w-80 max-w-full rounded bg-muted" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="space-y-4 rounded-xl border bg-card p-6">
                  <div className="h-4 w-24 max-w-full rounded bg-muted" />
                  <div className="h-8 w-16 max-w-full rounded bg-muted" />
                </div>
              ))}
            </div>
            <div className="space-y-6 rounded-xl border bg-card p-6">
              <div className="h-5 w-36 max-w-full rounded bg-muted" />
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex items-center gap-4 border-t pt-6">
                  <div className="size-10 shrink-0 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-1/3 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
