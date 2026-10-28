import { Suspense } from "react";
import { DashboardPageSkeleton } from "./page-skeleton";
import { requireAdminSession } from "@/lib/data/security/session";
import { getPrivatePosts } from "@/lib/data/dal/post.dal";
import { PostManagement } from "./post-management";
async function PostsPageContent({ admin = false }: { admin?: boolean }) {
  if (admin) await requireAdminSession();
  const records = await getPrivatePosts();
  return (
    <PostManagement
      admin={admin}
      posts={records.map(({ post, author, category }) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        author,
        category,
      }))}
    />
  );
}

export function PostsPage(props: { admin?: boolean }) {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <PostsPageContent {...props} />
    </Suspense>
  );
}
