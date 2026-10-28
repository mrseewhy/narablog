"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createUserAction } from "@/lib/data/actions/account.actions";
import { ROLES } from "@/lib/roles";
import { PageHeading, fieldClass } from "@/components/dashboard/ui";
export default function Page() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const values = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const result = await createUserAction(values);
      setMessage(result.message);
      if (result.success) {
        router.push("/admin/users");
        router.refresh();
      }
    } catch {
      setMessage("Unable to create user.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <PageHeading
        title="Create user"
        description="New users must verify their email before signing in."
      />
      <form
        onSubmit={submit}
        className="space-y-5 rounded-xl border bg-card p-6"
      >
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="password">Initial password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={70}
            required
            className={fieldClass}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Use uppercase, lowercase, a number, and a special character. The
            user can request a reset link to choose their own password.
          </p>
        </div>
        <div>
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            defaultValue={ROLES.USER}
            className={fieldClass}
          >
            <option value={ROLES.USER}>User</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>
        </div>
        {message && <p role="status">{message}</p>}
        <Button disabled={busy} type="submit">
          {busy ? "Creating..." : "Create user"}
        </Button>
      </form>
    </div>
  );
}
