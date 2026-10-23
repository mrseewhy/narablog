const Loading = () => {
  return (
    <>
      {/* Hero skeleton */}
      <section className="mx-auto mt-6 w-full max-w-7xl px-4">
        <div className="min-h-[50vh] w-full animate-pulse rounded-2xl bg-muted" />
      </section>

      <div className="mx-auto w-full max-w-3xl px-4">
        {/* Meta skeleton */}
        <div className="mt-8 flex items-center justify-between border-y py-4">
          <div className="flex items-center gap-3">
            <div className="size-9 animate-pulse rounded-full bg-muted" />
            <div className="flex flex-col gap-2">
              <div className="h-3 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3 w-40 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
        </div>

        {/* Content skeleton */}
        <div className="mt-10 space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </>
  );
};

export default Loading;
