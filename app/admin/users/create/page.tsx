"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { fieldClass, PageHeading } from "@/components/dashboard/ui";

export default function CreateUserPage() {
  return (
    <div className="space-y-8">
      <PageHeading title="Create user" description="Add a member and set their account details." />
      <section className="overflow-hidden rounded-xl border bg-card shadow-sm" aria-labelledby="user-details-heading">
        <div className="flex items-center gap-3 border-b p-6"><span className="rounded-lg bg-primary/10 p-3 text-primary"><UserPlus className="size-5" aria-hidden="true" /></span><h2 id="user-details-heading" className="font-semibold">User details</h2></div>
        <form
          onSubmit={event => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            const confirmation = form.elements.namedItem("confirmPassword") as HTMLInputElement;
            confirmation.setCustomValidity(data.get("password") === data.get("confirmPassword") ? "" : "Passwords do not match.");
            confirmation.reportValidity();
          }}
          onInput={event => { (event.currentTarget.elements.namedItem("confirmPassword") as HTMLInputElement).setCustomValidity(""); }}
          className="space-y-6 p-6"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="user-name" className="text-sm font-medium">Full name</label><input id="user-name" name="name" autoComplete="name" required maxLength={80} pattern=".*\S.*" placeholder="Enter full name" className={fieldClass} /></div>
            <div className="space-y-2"><label htmlFor="user-email" className="text-sm font-medium">Email address</label><input id="user-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="name@example.com" className={fieldClass} /></div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="user-role" className="text-sm font-medium">Role</label><select id="user-role" name="role" defaultValue="Author" className={fieldClass}><option>Author</option><option>Editor</option><option>Administrator</option></select></div>
            <div className="space-y-2"><label htmlFor="user-status" className="text-sm font-medium">Status</label><select id="user-status" name="status" defaultValue="Pending" className={fieldClass}><option>Pending</option><option>Active</option><option>Suspended</option></select></div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="user-password" className="text-sm font-medium">Password</label><input id="user-password" name="password" type="password" autoComplete="new-password" required minLength={8} aria-describedby="user-password-help" className={fieldClass} /><p id="user-password-help" className="text-xs text-muted-foreground">Use at least 8 characters.</p></div>
            <div className="space-y-2"><label htmlFor="user-confirm-password" className="text-sm font-medium">Confirm password</label><input id="user-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} className={fieldClass} /></div>
          </div>
          <div className="space-y-2"><label htmlFor="user-bio" className="text-sm font-medium">Bio</label><textarea id="user-bio" name="bio" rows={4} maxLength={300} placeholder="A short introduction to this author" className={`${fieldClass} h-auto resize-y py-3`} /></div>
          <div className="flex justify-end gap-3 border-t pt-6"><Link href="/admin/users" className={buttonVariants({ variant: "outline" })}>Cancel</Link><Button type="submit">Create user</Button></div>
        </form>
      </section>
    </div>
  );
}
