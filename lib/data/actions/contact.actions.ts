"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createContactDAL, setContactReadDAL } from "../dal/contact.dal";
import { rateLimiter } from "../security/ratelimit";
import { requireAdminSession } from "../security/session";
import { contactSchema } from "../validation/contact.validate";

export async function createContactAction(data: unknown) {
  const limit = await rateLimiter("contact");
  if (!limit.allowed)
    return { success: false as const, message: limit.message };

  const result = contactSchema.safeParse(data);
  if (!result.success)
    return {
      success: false as const,
      message: "Please correct the invalid fields.",
      error: result.error.flatten().fieldErrors,
    };

  // A filled honeypot is acknowledged without storing a bot submission.
  if (result.data.contact_extra_reference)
    return { success: true as const, message: "Message received." };

  try {
    const { name, email, subject, message } = result.data;
    await createContactDAL({ name, email, subject, message });
    revalidatePath("/admin/dashboard");
    return { success: true as const, message: "Your message has been saved." };
  } catch {
    return {
      success: false as const,
      message: "Unable to send your message. Please try again.",
    };
  }
}

export async function setContactReadAction(publicId: string, isRead: boolean) {
  await requireAdminSession();
  if (!z.uuid().safeParse(publicId).success || typeof isRead !== "boolean")
    return { success: false as const, message: "Invalid message." };
  try {
    const result = await setContactReadDAL(publicId, isRead);
    if (!result)
      return { success: false as const, message: "Message not found." };
    revalidatePath("/admin/dashboard");
    return {
      success: true as const,
      message: isRead ? "Marked as read." : "Marked as unread.",
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to update the message. Please try again.",
    };
  }
}
