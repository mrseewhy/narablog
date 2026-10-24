import * as z from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(70, "Name cannot be more than 70 characters"),
  email: z.string().trim().pipe(z.email()),
  subject: z
    .string()
    .trim()
    .min(2, "Subject must be at least 2 characters long")
    .max(70, "Subject cannot be more than 70 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters long"),
  contact_extra_reference: z.literal(""),
});

export type CreateContactInput = z.infer<typeof contactSchema>;
