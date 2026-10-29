"use client";

import { Button } from "@/components/ui/button";
import AuthField from "../../_component/AuthField";
import { FormEvent } from "react";
import * as z from "zod";

import { signUpFormSchema } from "@/lib/data/validation/signup.validate";
import React from "react";
import { toast } from "sonner";
import { signUpAction } from "@/lib/data/actions/auth.actions";

const SignUpForm = () => {
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof z.infer<typeof signUpFormSchema>, string[]>>
  >({});
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const form = e.currentTarget;
    const newData = new FormData(form);
    const formData = Object.fromEntries(newData.entries());
    const result = signUpFormSchema.safeParse(formData);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const newUser = await signUpAction(result.data);
      if (!newUser.success) {
        toast.error(newUser.message);
        if (newUser.errors) {
          setErrors(newUser.errors);
        }
        return;
      }
      window.location.replace("/redirect");
    } catch {
      toast.error("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5"
      aria-busy={loading}
    >
      <div className="">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          required
          disabled={loading}
          aria-invalid={Boolean(errors.name?.length)}
          aria-describedby={
            errors.name?.length ? "signup-name-error" : undefined
          }
          onChange={handleChange}
          className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.name && (
          <span id="signup-name-error" className="text-xs text-destructive">
            {errors.name[0]}
          </span>
        )}
      </div>

      <div className="">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          disabled={loading}
          aria-invalid={Boolean(errors.email?.length)}
          aria-describedby={
            errors.email?.length ? "signup-email-error" : undefined
          }
          onChange={handleChange}
          className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.email && (
          <span id="signup-email-error" className="text-xs text-destructive">
            {errors.email[0]}
          </span>
        )}
      </div>
      <div>
        <AuthField
          id="password"
          label="Password"
          type="password"
          passwordToggle
          onChange={handleChange}
          autoComplete="new-password"
          placeholder="Create a password"
          required
          disabled={loading}
          aria-invalid={Boolean(errors.password?.length)}
          aria-describedby={
            errors.password?.length ? "signup-password-error" : undefined
          }
        />
        {errors.password && (
          <span id="signup-password-error" className="text-xs text-destructive">
            {errors.password[0]}
          </span>
        )}
      </div>

      <Button disabled={loading} type="submit" size="lg" className="w-full">
        {loading ? "Creating..." : "Create account"}
      </Button>
    </form>
  );
};

export default SignUpForm;
