"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  requestResetAction,
  resendVerificationAction,
  resetPasswordAction,
} from "@/lib/data/actions/account.actions";

const inputClass = "h-11 w-full rounded-lg border bg-background px-3 text-sm";
export function AuthEmailForm({
  mode,
}: {
  mode: "forgot" | "verify" | "reset";
}) {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const invalid = mode === "reset" && (!token || Boolean(params.get("error")));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const title =
    mode === "forgot"
      ? "Forgot your password?"
      : mode === "verify"
        ? "Verify your email"
        : "Set a new password";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setBusy(true);
    setResult(null);
    try {
      const response =
        mode === "forgot"
          ? await requestResetAction(values)
          : mode === "verify"
            ? await resendVerificationAction(values)
            : await resetPasswordAction({ ...values, token });
      setResult(response);
      if (response.success) form.reset();
    } catch {
      setResult({
        success: false,
        message: "Unable to complete the request. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="w-full max-w-md rounded-2xl border bg-card p-6 md:p-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {mode === "verify"
          ? "Open your verification link before signing in. Enter your email to request another link."
          : mode === "forgot"
            ? "Enter your email to request a password reset link."
            : "Choose a new password with uppercase, lowercase, a number, and a special character."}
      </p>
      {invalid ? (
        <div role="alert" className="mt-6">
          <p>This reset link is invalid or expired.</p>
          <Link href="/forgot-password" className="text-primary underline">
            Request a new reset link
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-5" aria-busy={busy}>
          {mode === "reset" ? (
            <>
              <div>
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={70}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={inputClass}
                />
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>
          )}
          <Button type="submit" disabled={busy} className="w-full">
            {busy
              ? "Please wait..."
              : mode === "reset"
                ? "Reset password"
                : mode === "verify"
                  ? "Send verification link"
                  : "Send reset link"}
          </Button>
        </form>
      )}
      {result && (
        <p
          role={result.success ? "status" : "alert"}
          className={`mt-4 text-sm ${result.success ? "text-primary" : "text-destructive"}`}
        >
          {result.message}
        </p>
      )}
      {process.env.NODE_ENV === "development" && (
        <p className="mt-4 text-xs text-muted-foreground">
          Local development: delivery links appear in the server terminal.
        </p>
      )}
      <p className="mt-6 text-sm">
        <Link href="/sign-in" className="text-primary underline">
          Back to sign in
        </Link>
        {mode === "reset" && (
          <Link href="/forgot-password" className="ml-4 text-primary underline">
            Request a new link
          </Link>
        )}
      </p>
    </section>
  );
}
