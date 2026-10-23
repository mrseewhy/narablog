const Loading = () => {
  return (
    <>
      {/* Header skeleton */}
      <header className="mx-auto w-full max-w-3xl px-4 pt-12">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-10 w-64 animate-pulse rounded bg-muted md:h-12" />
        <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded bg-muted" />
        <div className="mt-4 h-4 w-16 animate-pulse rounded bg-muted" />
      </header>

      {/* Feed skeleton */}
      <section className="mx-auto mt-12 w-full max-w-3xl px-4">
        <ul className="divide-y">
          {Array.from({ length: 4 }).map((_, index) => (
            <li key={index}>
              <div className="flex items-start gap-4 py-8 sm:gap-6">
                <div className="aspect-[4/3] w-28 shrink-0 animate-pulse rounded-lg bg-muted sm:w-48" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Loading;
