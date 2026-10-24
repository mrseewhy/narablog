import { Suspense } from "react";
import { PostEditor } from "@/components/dashboard/post-editor";
import { getCategoriesDAL } from "@/lib/data/dal/category.dal";

type Props = { searchParams: Promise<{ post?: string | string[] }> };

async function EditPost({ searchParams }: Props) {
  const { post } = await searchParams;
  const categories = await getCategoriesDAL();
  return <PostEditor key={String(post)} edit categories={categories} initialPostId={typeof post === "string" ? Number(post) : undefined} />;
}

export default function Page({ searchParams }: Props) {
  return <Suspense fallback={<p className="text-muted-foreground">Loading post editor...</p>}><EditPost searchParams={searchParams} /></Suspense>;
}
