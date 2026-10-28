import { AuthEntry } from "@/components/site/auth-entry";
import AuthCard from "../_component/AuthCard";
import SignInForm from "./_component/SignInForm";

const SignInPage = () => {
  return (
    <AuthEntry>
      <AuthCard
        title="Welcome back"
        description="Sign in to your NaroBlog account."
        footer={{
          text: "Do not have an account?",
          label: "Sign up",
          href: "/sign-up",
        }}
      >
        <SignInForm />
      </AuthCard>
    </AuthEntry>
  );
};

export default SignInPage;
