import "server-only";

import { desc, eq, count, and, sql } from "drizzle-orm";
import { db } from "../index";
import { categoriesTable, postsTable } from "../schema";
import { requireAdminSession } from "../security/session";
import {
  categorySchema,
  categoryIdSchema,
  createCategorySlug,
  type CreateCategoryInput,
} from "../validation/category.validate";
import { cacheTag, cacheLife } from "next/cache";

const categoryFields = {
  publicId: categoriesTable.publicId,
  name: categoriesTable.name,
  slug: categoriesTable.slug,
  description: categoriesTable.description,
};

export async function createCategoryDAL(data: CreateCategoryInput) {
  await requireAdminSession();
  const input = categorySchema.parse(data);
  const [category] = await db
    .insert(categoriesTable)
    .values({ ...input, slug: createCategorySlug(input.name) })
    .returning(categoryFields);
  return category;
}

export async function updateCategoryDAL(
  publicId: string,
  data: CreateCategoryInput,
) {
  await requireAdminSession();
  const id = categoryIdSchema.parse(publicId);
  const input = categorySchema.parse(data);
  // The original URL is intentionally retained when the display name changes.
  const [category] = await db
    .update(categoriesTable)
    .set({ ...input, description: input.description || null })
    .where(eq(categoriesTable.publicId, id))
    .returning(categoryFields);
  return category;
}

export async function deleteCategoryDAL(publicId: string) {
  await requireAdminSession();
  const id = categoryIdSchema.parse(publicId);
  // The foreign key rejects deletion if any post (including a draft) uses it,
  // even if a post is assigned concurrently with the delete request.
  const [category] = await db
    .delete(categoriesTable)
    .where(eq(categoriesTable.publicId, id))
    .returning(categoryFields);
  return category;
}

export async function getCategoryForEditDAL(publicId: string) {
  await requireAdminSession();
  const id = categoryIdSchema.parse(publicId);
  const [category] = await db
    .select(categoryFields)
    .from(categoriesTable)
    .where(eq(categoriesTable.publicId, id));
  return category;
}

export async function getCategoryDirectoryDAL() {
  "use cache";
  cacheTag("categories", "posts");
  cacheLife("weeks");
  return db
    .select({ ...categoryFields, publishedCount: count(postsTable.id) })
    .from(categoriesTable)
    .leftJoin(
      postsTable,
      and(
        eq(postsTable.categoryId, categoriesTable.publicId),
        eq(postsTable.status, "Published"),
      ),
    )
    .groupBy(categoriesTable.id)
    .orderBy(desc(categoriesTable.createdAt));
}

export async function getAdminCategoriesDAL() {
  await requireAdminSession();
  return db
    .select({
      ...categoryFields,
      totalCount: count(postsTable.id),
      publishedCount: sql<number>`count(${postsTable.id}) filter (where ${postsTable.status} = 'Published')::int`,
    })
    .from(categoriesTable)
    .leftJoin(postsTable, eq(postsTable.categoryId, categoriesTable.publicId))
    .groupBy(categoriesTable.id)
    .orderBy(desc(categoriesTable.createdAt));
}

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
