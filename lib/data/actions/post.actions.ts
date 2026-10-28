"use server";
import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { updateTag, revalidatePath } from "next/cache";
import slugify from "slugify";
import { db } from "../index";
import { postsTable } from "../schema";
import { user } from "../auth-schema";
import { requireSession, isAdmin } from "../security/session";
import { postSchema } from "../validation/post.validate";

export async function savePostAction(data: unknown) {
  const current = await requireSession();
  const result = postSchema.safeParse(data);
  if (!result.success)
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid post.",
    };
  const { id, ...input } = result.data;
  const admin = isAdmin(current.user.role);
  try {
    const [existing] = id
      ? await db
          .select({ authorId: postsTable.authorId })
          .from(postsTable)
          .where(
            and(
              eq(postsTable.id, id),
              ...(admin ? [] : [eq(postsTable.authorId, current.user.id)]),
            ),
          )
      : [];
    if (id && !existing)
      return { success: false, message: "Post not found or access denied." };
    const authorId = admin
      ? input.authorId || existing?.authorId || current.user.id
      : current.user.id;
    const [author] = await db
      .select({
        id: user.id,
        banned: user.banned,
        verified: user.emailVerified,
      })
      .from(user)
      .where(eq(user.id, authorId));
    if (!author || author.banned || !author.verified)
      return { success: false, message: "Select an active, verified author." };
    const values = {
      title: input.title,
      categoryId: input.categoryId,
      content: input.content,
      status: input.status,
      authorId,
    };
    if (id) {
      const [updated] = await db
        .update(postsTable)
        .set({
          ...values,
          publishedAt:
            input.status === "Published"
              ? sql`coalesce(${postsTable.publishedAt}, timezone('UTC', statement_timestamp()))`
              : undefined,
        })
        .where(
          and(
            eq(postsTable.id, id),
            ...(admin ? [] : [eq(postsTable.authorId, current.user.id)]),
          ),
        )
        .returning({ id: postsTable.id });
      if (!updated)
        return { success: false, message: "Post not found or access denied." };
    } else {
      const newId = randomUUID();
      await db.insert(postsTable).values({
        ...values,
        publishedAt:
          input.status === "Published"
            ? sql`timezone('UTC', statement_timestamp())`
            : null,
        id: newId,
        slug: `${slugify(input.title, { lower: true, strict: true }).slice(0, 180) || "post"}-${newId}`,
      });
    }
    updateTag("posts");
    revalidatePath("/dashboard/posts");
    revalidatePath("/admin/posts");
    return {
      success: true,
      message:
        input.status === "Published" ? "Post published." : "Draft saved.",
    };
  } catch {
    return {
      success: false,
      message: "Unable to save post. Check the category and try again.",
    };
  }
}
export async function deletePostAction(id: string) {
  const current = await requireSession();
  const parsed = postSchema.shape.id.unwrap().safeParse(id);
  if (!parsed.success) return { success: false, message: "Invalid post." };
  try {
    const [deleted] = await db
      .delete(postsTable)
      .where(
        and(
          eq(postsTable.id, id),
          ...(isAdmin(current.user.role)
            ? []
            : [eq(postsTable.authorId, current.user.id)]),
        ),
      )
      .returning({ id: postsTable.id });
    if (!deleted)
      return { success: false, message: "Post not found or access denied." };
    updateTag("posts");
    revalidatePath("/dashboard/posts");
    revalidatePath("/admin/posts");
    return { success: true, message: "Post deleted." };
  } catch {
    return { success: false, message: "Unable to delete post." };
  }
}
