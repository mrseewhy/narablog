import * as z from "zod";
import slugify from "slugify";

export const createCategorySlug = (name: string) =>
  slugify(name, { lower: true, strict: true, trim: true });

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must have at least 2 characters")
    .max(70, "Category name must not be more than 70 characters")
    .refine((name) => /[a-z0-9]/.test(createCategorySlug(name)), {
      message: "Enter a category name that produces a valid URL slug.",
    }),

  description: z
    .string()
    .trim()
    .max(500, "Description must not be more than 500 characters")
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof categorySchema>;
export type CategoryErrors = z.inferFlattenedErrors<
  typeof categorySchema
>["fieldErrors"];

export const categoryIdSchema = z.uuid("Invalid category.");
