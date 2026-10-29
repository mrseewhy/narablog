import CategoryCard from "./_component/CategoryCard";
import { CategoriesEmptyState } from "@/components/site/categories-empty-state";
import { getCategoryDirectoryDAL } from "@/lib/data/dal/category.dal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse topics and published stories on NaroBlog.",
  alternates: { canonical: "/categories" },
};

const CategoriesPage = async () => {
  const categories = await getCategoryDirectoryDAL();

  return (
    <>
      <header className="mx-auto w-full max-w-7xl px-4 pt-12">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Categories
        </h1>
        <p className="mt-4 max-w-xl font-serif text-lg text-muted-foreground">
          Browse every topic on NaroBlog and find the stories that matter to
          you.
        </p>
      </header>

      <section className="mx-auto mt-10 grid w-full max-w-7xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 && <CategoriesEmptyState />}
        {categories.map((category) => (
          <CategoryCard key={category.publicId} category={category} />
        ))}
      </section>
    </>
  );
};

export default CategoriesPage;
