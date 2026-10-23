import Image from "next/image";
import Link from "next/link";
import { posts, type Post } from "../../lib/data/demo/posts";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");

const PostList = ({ items = posts }: { items?: Post[] }) => {
  return (
    <section className="mx-auto mt-12 w-full  px-4">
      <ul className="divide-y">
        {items.map((post) => (
          <li key={post.id}>
            <article className="flex items-start gap-4 py-8 sm:gap-6">
              <Link
                href={`/blog/${post.slug}`}
                className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-48"
              >
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(min-width: 640px) 192px, 112px"
                  className="object-cover"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <div className="mb-3 flex items-center gap-2 text-sm">
                  <span className="grid size-6 place-items-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
                    {getInitials(post.author)}
                  </span>
                  <span className="font-medium text-foreground">
                    {post.author}
                  </span>
                </div>

                <Link href={`/blog/${post.slug}`} className="group block">
                  <h2 className="text-lg font-bold tracking-tight text-foreground group-hover:underline sm:text-xl md:text-2xl">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 font-serif text-base text-muted-foreground">
                    {post.excerpt}
                  </p>
                </Link>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{formatDate(post.date)}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{post.readTime} min read</span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {post.category}
                  </span>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PostList;
