import { PostEditor } from "@/components/dashboard/post-editor";
import { getCategoriesDAL } from "@/lib/data/dal/category.dal";

export default async function Page() {
  const categories = await getCategoriesDAL();

  return <PostEditor categories={categories} />;
}
