import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Mail,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Badge, PageHeading, Stats } from "@/components/dashboard/ui";
import { activities, contacts, demoUsers } from "@/lib/data/demo/dashboard";
import { posts } from "@/lib/data/demo/posts";
import { categories } from "@/lib/data/demo/categories";
import { countCategoriesDAL } from "@/lib/data/dal/category.dal";

export default async function AdminDashboardPage() {
  const totalCategories = await countCategoriesDAL();
  const unreadMessages = contacts.filter(
    (contact) => contact.status === "Unread",
  );
  const pendingUsers = demoUsers.filter((user) => user.status === "Pending");
  const suspendedUsers = demoUsers.filter(
    (user) => user.status === "Suspended",
  );
  const recentUsers = [...demoUsers]
    .sort((a, b) => Date.parse(b.joined) - Date.parse(a.joined))
    .slice(0, 4);
  const attentionItems = [
    {
      label: "Unread messages",
      count: unreadMessages.length,
      description: "Enquiries and feedback awaiting your attention.",
      href: "/admin/contacts",
      icon: Mail,
    },
    {
      label: "Pending accounts",
      count: pendingUsers.length,
      description: "New members awaiting email verification.",
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Suspended accounts",
      count: suspendedUsers.length,
      description: "Accounts with restricted platform access.",
      href: "/admin/users",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeading
        title="Dashboard"
        description="Keep track of your community, content, and incoming messages."
      >
        <Link
          href="/admin/posts"
          className={buttonVariants({ variant: "outline", className: "gap-2" })}
        >
          <FileText className="size-4" /> Manage posts
        </Link>
      </PageHeading>

      <Stats
        items={[
          { label: "Total users", value: demoUsers.length },
          { label: "Published posts", value: posts.length },
          { label: "Categories", value: totalCategories },
          { label: "Unread messages", value: unreadMessages.length },
        ]}
      />

      <section aria-labelledby="attention-heading" className="space-y-4">
        <h2 id="attention-heading" className="font-semibold">
          Needs attention
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {attentionItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group rounded-xl border bg-card p-6 shadow-sm transition-colors hover:border-primary/50"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-2xl font-bold tabular-nums">
                  {item.count}
                </span>
              </div>
              <h3 className="mt-4 font-semibold">{item.label}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                {item.href === "/admin/contacts"
                  ? "Open inbox"
                  : "Manage users"}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section
          className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm"
          aria-labelledby="posts-heading"
        >
          <div className="flex items-center justify-between gap-4 border-b p-6">
            <h2 id="posts-heading" className="font-semibold">
              Recent published posts
            </h2>
            <Link
              href="/admin/posts"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Recent posts across NaroBlog
              </caption>
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Post
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {posts.slice(0, 5).map((post) => (
                  <tr key={post.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="block min-w-44 max-w-sm font-medium hover:text-primary"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {post.date}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                      {post.author}
                    </td>
                    <td className="px-6 py-4">
                      <Badge>{post.category}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className="rounded-xl border bg-card shadow-sm"
          aria-labelledby="inbox-heading"
        >
          <div className="flex items-center justify-between gap-4 border-b p-6">
            <h2 id="inbox-heading" className="font-semibold">
              Contact inbox
            </h2>
            <Link
              href="/admin/contacts"
              className="text-sm font-medium text-primary hover:underline"
            >
              Open inbox
            </Link>
          </div>
          <ul className="divide-y px-6">
            {contacts.slice(0, 3).map((contact) => (
              <li key={contact.id} className="py-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{contact.name}</p>
                  <Badge>{contact.status}</Badge>
                </div>
                <p className="mt-2 text-sm">{contact.subject}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {contact.date}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <section
          className="overflow-hidden rounded-xl border bg-card shadow-sm"
          aria-labelledby="members-heading"
        >
          <div className="flex items-center justify-between gap-4 border-b p-6">
            <h2 id="members-heading" className="font-semibold">
              Recent members
            </h2>
            <Link
              href="/admin/users"
              className="text-sm font-medium text-primary hover:underline"
            >
              View users
            </Link>
          </div>
          <ul className="divide-y px-6">
            {recentUsers.map((user) => (
              <li
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold">
                    {user.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {user.role} · Joined {user.joined}
                    </p>
                  </div>
                </div>
                <Badge>{user.status}</Badge>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="rounded-xl border bg-card shadow-sm"
          aria-labelledby="activity-heading"
        >
          <div className="flex items-center justify-between gap-4 border-b p-6">
            <h2 id="activity-heading" className="font-semibold">
              Platform activity
            </h2>
            <Link
              href="/admin/activities"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all activity
            </Link>
          </div>
          <ul className="divide-y px-6">
            {activities.slice(0, 4).map((item) => (
              <li key={item.id} className="flex gap-3 py-4">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                  {item.type === "Posts" ? (
                    <FileText className="size-4" aria-hidden="true" />
                  ) : (
                    <UserRound className="size-4" aria-hidden="true" />
                  )}
                </span>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{item.user}</span> ·{" "}
                    {item.action}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.date}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
