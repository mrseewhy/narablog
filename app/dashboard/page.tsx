import { Suspense } from "react";
import { DashboardPageSkeleton } from "@/components/dashboard/page-skeleton";
import Link from "next/link";
import { requireSession } from "@/lib/data/security/session";
import { getPrivatePosts } from "@/lib/data/dal/post.dal";
import { PageHeading, Stats } from "@/components/dashboard/ui";
import { buttonVariants } from "@/components/ui/button";
async function DashboardContent() {
  const { user } = await requireSession();
  const posts = await getPrivatePosts();
  return (
    <div className="space-y-8">
      <PageHeading title="Overview" description={`Welcome back, ${user.name}.`}>
        <Link href="/dashboard/posts/create" className={buttonVariants()}>
          Create post
        </Link>
      </PageHeading>
      <Stats
        items={[
          { label: "Total posts", value: posts.length },
          {
            label: "Published",
            value: posts.filter((p) => p.post.status === "Published").length,
          },
          {
            label: "Drafts",
            value: posts.filter((p) => p.post.status === "Draft").length,
          },
        ]}
      />
      <Link href="/dashboard/posts" className="text-primary underline">
        Manage your posts
      </Link>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
