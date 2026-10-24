"import server-only";

import { db } from "../index";
import { contactsTable } from "../schema";
import type { NewContact } from "@/lib/data/schema";

export const createContactDAL = async (data: NewContact) => {
  const [contact] = await db.insert(contactsTable).values(data).returning();
  return contact;
};
