import Link from "next/link";
import type { getPublicPosts } from "@/lib/data/dal/post.dal";

type PublicPost = Awaited<ReturnType<typeof getPublicPosts>>[number];

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });

const getInitials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

export default function PostList({ items }: { items: PublicPost[] }) {
  return (
    <section className="mx-auto mt-12 w-full max-w-5xl px-4" aria-label="Published stories">
      {items.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-12 text-center">
          <h2 className="text-xl font-semibold">No published stories yet</h2>
          <p className="mt-2 text-muted-foreground">Check back soon for new stories.</p>
        </div>
      ) : (
        <ul className="divide-y">
          {items.map((post) => (
            <li key={post.id}>
              <article className="py-8">
                <div className="mb-3 flex items-center gap-2 text-sm">
                  <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-muted text-[10px] font-semibold">
                    {getInitials(post.author)}
                  </span>
                  <span className="font-medium">{post.author}</span>
                </div>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <h2 className="text-xl font-bold tracking-tight group-hover:underline md:text-2xl">{post.title}</h2>
                  <p className="mt-2 line-clamp-3 font-serif text-muted-foreground">{post.excerpt}</p>
                </Link>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readTime} min read</span>
                  <Link href={`/categories/${post.categorySlug}`} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:underline">
                    {post.category}
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
