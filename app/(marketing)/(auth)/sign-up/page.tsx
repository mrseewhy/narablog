import { AuthEntry } from "@/components/site/auth-entry";
import Link from "next/link";
import SignUpForm from "./_component/SignUpForm";

const SignUpPage = () => {
  return (
    <AuthEntry>
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 md:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join NaroBlog to read, write, and share your stories.
          </p>
        </div>
        <SignUpForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthEntry>
  );
};

export default SignUpPage;
