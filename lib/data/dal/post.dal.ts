import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { cacheTag, cacheLife } from "next/cache";
import { db } from "../index";
import { postsTable, categoriesTable } from "../schema";
import { user } from "../auth-schema";
import { requireSession, isAdmin } from "../security/session";
import { documentText, postSchema } from "../validation/post.validate";

export async function getPrivatePosts() {
  const current = await requireSession();
  return db
    .select({
      post: {
        id: postsTable.id,
        title: postsTable.title,
        slug: postsTable.slug,
        status: postsTable.status,
      },
      author: user.name,
      category: categoriesTable.name,
    })
    .from(postsTable)
    .innerJoin(user, eq(user.id, postsTable.authorId))
    .innerJoin(
      categoriesTable,
      eq(categoriesTable.publicId, postsTable.categoryId),
    )
    .where(
      isAdmin(current.user.role)
        ? undefined
        : eq(postsTable.authorId, current.user.id),
    )
    .orderBy(desc(postsTable.updatedAt));
}
export async function getEditablePost(id: string) {
  const current = await requireSession();
  if (!postSchema.shape.id.unwrap().safeParse(id).success) return undefined;
  const [post] = await db
    .select()
    .from(postsTable)
    .where(
      and(
        eq(postsTable.id, id),
        ...(isAdmin(current.user.role)
          ? []
          : [eq(postsTable.authorId, current.user.id)]),
      ),
    );
  return post;
}
const publicFields = {
  id: postsTable.id,
  title: postsTable.title,
  slug: postsTable.slug,
  content: postsTable.content,
  categoryId: postsTable.categoryId,
  publishedAt: postsTable.publishedAt,
  createdAt: postsTable.createdAt,
  author: user.name,
  category: categoriesTable.name,
};
function present(post: {
  id: string;
  title: string;
  slug: string;
  content: unknown[];
  categoryId: string;
  publishedAt: Date | null;
  createdAt: Date;
  author: string;
  category: string;
}) {
  const text = documentText(post.content);
  return {
    ...post,
    excerpt: text.slice(0, 200),
    date: (post.publishedAt ?? post.createdAt).toISOString(),
    image: "/demo-post.png",
    likes: 0,
    readTime: Math.max(
      1,
      Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 200),
    ),
  };
}
export async function getPublicPosts(categoryId?: string) {
  "use cache";
  cacheTag("posts", "categories");
  cacheLife("minutes");
  const records = await db
    .select(publicFields)
    .from(postsTable)
    .innerJoin(user, eq(user.id, postsTable.authorId))
    .innerJoin(
      categoriesTable,
      eq(categoriesTable.publicId, postsTable.categoryId),
    )
    .where(
      and(
        eq(postsTable.status, "Published"),
        categoryId ? eq(postsTable.categoryId, categoryId) : undefined,
      ),
    )
    .orderBy(
      desc(sql`coalesce(${postsTable.publishedAt}, ${postsTable.createdAt})`),
    );
  return records.map((record) => {
    const { content: _content, ...summary } = present(record);
    void _content;
    return summary;
  });
}
export async function getPublicPost(slug: string) {
  "use cache";
  cacheTag("posts", "categories");
  cacheLife("minutes");
  const [record] = await db
    .select(publicFields)
    .from(postsTable)
    .innerJoin(user, eq(user.id, postsTable.authorId))
    .innerJoin(
      categoriesTable,
      eq(categoriesTable.publicId, postsTable.categoryId),
    )
    .where(and(eq(postsTable.status, "Published"), eq(postsTable.slug, slug)))
    .limit(1);
  return record ? present(record) : undefined;
}
