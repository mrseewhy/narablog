import * as z from "zod";

export const signInFormSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  // Login verifies an existing password; it must not change it or apply
  // registration complexity rules.
  password: z
    .string()
    .min(1, "Enter your password")
    .max(128, "Password is too long"),
});

export type SignInInput = z.infer<typeof signInFormSchema>;
export type SignInErrors = z.inferFlattenedErrors<
  typeof signInFormSchema
>["fieldErrors"];
