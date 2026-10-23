import Link from "next/link";

import { Button } from "@/components/ui/button";

const ForgotPasswordPage = () => {
  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-6 md:p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we will send you a link to reset it.
        </p>
      </div>

      <form method="post" className="mt-8 space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
