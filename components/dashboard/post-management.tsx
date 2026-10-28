"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { deletePostAction } from "@/lib/data/actions/post.actions";
import { DataTable } from "./data-table";
import { PageHeading, Badge } from "./ui";
export function PostManagement({
  posts,
  admin,
}: {
  posts: {
    id: string;
    title: string;
    slug: string;
    status: string;
    author: string;
    category: string;
  }[];
  admin: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const base = admin ? "/admin" : "/dashboard";
  async function remove(id: string) {
    if (busy) return;
    if (!window.confirm("Delete this post permanently?")) return;
    setMessage("");
    setBusy(true);
    try {
      const result = await deletePostAction(id);
      setMessage(result.message);
      if (result.success) router.refresh();
    } catch {
      setMessage("Unable to delete post.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <PageHeading
        title={admin ? "Posts" : "My posts"}
        description="Manage your persisted stories and drafts."
      >
        <Link href={`${base}/posts/create`} className={buttonVariants()}>
          Create post
        </Link>
      </PageHeading>
      {message && <p role="status">{message}</p>}
      <DataTable
        label="Posts"
        filters={["Draft", "Published"]}
        columns={["Title", "Author", "Category", "Status", "Actions"]}
        rows={posts.map((p) => ({
          id: p.id,
          search: `${p.title} ${p.author} ${p.category}`,
          filter: p.status,
          cells: [
            p.title,
            p.author,
            p.category,
            <Badge key="status">{p.status}</Badge>,
            <div key="actions" className="flex items-center gap-3">
              <Link
                href={`${base}/posts/edit?post=${p.id}`}
                className="text-primary underline"
              >
                Edit
              </Link>
              {p.status === "Published" && (
                <Link
                  href={`/blog/${p.slug}`}
                  className="text-primary underline"
                >
                  View
                </Link>
              )}
              <Button
                disabled={busy}
                variant="destructive"
                onClick={() => remove(p.id)}
              >
                Delete
              </Button>
            </div>,
          ],
        }))}
      />
    </div>
  );
}
