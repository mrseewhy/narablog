import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { demoUsers } from "@/lib/data/demo/dashboard";
import { DataTable } from "./data-table";
import { Badge, PageHeading, Stats } from "./ui";

export function UsersPage() {
  return <div className="space-y-8"><PageHeading title="Users" description="Explore your community of authors, editors, and readers."><Link href="/admin/users/create" className={buttonVariants()}><Plus className="size-4" /> Create user</Link></PageHeading><Stats items={[{ label: "Total users", value: demoUsers.length }, { label: "Active", value: demoUsers.filter(user => user.status === "Active").length }, { label: "Pending", value: demoUsers.filter(user => user.status === "Pending").length }, { label: "Suspended", value: demoUsers.filter(user => user.status === "Suspended").length }]} /><DataTable label="Users" filters={["Active", "Pending", "Suspended"]} columns={["User", "Role", "Posts", "Joined", "Status"]} rows={demoUsers.map(user => ({ id: user.id, search: `${user.name} ${user.email} ${user.role}`, filter: user.status, cells: [<div key="user" className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary">{user.name.split(" ").map(part => part[0]).join("")}</span><div><p className="font-medium">{user.name}</p><p className="mt-1 text-xs text-muted-foreground">{user.email}</p></div></div>, <Badge key="role">{user.role}</Badge>, user.posts, user.joined, <Badge key="status">{user.status}</Badge>] }))} /></div>;
}
