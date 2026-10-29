import { Suspense } from "react";

import CategoryDetails from "../_component/CategoryDetails";
import Loading from "../loading";
import type { Metadata } from "next";
import { getCategoryDal } from "@/lib/data/dal/category.dal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryDal(slug);
  if (!category) return { title: "Category not found", robots: { index: false } };
  return {
    title: category.name,
    description: category.description || `Read ${category.name} stories on NaroBlog.`,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: { title: category.name, description: category.description || undefined },
  };
}

const CategoryPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  return (
    <Suspense fallback={<Loading />}>
      <CategoryDetails params={params} />
    </Suspense>
  );
};

export default CategoryPage;
