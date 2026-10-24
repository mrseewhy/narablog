"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { Plus, Pencil, ArrowUpRight, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { posts } from "@/lib/data/demo/posts";
import { authorPosts } from "@/lib/data/demo/dashboard";
import { DataTable } from "./data-table";
import { Badge, PageHeading, Stats } from "./ui";

type AuthorPost = (typeof authorPosts)[number];

export function PostsPage({ admin = false }: { admin?: boolean }) {
  const [myPosts, setMyPosts] = useState(authorPosts);
  const [pendingPost, setPendingPost] = useState<AuthorPost | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);
  const createRef = useRef<HTMLAnchorElement>(null);
  const deleteTriggerRef = useRef<HTMLElement | null>(null);
  const items = admin
    ? posts.map((post) => ({ ...post, status: "Published" }))
    : myPosts;

  function deletePost() {
    if (!pendingPost) return;
    setMyPosts((current) =>
      current.filter((post) => post.id !== pendingPost.id),
    );
    setAnnouncement(`Deleted “${pendingPost.title}”.`);
    setPendingPost(null);
  }

  return (
    <Dialog.Root
      open={pendingPost !== null}
      onOpenChange={(open) => {
        if (!open) setPendingPost(null);
      }}
    >
      <div className="space-y-8">
        <PageHeading
          title={admin ? "Posts" : "My Posts"}
          description={
            admin
              ? "Browse published stories across the platform."
              : "Manage your stories, drafts, and published posts."
          }
        >
          <Link
            ref={createRef}
            href={admin ? "/admin/posts/create" : "/dashboard/posts/create"}
            className={buttonVariants()}
          >
            <Plus className="size-4" /> Create post
          </Link>
        </PageHeading>
        <Stats
          items={[
            { label: "Total posts", value: items.length },
            {
              label: "Published",
              value: items.filter((post) => post.status === "Published").length,
            },
            {
              label: "Drafts",
              value: items.filter((post) => post.status === "Draft").length,
            },
            {
              label: admin ? "Categories" : "Total views",
              value: admin
                ? new Set(items.map((post) => post.category)).size
                : myPosts
                    .reduce((sum, post) => sum + post.views, 0)
                    .toLocaleString("en-US"),
            },
          ]}
        />
        <DataTable
          label="Posts"
          filters={["Published", "Draft"]}
          columns={[
            "Title",
            ...(admin ? ["Author"] : []),
            "Category",
            "Date",
            "Status",
            "Actions",
          ]}
          rows={items.map((post) => ({
            id: post.id,
            search: `${post.title} ${post.category} ${"author" in post ? post.author : ""}`,
            filter: post.status,
            cells: [
              <span key="title" className="block min-w-48 max-w-md font-medium">
                {post.title}
              </span>,
              ...("author" in post ? [post.author] : []),
              post.category,
              post.date,
              <Badge key="status">{post.status}</Badge>,
              "slug" in post ? (
                <Link
                  key="action"
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  View <ArrowUpRight className="size-4" />
                </Link>
              ) : (
                <div
                  key="action"
                  className="flex items-center gap-4 whitespace-nowrap"
                >
                  <Link
                    href={`/dashboard/posts/edit?post=${post.id}`}
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    <Pencil className="size-4" /> Edit
                  </Link>
                  <Dialog.Trigger
                    aria-label={`Delete ${post.title}`}
                    onClick={(event) => {
                      deleteTriggerRef.current = event.currentTarget;
                      setPendingPost(post);
                    }}
                    className="inline-flex items-center gap-1 rounded-sm font-medium text-destructive outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Trash2 className="size-4" /> Delete
                  </Dialog.Trigger>
                </div>
              ),
            ],
          }))}
        />
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </div>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Popup
          initialFocus={cancelRef}
          finalFocus={() =>
            deleteTriggerRef.current?.isConnected
              ? deleteTriggerRef.current
              : createRef.current
          }
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 text-card-foreground shadow-xl outline-none"
        >
          <span className="mb-4 grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <Trash2 className="size-6" aria-hidden="true" />
          </span>
          <Dialog.Title className="text-xl font-semibold">
            Delete post?
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-sm leading-6 text-muted-foreground">
            Are you sure you want to delete “{pendingPost?.title}”?
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close
              ref={cancelRef}
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </Dialog.Close>
            <Button variant="destructive" onClick={deletePost}>
              <Trash2 className="size-4" /> Delete post
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
