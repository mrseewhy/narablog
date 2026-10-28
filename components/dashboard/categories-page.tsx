import { Suspense } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CategoriesEmptyState } from "@/components/site/categories-empty-state";
import { getAdminCategoriesDAL } from "@/lib/data/dal/category.dal";
import { CategoryDeleteButton } from "./category-delete-button";
import { DashboardPageSkeleton } from "./page-skeleton";
import { PageHeading, Stats } from "./ui";
async function Content() {
  const categories = await getAdminCategoriesDAL();
  return (
    <div className="space-y-8">
      <PageHeading
        title="Categories"
        description="Manage topics and the posts assigned to them."
      >
        <Link href="/admin/categories/create" className={buttonVariants()}>
          Create category
        </Link>
      </PageHeading>
      <Stats
        items={[
          { label: "Categories", value: categories.length },
          {
            label: "Published posts",
            value: categories.reduce((n, c) => n + c.publishedCount, 0),
          },
          {
            label: "Drafts",
            value: categories.reduce(
              (n, c) => n + c.totalCount - c.publishedCount,
              0,
            ),
          },
          {
            label: "Empty categories",
            value: categories.filter((c) => c.totalCount === 0).length,
          },
        ]}
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {categories.length === 0 && <CategoriesEmptyState admin />}
        {categories.map((category) => (
          <section
            key={category.publicId}
            className="flex flex-col rounded-xl border bg-card p-6"
          >
            <h2 className="text-xl font-semibold">{category.name}</h2>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">
              {category.description || "No description."}
            </p>
            <p className="mt-4 text-sm">
              {category.publishedCount} published ·{" "}
              {category.totalCount - category.publishedCount} drafts
            </p>
            <Link
              href={`/categories/${category.slug}`}
              className="mt-3 break-all text-sm text-primary underline"
            >
              /categories/{category.slug}
            </Link>
            <div className="mt-5 border-t pt-4">
              <Link
                href={`/admin/categories/${category.publicId}/edit`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "mb-3",
                })}
              >
                Edit category
              </Link>
              <CategoryDeleteButton
                publicId={category.publicId}
                name={category.name}
                totalCount={category.totalCount}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
export function CategoriesPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <Content />
    </Suspense>
  );
}
