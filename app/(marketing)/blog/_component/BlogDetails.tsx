import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicPost } from "@/lib/data/dal/post.dal";
import { ArticleContent } from "@/components/site/article-content";
export default async function BlogDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) notFound();
  return (
    <article className="mx-auto max-w-3xl min-w-0 px-4 py-12">
      <p className="text-sm text-primary">
        <Link href={`/categories/${post.categorySlug}`} className="hover:underline">{post.category}</Link> · {post.author}
      </p>
      <h1 className="mt-4 text-4xl font-bold">{post.title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        <time dateTime={post.date}>{post.date.slice(0, 10)}</time> · {post.readTime} min read
      </p>
      <div className="mt-10 space-y-6 font-serif text-lg leading-8">
        <ArticleContent content={post.content} />
      </div>
    </article>
  );
}
