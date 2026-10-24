"use server";

import {
  categorySchema,
  createCategorySlug,
  type CreateCategoryInput,
} from "../validation/category.validate";

import { createCategoryDAL } from "../dal/category.dal";
import { updateTag } from "next/cache";

export const createCategoryAction = async (data: CreateCategoryInput) => {
  //check if user is signed in

  //check if user is admin

  const validated = categorySchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      message: "Please correct the invalid fields.",
      error: validated.error.flatten().fieldErrors,
    };
  }
  const slug = createCategorySlug(validated.data.name);
  const newCategory = { ...validated.data, slug };

  try {
    const result = await createCategoryDAL(newCategory);
    updateTag("categories");
    return {
      success: true,
      message: "Category created successfully",
      data: result,
    };
  } catch (error) {
    console.error(error);

    const dbError =
      error instanceof Error && "cause" in error ? error.cause : error;

    if (
      dbError &&
      typeof dbError === "object" &&
      "code" in dbError &&
      dbError.code === "23505"
    ) {
      return {
        success: false,
        message: "A category with this name or URL already exists.",
        error: {
          name: ["A category with this name or URL already exists."],
        },
      };
    }

    return {
      success: false,
      message: "Failed to create category.",
    };
  }
};
