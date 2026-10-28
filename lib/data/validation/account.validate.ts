import * as z from "zod";
import { signUpFormSchema } from "./signup.validate";
import { ROLES } from "@/lib/roles";

export const emailSchema = z.object({
  email: z.string().trim().pipe(z.email()),
});
export const newPasswordSchema = signUpFormSchema.shape.password;
export const profileSchema = z.object({
  name: signUpFormSchema.shape.name,
  username: z
    .string()
    .trim()
    .max(30)
    .regex(/^[a-zA-Z0-9_]*$/, "Use letters, numbers, or underscores"),
  bio: z.string().trim().max(300),
  website: z
    .string()
    .trim()
    .pipe(z.union([z.literal(""), z.url({ protocol: /^https?$/ })])),
  location: z.string().trim().max(100),
});
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1).max(2048),
    newPassword: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: newPasswordSchema,
    confirmPassword: z.string(),
    revokeOtherSessions: z.boolean(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export const roleSchema = z.enum([ROLES.ADMIN, ROLES.USER]);
export const accountWriteSchema = profileSchema.partial().extend({
  role: roleSchema.optional(),
});
export const createUserSchema = signUpFormSchema.extend({ role: roleSchema });
export type ProfileInput = z.infer<typeof profileSchema>;
