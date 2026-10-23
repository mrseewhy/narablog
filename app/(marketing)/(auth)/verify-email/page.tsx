import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

const VerifyEmailPage = () => {
  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-6 md:p-8">
      <div className="text-center">
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <Mail className="size-6" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Check your inbox</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a verification link to your email address. Open it to finish
          setting up your account.
        </p>
      </div>

      <form method="post" className="mt-8">
        <Button type="submit" variant="outline" size="lg" className="w-full">
          Resend email
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already verified?{" "}
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

export default VerifyEmailPage;
