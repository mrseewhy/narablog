export function DashboardPageSkeleton() {
  return (
    <div role="status" aria-label="Loading page">
      <span className="sr-only">Loading page</span>
      <div aria-hidden="true" className="space-y-8 motion-safe:animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-44 max-w-full rounded bg-muted" />
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
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-4">
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
  );
}
