import { Suspense } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PageHeading } from "./ui";
import { DashboardPageSkeleton } from "./page-skeleton";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/data";
import { user } from "@/lib/data/auth-schema";
import {
  requireSession,
  requireAdminSession,
} from "@/lib/data/security/session";
import { getEditablePost } from "@/lib/data/dal/post.dal";
import { getCategoriesDAL } from "@/lib/data/dal/category.dal";
import { PostEditor } from "./post-editor";
async function PostEditorPageContent({
  admin = false,
  id,
}: {
  admin?: boolean;
  id?: string;
}) {
  if (admin) await requireAdminSession();
  else await requireSession();
  if (id && !z.uuid().safeParse(id).success) notFound();
  const post = id ? await getEditablePost(id) : undefined;
  if (id && !post) notFound();
  const categories = await getCategoriesDAL();
  if (!categories.length) {
    return (
      <div className="space-y-8">
        <PageHeading
          title="Create post"
          description="Write and publish your story."
        />
        <section className="rounded-xl border bg-card px-6 py-12 text-center">
          <h2 className="text-xl font-semibold">
            {admin ? "Create your first category" : "No categories available"}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {admin
              ? "Add at least one category before creating a post."
              : "An administrator needs to add a category before you can create a post."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {admin && (
              <Link href="/admin/categories/create" className={buttonVariants()}>
                Create category
              </Link>
            )}
            <Link
              href={admin ? "/admin/posts" : "/dashboard/posts"}
              className={buttonVariants({ variant: "outline" })}
            >
              Back to posts
            </Link>
          </div>
        </section>
      </div>
    );
  }
  const authors = admin
    ? await db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(eq(user.banned, false))
    : [];
  return (
    <PostEditor
      admin={admin}
      categories={categories}
      authors={authors}
      post={post}
    />
  );
}

export function PostEditorPage(props: { admin?: boolean; id?: string }) {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <PostEditorPageContent {...props} />
    </Suspense>
  );
}
