import { Suspense } from "react";
import { PostEditorPage } from "@/components/dashboard/post-editor-page";
import { DashboardPageSkeleton } from "@/components/dashboard/page-skeleton";
async function Content({
  searchParams,
}: {
  searchParams: Promise<{ post?: string }>;
}) {
  const { post } = await searchParams;
  return <PostEditorPage admin={false} id={post} />;
}
export default function Page(props: {
  searchParams: Promise<{ post?: string }>;
}) {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
