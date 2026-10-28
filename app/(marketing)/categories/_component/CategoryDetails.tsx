import { notFound } from "next/navigation";

import { getPublicPosts } from "@/lib/data/dal/post.dal";
import PostList from "../../../../components/site/post-list";
import { getCategoryDal } from "@/lib/data/dal/category.dal";

const CategoryDetails = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const category = await getCategoryDal(slug);

  if (!category) notFound();

  const categoryPosts = await getPublicPosts(category.publicId);
  const count = categoryPosts.length;

  return (
    <>
      <header className="mx-auto w-full px-4 pt-12">
        <p className="text-sm font-medium text-primary">Category</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
          {category.name}
        </h1>
        <p className="mt-4 max-w-xl font-serif text-lg text-muted-foreground">
          {category.description}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          {count} {count === 1 ? "post" : "posts"}
        </p>
      </header>

      {count > 0 ? (
        <PostList items={categoryPosts} />
      ) : (
        <section className="mx-auto mt-12 w-full max-w-3xl px-4">
          <div className="rounded-xl border bg-card px-6 py-12 text-center">
            <h2 className="text-xl font-semibold">
              No posts in this category yet
            </h2>
            <p className="mt-2 text-muted-foreground">
              Check back soon for new stories on this topic.
            </p>
          </div>
        </section>
      )}
    </>
  );
};

export default CategoryDetails;
