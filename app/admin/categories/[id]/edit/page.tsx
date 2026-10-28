import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/dashboard/category-form";
import { DashboardPageSkeleton } from "@/components/dashboard/page-skeleton";
import { getCategoryForEditDAL } from "@/lib/data/dal/category.dal";
import { categoryIdSchema } from "@/lib/data/validation/category.validate";
async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!categoryIdSchema.safeParse(id).success) notFound();
  const category = await getCategoryForEditDAL(id);
  if (!category) notFound();
  return <CategoryForm category={category} />;
}
export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
