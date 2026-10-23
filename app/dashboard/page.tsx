import Link from "next/link";
import { ArrowRight, FilePen, FileText, Plus, UserRound } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Badge, PageHeading, Stats } from "@/components/dashboard/ui";
import { activities, authorPosts } from "@/lib/data/demo/dashboard";

export default function UserDashboardPage() {
  const drafts = authorPosts.filter(post => post.status === "Draft");
  const published = authorPosts.filter(post => post.status === "Published");
  const recentActivity = activities.filter(item => item.user === "Olusegun").slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeading title="Overview" description="Welcome back, Olusegun. Pick up a draft or start something new.">
        <Link href="/dashboard/posts/create" className={buttonVariants({ className: "gap-2" })}>
          <Plus className="size-4" /> Create post
        </Link>
      </PageHeading>

      <Stats items={[
        { label: "Total posts", value: authorPosts.length },
        { label: "Published", value: published.length },
        { label: "Drafts", value: drafts.length },
        { label: "Total views", value: authorPosts.reduce((sum, post) => sum + post.views, 0).toLocaleString("en-US") },
      ]} />

      <section className="rounded-xl border border-primary/20 bg-primary/5 p-6 sm:p-8" aria-labelledby="continue-heading">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="hidden rounded-xl bg-primary/10 p-3 text-primary sm:block"><FilePen className="size-6" aria-hidden="true" /></span>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Your writing</p>
              <h2 id="continue-heading" className="text-xl font-bold">{drafts.length ? "Continue where you left off" : "Your next story starts here"}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{drafts.length ? `${drafts.length} unfinished ${drafts.length === 1 ? "story is" : "stories are"} waiting for your next idea.` : "Bring a new idea to life and share it with your readers."}</p>
            </div>
          </div>
          <Link href={drafts.length ? `/dashboard/posts/edit?post=${drafts[0].id}` : "/dashboard/posts/create"} className={buttonVariants({ variant: "outline", className: "gap-2" })}>
            {drafts.length ? "Continue writing" : "Start writing"} <ArrowRight className="size-4" />
          </Link>
        </div>
        {drafts.length > 0 && (
          <div className="mt-6 divide-y rounded-lg border bg-card">
            {drafts.map(post => (
              <Link key={post.id} href={`/dashboard/posts/edit?post=${post.id}`} className="flex items-center justify-between gap-4 rounded-lg p-4 transition-colors hover:bg-muted/50">
                <div className="min-w-0"><p className="font-medium">{post.title}</p><p className="mt-1 text-xs text-muted-foreground">{post.category} · {post.date}</p></div>
                <span className="flex shrink-0 items-center gap-3"><Badge>Draft</Badge><ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm" aria-labelledby="posts-heading">
          <div className="flex items-center justify-between gap-4 border-b p-6">
            <h2 id="posts-heading" className="font-semibold">Recent posts</h2>
            <Link href="/dashboard/posts" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">View all <ArrowRight className="size-4" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Your recent posts</caption>
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr><th scope="col" className="px-6 py-3">Post</th><th scope="col" className="px-6 py-3">Status</th><th scope="col" className="px-6 py-3 text-right">Views</th><th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody className="divide-y">
                {authorPosts.slice(0, 5).map(post => (
                  <tr key={post.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4"><Link href={`/dashboard/posts/edit?post=${post.id}`} className="block min-w-44 font-medium hover:text-primary">{post.title}</Link><p className="mt-1 text-xs text-muted-foreground">{post.date}</p></td>
                    <td className="px-6 py-4"><Badge>{post.status}</Badge></td>
                    <td className="px-6 py-4 text-right tabular-nums">{post.views.toLocaleString("en-US")}</td>
                    <td className="px-6 py-4"><Link href={`/dashboard/posts/edit?post=${post.id}`} aria-label={`Edit ${post.title}`} className="text-sm font-medium text-primary hover:underline">Edit</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border bg-card shadow-sm" aria-labelledby="activity-heading">
            <div className="flex items-center justify-between gap-4 border-b p-6"><h2 id="activity-heading" className="font-semibold">Recent activity</h2><Link href="/dashboard/activity" aria-label="View all activity" className="text-sm font-medium text-primary hover:underline">View all</Link></div>
            <ul className="divide-y px-6">
              {recentActivity.map(item => (
                <li key={item.id} className="flex gap-3 py-5">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">{item.type === "Posts" ? <FileText className="size-4" aria-hidden="true" /> : <UserRound className="size-4" aria-hidden="true" />}</span>
                  <div><p className="text-sm font-medium">{item.action}</p><p className="mt-1 text-sm text-muted-foreground">{item.detail}</p><p className="mt-2 text-xs text-muted-foreground">{item.date}</p></div>
                </li>
              ))}
            </ul>
          </section>
          <Link href="/dashboard/profile" className="group flex items-center gap-4 rounded-xl border bg-card p-6 shadow-sm transition-colors hover:border-primary/50">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><UserRound className="size-5" aria-hidden="true" /></span>
            <div className="flex-1"><h2 className="text-sm font-semibold">Your author profile</h2><p className="mt-1 text-sm text-muted-foreground">Update your bio and personal details.</p></div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
