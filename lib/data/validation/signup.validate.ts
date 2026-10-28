import * as z from "zod";

export const signUpFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be a minimum of 3 characters")
    .max(70, "Name cannot be more than 70 characters"),
  email: z.string().trim().pipe(z.email()),
  password: z
    .string()
    .min(8, "Password must be a minimum of 8 characters")
    .max(70, "Password cannot be more than 70 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/\d/, "Password must contain a number")
    .regex(/[@$!%*?&]/, "Password must contain a special character (@$!%*?&)"),
});
export type signUpFormSchemaType = z.infer<typeof signUpFormSchema>;
