"use client";
import { useState, useCallback, type FormEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { savePostAction } from "@/lib/data/actions/post.actions";
import { postSchema } from "@/lib/data/validation/post.validate";
import { PageHeading, fieldClass } from "./ui";
import type { getCategoriesDAL } from "@/lib/data/dal/category.dal";
import type { getEditablePost } from "@/lib/data/dal/post.dal";
import type { PartialBlock } from "@blocknote/core";
const ContentEditor = dynamic(() => import("./content-editor"), {
  ssr: false,
  loading: () => <div className="min-h-96 rounded bg-muted animate-pulse" />,
});
export function PostEditor({
  categories,
  post,
  admin = false,
  authors = [],
}: {
  categories: Awaited<ReturnType<typeof getCategoriesDAL>>;
  post?: Awaited<ReturnType<typeof getEditablePost>>;
  admin?: boolean;
  authors?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const editorReady = useCallback(() => setReady(true), []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !ready) return;
    const values = Object.fromEntries(new FormData(e.currentTarget).entries());
    setMessage("");
    try {
      const input = postSchema.safeParse({
        ...values,
        id: post?.id,
        content: JSON.parse(String(values.content)),
      });
      if (!input.success) {
        setMessage(input.error.issues[0]?.message ?? "Please check your post.");
        return;
      }
      setBusy(true);
      const result = await savePostAction(input.data);
      setMessage(result.message);
      if (result.success) {
        router.push(admin ? "/admin/posts" : "/dashboard/posts");
        router.refresh();
      }
    } catch {
      setMessage("Unable to save your post.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-8">
      <PageHeading
        title={post ? "Edit post" : "Create post"}
        description="Write and publish your story."
      />
      <form
        onSubmit={submit}
        aria-busy={busy}
        className="rounded-xl border bg-card p-6"
      >
        <fieldset disabled={busy} className="space-y-6">
          <div>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              defaultValue={post?.title}
              minLength={3}
              maxLength={200}
              required
              className={fieldClass}
            />
          </div>
          <div>
            <span id="post-content-label">Content</span>
            <ContentEditor
              initialDocument={post?.content as PartialBlock[] | undefined}
              disabled={busy}
              onReady={editorReady}
            />
          </div>
          <div>
            <label htmlFor="categoryId">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={post?.categoryId ?? ""}
              required
              className={fieldClass}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((c) => (
                <option key={c.publicId} value={c.publicId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {admin && (
            <div>
              <label htmlFor="authorId">Author</label>
              <select
                id="authorId"
                name="authorId"
                defaultValue={post?.authorId || ""}
                className={fieldClass}
              >
                <option value="">
                  {post ? "Keep current author" : "My account"}
                </option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              defaultValue={post?.status || "Draft"}
              className={fieldClass}
            >
              <option>Draft</option>
              <option>Published</option>
            </select>
          </div>
          {!categories.length && (
            <p>
              {admin
                ? "Create a category before saving a post."
                : "An administrator needs to create a category before you can save a post."}
            </p>
          )}
          {message && <p role="status">{message}</p>}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={busy || !ready || !categories.length}
            >
              {busy ? "Saving..." : "Save post"}
            </Button>
            <Link
              href={admin ? "/admin/posts" : "/dashboard/posts"}
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </Link>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
