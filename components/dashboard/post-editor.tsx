"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ImagePlus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { authorPosts, demoUsers } from "@/lib/data/demo/dashboard";
import { categories } from "@/lib/data/demo/categories";
import { fieldClass, PageHeading } from "./ui";

const ContentEditor = dynamic(() => import("./content-editor"), {
  ssr: false,
  loading: () => <div className="min-h-96 animate-pulse rounded-lg border bg-muted" aria-label="Loading content editor" />,
});

function Editor({ post, admin = false }: { post?: (typeof authorPosts)[number]; admin?: boolean }) {
  const [imageName, setImageName] = useState("");
  return <form onSubmit={event => event.preventDefault()} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
    <section className="space-y-6 rounded-xl border bg-card p-6 shadow-sm" aria-label="Post content">
      <div className="space-y-2"><label htmlFor="post-title" className="text-sm font-medium">Title</label><input id="post-title" name="title" required defaultValue={post?.title} placeholder="Give your story a title" className={fieldClass} /></div>
      <div className="space-y-2"><span id="post-content-label" className="text-sm font-medium">Content</span><ContentEditor initialText={post?.body} /></div>
    </section>
    <aside className="space-y-6">
      <section className="space-y-5 rounded-xl border bg-card p-6 shadow-sm" aria-labelledby="publish-heading">
        <h2 id="publish-heading" className="font-semibold">Publishing</h2>
        {admin && <div className="space-y-2"><label htmlFor="post-author" className="text-sm font-medium">Author</label><select id="post-author" name="author" required defaultValue="" className={fieldClass}><option value="" disabled>Select an author</option>{demoUsers.filter(user => user.status === "Active").map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select></div>}
        <div className="space-y-2"><label htmlFor="post-category" className="text-sm font-medium">Category</label><select id="post-category" name="category" required defaultValue={post?.category ?? ""} className={fieldClass}><option value="" disabled>Select a category</option>{categories.map(category => <option key={category.id}>{category.name}</option>)}</select></div>
        <div className="space-y-2"><label htmlFor="post-status" className="text-sm font-medium">Status</label><select id="post-status" name="status" defaultValue={post?.status ?? "Draft"} className={fieldClass}><option>Draft</option><option>Published</option></select></div>
        <Button type="submit" className="w-full">{post ? "Save changes" : "Save post"}</Button>
        <Link href={admin ? "/admin/posts" : "/dashboard/posts"} className={buttonVariants({ variant: "outline", className: "w-full" })}>Cancel</Link>
      </section>
      <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm" aria-labelledby="cover-heading"><h2 id="cover-heading" className="font-semibold">Cover image</h2><label htmlFor="post-cover" className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground hover:border-primary"><ImagePlus className="size-8" aria-hidden="true" /><span>{imageName || "Choose a cover image"}</span><span className="text-xs">PNG, JPEG, or WebP</span></label><input id="post-cover" name="cover" type="file" accept="image/png,image/jpeg,image/webp" className="block w-full text-xs text-muted-foreground file:mr-2 file:rounded-md file:border file:bg-background file:p-2 file:text-foreground" onChange={event => setImageName(event.target.files?.[0]?.name ?? "")} /></section>
    </aside>
  </form>;
}

export function PostEditor({ edit = false, admin = false, initialPostId = authorPosts[0].id }: { edit?: boolean; admin?: boolean; initialPostId?: number }) {
  const [selected, setSelected] = useState(authorPosts.some(post => post.id === initialPostId) ? initialPostId : authorPosts[0].id);
  const post = edit ? authorPosts.find(item => item.id === selected) : undefined;
  return <div className="space-y-8"><PageHeading title={edit ? "Edit Posts" : "Create Posts"} description={edit ? "Refine your stories and keep your content up to date." : "Turn your ideas into your next story."} />
    {edit && <section className="rounded-xl border bg-card p-6 shadow-sm"><label htmlFor="selected-post" className="mb-2 block text-sm font-medium">Select a post</label><select id="selected-post" value={selected} onChange={event => setSelected(Number(event.target.value))} className={`${fieldClass} sm:max-w-xl`}>{authorPosts.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></section>}
    <Editor key={post?.id ?? "new"} post={post} admin={admin} />
  </div>;
}
