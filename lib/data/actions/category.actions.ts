"use server";
import { updateTag } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireAdminSession } from "../security/session";
import {
  categorySchema,
  categoryIdSchema,
  type CategoryErrors,
} from "../validation/category.validate";
import {
  createCategoryDAL,
  updateCategoryDAL,
  deleteCategoryDAL,
} from "../dal/category.dal";

type CategoryResult = {
  success: boolean;
  message: string;
  error?: CategoryErrors;
};
function failure(error: unknown): CategoryResult {
  unstable_rethrow(error);
  const cause =
    error instanceof Error && "cause" in error ? error.cause : error;
  const code =
    cause && typeof cause === "object" && "code" in cause
      ? cause.code
      : undefined;
  if (code === "23505")
    return {
      success: false,
      message: "A category with this name or URL already exists.",
      error: { name: ["A category with this name or URL already exists."] },
    };
  if (code === "23503")
    return {
      success: false,
      message:
        "This category has assigned posts. Move or delete all its drafts and published posts first.",
    };
  return {
    success: false,
    message: "Unable to save this category. Please try again.",
  };
}
function invalidate() {
  updateTag("categories");
  updateTag("posts");
}
export async function createCategoryAction(
  data: unknown,
): Promise<CategoryResult> {
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      message: "Please correct the invalid fields.",
      error: parsed.error.flatten().fieldErrors,
    };
  // Authorization lives in the DAL and redirects must not be swallowed here.
  // Read the session before the database error boundary.
  await requireAdminSession();
  try {
    await createCategoryDAL(parsed.data);
    invalidate();
    return { success: true, message: "Category created." };
  } catch (error) {
    return failure(error);
  }
}
export async function updateCategoryAction(
  publicId: string,
  data: unknown,
): Promise<CategoryResult> {
  const id = categoryIdSchema.safeParse(publicId);
  const parsed = categorySchema.safeParse(data);
  if (!id.success) return { success: false, message: "Invalid category." };
  if (!parsed.success)
    return {
      success: false,
      message: "Please correct the invalid fields.",
      error: parsed.error.flatten().fieldErrors,
    };
  await requireAdminSession();
  try {
    const result = await updateCategoryDAL(id.data, parsed.data);
    if (!result)
      return {
        success: false,
        message: "Category not found. It may have been deleted.",
      };
    invalidate();
    return {
      success: true,
      message: "Category updated. Its URL is unchanged.",
    };
  } catch (error) {
    return failure(error);
  }
}
export async function deleteCategoryAction(
  publicId: string,
): Promise<CategoryResult> {
  const id = categoryIdSchema.safeParse(publicId);
  if (!id.success) return { success: false, message: "Invalid category." };
  await requireAdminSession();
  try {
    const result = await deleteCategoryDAL(id.data);
    if (!result)
      return {
        success: false,
        message: "Category not found. It may have been deleted.",
      };
    invalidate();
    return { success: true, message: "Category deleted." };
  } catch (error) {
    return failure(error);
  }
}
