import Link from "next/link";
import { ArrowUpRight, Tags, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
// import { categories } from "@/lib/data/demo/categories";
import { posts } from "@/lib/data/demo/posts";
import { Badge, PageHeading, Stats } from "./ui";
import { getCategoriesDAL } from "@/lib/data/dal/category.dal";

export async function CategoriesPage() {
  const categories = await getCategoriesDAL();
  return (
    <div className="space-y-8">
      <PageHeading
        title="Categories"
        description="Organise the topics that bring your stories together."
      >
        <Link href="/admin/categories/create" className={buttonVariants()}>
          <Plus className="size-4" /> Create category
        </Link>
      </PageHeading>
      <Stats
        items={[
          { label: "Categories", value: categories.length },
          { label: "Published posts", value: posts.length },
          { label: "Featured topic", value: "Technology" },
          { label: "Uncategorised posts", value: 0 },
        ]}
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <section
            key={category.publicId}
            className="flex flex-col rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="rounded-lg bg-primary/10 p-3 text-primary">
                <Tags className="size-5" aria-hidden="true" />
              </span>
              <Badge>
                {posts.filter((post) => post.category === category.name).length}{" "}
                posts
              </Badge>
            </div>
            <h2 className="text-xl font-semibold">{category.name}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
              {category.description}
            </p>
            <div className="mt-6 flex items-center justify-between gap-3 border-t pt-4">
              <span className="text-xs text-muted-foreground">
                /{category.slug}
              </span>
              <Link
                href={`/categories/${category.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View category <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
