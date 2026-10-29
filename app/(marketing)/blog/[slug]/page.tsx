import { Suspense } from "react";
import BlogPostPage from "../_component/BlogDetails";
import Loading from "../../loading";
import type { Metadata } from "next";
import { getPublicPost } from "@/lib/data/dal/post.dal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) return { title: "Story not found", robots: { index: false } };
  return {
    title: post.title,
    description: post.excerpt || `Read ${post.title} on NaroBlog.`,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.excerpt, type: "article", publishedTime: post.date },
  };
}

const page = ({ params }: { params: Promise<{ slug: string }> }) => {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <BlogPostPage params={params} />
      </Suspense>
    </div>
  );
};

export default page;
