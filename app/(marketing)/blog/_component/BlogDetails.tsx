import Image from "next/image";
import { notFound } from "next/navigation";
import { Heart } from "lucide-react";
import { posts } from "../../../../lib/data/demo/posts";

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

const BlogPostPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);

  if (!post) notFound();

  return (
    <>
      {/* Hero */}
      <section className="mx-auto mt-6 w-full max-w-7xl px-4">
        <div className="relative flex min-h-[50vh] w-full flex-col justify-end overflow-hidden rounded-2xl bg-[#0B1220] p-8 text-[#ECEFF6] dark:border dark:border-border md:p-16">
          <Image
            src={post.image}
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/80 to-[#0B1220]/40" />
          <h1 className="relative max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            {post.title}
          </h1>
        </div>
      </section>

      <article className="mx-auto w-full  px-4">
        {/* Meta */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y py-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="grid size-9 place-items-center rounded-full bg-muted text-xs font-semibold text-foreground">
              {getInitials(post.author)}
            </span>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{post.author}</span>
              <span className="text-muted-foreground">
                {formatDate(post.date)} &middot; {post.readTime} min read
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Heart className="size-4" />
              {post.likes}
            </span>
          </div>
        </div>

        {/* Content (demo text, replace with the real post body) */}
        <div className="mt-10 space-y-6 font-serif text-lg leading-8 text-foreground">
          <p>{post.excerpt}</p>
          <p>
            Every good story starts with a simple question. What is really
            happening here, and why does it matter to the people living through
            it? The answer is rarely found in headlines, and often hides in the
            details most readers skip past.
          </p>
          <h2 className="pt-4 font-sans text-2xl font-bold tracking-tight">
            Looking closer at the details
          </h2>
          <p>
            When we slow down and examine the evidence, patterns begin to
            appear. Small decisions add up, habits compound, and what once
            looked like a coincidence starts to look like a trend worth
            understanding.
          </p>
          <blockquote className="border-l-4 border-primary pl-6 italic text-muted-foreground">
            The most useful ideas are often the ones that change how we see
            something we thought we already understood.
          </blockquote>
          <p>
            None of this means there is a single right answer. It means asking
            better questions, staying curious, and being willing to change our
            minds when the facts change.
          </p>
        </div>
      </article>
    </>
  );
};

export default BlogPostPage;
