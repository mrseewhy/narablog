"import server-only";

import { desc, eq, count } from "drizzle-orm";
import { db } from "../index";
import { categoriesTable, type NewCategory } from "../schema";
import { cacheTag, cacheLife } from "next/cache";

export const createCategoryDAL = async (data: NewCategory) => {
  const [category] = await db.insert(categoriesTable).values(data).returning();
  return category;
};

export const getCategoriesDAL = async () => {
  "use cache";
  cacheTag("categories");
  cacheLife("weeks");
  const categories = await db
    .select({
      publicId: categoriesTable.publicId,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      description: categoriesTable.description,
    })
    .from(categoriesTable)
    .orderBy(desc(categoriesTable.createdAt));

  return categories;
};

export const getCategoryDal = async (slug: string) => {
  "use cache";
  cacheTag("categories");
  cacheLife("weeks");
  const [category] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, slug));

  return category;
};

export const countCategoriesDAL = async () => {
  "use cache";
  cacheTag("categories");
  cacheLife("weeks");
  const [result] = await db.select({ total: count() }).from(categoriesTable);

  return result.total;
};
