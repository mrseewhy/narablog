"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signInAction } from "@/lib/data/actions/auth.actions";
import {
  signInFormSchema,
  type SignInErrors,
} from "@/lib/data/validation/signin.validate";
import AuthField from "../../_component/AuthField";

export default function SignInForm() {
  const params = useSearchParams();
  const [errors, setErrors] = useState<SignInErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name } = event.target;
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    setServerError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const result = signInFormSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget).entries()),
    );
    setServerError(null);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const response = await signInAction(result.data);
      if (!response.success) {
        setServerError(response.message);
        if (response.errors) setErrors(response.errors);
        setLoading(false);
        return;
      }
      // Start with fresh page/session state after the server sets the cookie.
      window.location.replace("/redirect");
    } catch {
      setServerError("Unable to sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
      {params.get("verified") === "1" && (
        <p role="status" className="text-sm text-primary">
          Email verified. You can now sign in.
        </p>
      )}
      {params.get("error") && (
        <p role="alert" className="text-sm text-destructive">
          This verification link is invalid or expired. Request a new
          verification link below.
        </p>
      )}
      <div>
        <AuthField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          disabled={loading}
          onChange={handleChange}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "signin-email-error" : undefined}
        />
        {errors.email && (
          <p id="signin-email-error" className="mt-1 text-xs text-destructive">
            {errors.email[0]}
          </p>
        )}
      </div>
      <div>
        <AuthField
          id="password"
          label="Password"
          type="password"
          passwordToggle
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          disabled={loading}
          onChange={handleChange}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "signin-password-error" : undefined
          }
        />
        {errors.password && (
          <p
            id="signin-password-error"
            className="mt-1 text-xs text-destructive"
          >
            {errors.password[0]}
          </p>
        )}
      </div>
      <p className="text-sm">
        <Link href="/verify-email" className="text-primary underline">
          Verify email or request a new verification link
        </Link>
      </p>
      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
