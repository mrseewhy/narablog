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
  categorySlug: categoriesTable.slug,
};
const publicationTime = sql`coalesce(${postsTable.publishedAt}, ${postsTable.createdAt})`;
const homePageSize = 10;

type PostCursor = { date: string; id: string };

function decodePostCursor(value?: string): PostCursor | null {
  if (!value) return null;
  if (value.length > 256) throw new Error("Invalid post cursor.");
  try {
    const parsed: unknown = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (
      typeof parsed !== "object" || parsed === null ||
      !("date" in parsed) || typeof parsed.date !== "string" ||
      !("id" in parsed) || typeof parsed.id !== "string" ||
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{6}$/.test(parsed.date) ||
      Number.isNaN(Date.parse(`${parsed.date}Z`)) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed.id)
    ) throw new Error("Invalid post cursor.");
    return { date: parsed.date, id: parsed.id };
  } catch {
    throw new Error("Invalid post cursor.");
  }
}

function encodePostCursor(post: { date: string; id: string }) {
  return Buffer.from(JSON.stringify({ date: post.date, id: post.id })).toString("base64url");
}
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
  categorySlug: string;
}) {
  const text = documentText(post.content);
  return {
    ...post,
    excerpt: text.slice(0, 200),
    date: (post.publishedAt ?? post.createdAt).toISOString(),
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

export async function getHomePostsPage(cursor?: string) {
  "use cache";
  cacheTag("posts", "categories");
  cacheLife("minutes");
  const after = decodePostCursor(cursor);
  const rows = await db
    .select({ ...publicFields, sortTime: sql<string>`to_char(${publicationTime}, 'YYYY-MM-DD"T"HH24:MI:SS.US')` })
    .from(postsTable)
    .innerJoin(user, eq(user.id, postsTable.authorId))
    .innerJoin(categoriesTable, eq(categoriesTable.publicId, postsTable.categoryId))
    .where(and(
      eq(postsTable.status, "Published"),
      after ? sql`(${publicationTime}, ${postsTable.id}) < (${after.date}::timestamp, ${after.id}::uuid)` : undefined,
    ))
    .orderBy(desc(publicationTime), desc(postsTable.id))
    .limit(homePageSize + 1);
  const items = rows.slice(0, homePageSize).map((record) => {
    const { sortTime: _sortTime, ...post } = record;
    const { content: _content, ...summary } = present(post);
    void _sortTime;
    void _content;
    return summary;
  });
  const last = rows[Math.min(rows.length, homePageSize) - 1];
  return { items, nextCursor: rows.length > homePageSize && last ? encodePostCursor({ date: last.sortTime, id: last.id }) : null };
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
