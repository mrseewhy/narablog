"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { createUserAction } from "@/lib/data/actions/account.actions";
import { createUserSchema } from "@/lib/data/validation/account.validate";
import type * as z from "zod";
import { ROLES } from "@/lib/roles";
import { PageHeading, fieldClass } from "@/components/dashboard/ui";

type Errors = z.inferFlattenedErrors<typeof createUserSchema>["fieldErrors"];

export default function Page() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const parsed = createUserSchema.safeParse(
      Object.fromEntries(new FormData(e.currentTarget).entries()),
    );
    setMessage("");
    setErrors({});
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    if (
      parsed.data.role === ROLES.ADMIN &&
      !window.confirm(
        "Create this user as an administrator with account management access?",
      )
    )
      return;
    setBusy(true);
    try {
      const result = await createUserAction(parsed.data);
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
        description="Create an account that can sign in immediately."
      />
      <form
        onSubmit={submit}
        aria-busy={busy}
        className="rounded-xl border bg-card p-6"
      >
        <fieldset disabled={busy} className="space-y-5">
          <div>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              minLength={3}
              maxLength={70}
              required
              aria-invalid={Boolean(errors.name?.length)}
              aria-describedby={
                errors.name?.length ? "create-name-error" : undefined
              }
              className={fieldClass}
            />
            {errors.name?.[0] && (
              <p id="create-name-error" className="text-sm text-destructive">
                {errors.name[0]}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              aria-invalid={Boolean(errors.email?.length)}
              aria-describedby={
                errors.email?.length ? "create-email-error" : undefined
              }
              className={fieldClass}
            />
            {errors.email?.[0] && (
              <p id="create-email-error" className="text-sm text-destructive">
                {errors.email[0]}
              </p>
            )}
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
              aria-invalid={Boolean(errors.password?.length)}
              aria-describedby={
                errors.password?.length
                  ? "create-password-error"
                  : "create-password-help"
              }
              className={fieldClass}
            />
            {errors.password?.[0] && (
              <p
                id="create-password-error"
                className="text-sm text-destructive"
              >
                {errors.password[0]}
              </p>
            )}
            <p
              id="create-password-help"
              className="mt-2 text-sm text-muted-foreground"
            >
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
          {message && (
            <p role="alert" className="text-sm text-destructive">
              {message}
            </p>
          )}
          <div className="flex gap-3">
            <Button disabled={busy} type="submit">
              {busy ? "Creating..." : "Create user"}
            </Button>
            <Link
              href="/admin/users"
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
