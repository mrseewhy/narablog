import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "../index";
import { contactsTable } from "../schema";
import { requireAdminSession } from "../security/session";
import type { CreateContactInput } from "../validation/contact.validate";

const contactFields = {
  publicId: contactsTable.publicId,
  name: contactsTable.name,
  email: contactsTable.email,
  subject: contactsTable.subject,
  message: contactsTable.message,
  isRead: contactsTable.isRead,
  createdAt: contactsTable.createdAt,
};

export async function createContactDAL(
  data: Pick<CreateContactInput, "name" | "email" | "subject" | "message">,
) {
  await db.insert(contactsTable).values(data);
}

export async function getAdminContactsDAL() {
  await requireAdminSession();
  return db
    .select(contactFields)
    .from(contactsTable)
    .orderBy(desc(contactsTable.createdAt), desc(contactsTable.id));
}

export async function setContactReadDAL(publicId: string, isRead: boolean) {
  await requireAdminSession();
  const [contact] = await db
    .update(contactsTable)
    .set({ isRead })
    .where(eq(contactsTable.publicId, publicId))
    .returning({ publicId: contactsTable.publicId });
  return contact;
}
