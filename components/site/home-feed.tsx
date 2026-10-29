"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { getHomePostsPage } from "@/lib/data/dal/post.dal";
import PostList from "./post-list";

type Page = Awaited<ReturnType<typeof getHomePostsPage>>;

export function HomeFeed({ initialPage }: { initialPage: Page }) {
  const [items, setItems] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);
  const lastLoadedCursor = useRef<string | null>(null);

  const loadMore = useCallback(async () => {
    if (!cursor || inFlight.current || lastLoadedCursor.current === cursor) return;
    inFlight.current = true;
    lastLoadedCursor.current = cursor;
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`/api/posts?cursor=${encodeURIComponent(cursor)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load posts.");
      const page: Page = await response.json();
      setItems((previous) => {
        const existing = new Set(previous.map((post) => post.id));
        return [...previous, ...page.items.filter((post) => !existing.has(post.id))];
      });
      setCursor(page.nextCursor);
    } catch {
      lastLoadedCursor.current = null;
      setError(true);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [cursor]);

  useEffect(() => {
    const target = sentinel.current;
    if (!target || !cursor || error) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) void loadMore(); },
      { rootMargin: "400px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [cursor, error, loadMore]);

  return (
    <>
      <PostList items={items} />
      <div ref={sentinel} className="mx-auto mt-4 max-w-5xl px-4 pb-8 text-center" aria-live="polite">
        {loading && <p className="text-sm text-muted-foreground">Loading more stories...</p>}
        {error && <p role="alert" className="text-sm text-destructive">More stories could not be loaded.</p>}
        {cursor && !loading && (
          <button type="button" onClick={() => void loadMore()} className="mt-2 text-sm font-medium text-primary underline">
            {error ? "Try again" : "Load more stories"}
          </button>
        )}
        {!cursor && items.length > 0 && <p className="text-sm text-muted-foreground">You have reached the end.</p>}
      </div>
    </>
  );
}
