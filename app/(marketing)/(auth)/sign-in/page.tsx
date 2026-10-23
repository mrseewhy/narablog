import Link from "next/link";

import { Button } from "@/components/ui/button";
import AuthCard from "../_component/AuthCard";
import AuthField from "../_component/AuthField";

const SignInPage = () => {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your NaroBlog account."
      footer={{
        text: "Do not have an account?",
        label: "Sign up",
        href: "/sign-up",
      }}
    >
      <form method="post" className="space-y-5">
        <AuthField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full">
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
};

export default SignInPage;
