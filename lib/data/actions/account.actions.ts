"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { isAPIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { requireSession, requireAdminSession } from "../security/session";
import { db } from "../index";
import { session as sessions, user as users } from "../auth-schema";
import { and, eq, gt } from "drizzle-orm";
import {
  emailSchema,
  profileSchema,
  resetPasswordSchema,
  changePasswordSchema,
  createUserSchema,
  roleSchema,
} from "../validation/account.validate";
import { assertEmailDeliveryAvailable } from "@/lib/email/auth-email";

function failure(error: unknown) {
  if (isAPIError(error)) {
    if (error.statusCode === 429)
      return {
        success: false,
        message: "Too many attempts. Please try again later.",
      };
    if (error.statusCode === 503)
      return {
        success: false,
        message: "Email or account services are temporarily unavailable.",
      };
    if (["INVALID_TOKEN", "TOKEN_EXPIRED"].includes(error.body?.code ?? ""))
      return {
        success: false,
        message: "This link is invalid or expired. Request a new one.",
      };
    if (error.body?.code === "INVALID_PASSWORD")
      return { success: false, message: "Your current password is incorrect." };
    if (error.statusCode >= 400 && error.statusCode < 500)
      return {
        success: false,
        message:
          "The request could not be completed. Check your details or request a new link.",
      };
  }
  return {
    success: false,
    message: "Unable to complete this request. Please try again.",
  };
}

export async function requestResetAction(data: unknown) {
  const parsed = emailSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, message: "Enter a valid email address." };
  try {
    await auth.api.requestPasswordReset({
      headers: await headers(),
      body: { ...parsed.data, redirectTo: "/reset-password" },
    });
    return {
      success: true,
      message: "If an account exists, a password reset link has been sent.",
    };
  } catch (error) {
    return failure(error);
  }
}

export async function resendVerificationAction(data: unknown) {
  const parsed = emailSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, message: "Enter a valid email address." };
  try {
    await auth.api.sendVerificationEmail({
      headers: await headers(),
      body: { ...parsed.data, callbackURL: "/sign-in?verified=1" },
    });
    return {
      success: true,
      message:
        "If this account needs verification, a verification link has been sent.",
    };
  } catch (error) {
    return failure(error);
  }
}

export async function resetPasswordAction(data: unknown) {
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Check your password.",
    };
  try {
    await auth.api.resetPassword({
      headers: await headers(),
      body: { token: parsed.data.token, newPassword: parsed.data.newPassword },
    });
    return {
      success: true,
      message: "Password updated. Sign in with your new password.",
    };
  } catch (error) {
    return failure(error);
  }
}

export async function updateProfileAction(data: unknown) {
  await requireSession();
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Check your profile.",
    };
  try {
    await auth.api.updateUser({ headers: await headers(), body: parsed.data });
    revalidatePath("/", "layout");
    return { success: true, message: "Profile updated." };
  } catch (error) {
    return failure(error);
  }
}

export async function changeEmailAction(data: unknown) {
  await requireSession();
  const parsed = emailSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, message: "Enter a valid email address." };
  try {
    await auth.api.changeEmail({
      headers: await headers(),
      body: { newEmail: parsed.data.email, callbackURL: "/redirect" },
    });
    return {
      success: true,
      message:
        "Check your current email to approve this change, then verify the new address.",
    };
  } catch (error) {
    return failure(error);
  }
}

export async function changePasswordAction(data: unknown) {
  await requireSession();
  const parsed = changePasswordSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Check your password.",
    };
  try {
    const body = {
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
      revokeOtherSessions: parsed.data.revokeOtherSessions,
    };
    await auth.api.changePassword({ headers: await headers(), body });
    revalidatePath("/", "layout");
    return { success: true, message: "Password changed." };
  } catch (error) {
    return failure(error);
  }
}

// Only IDs are exposed to the client. Session bearer tokens stay on the server.
export async function revokeSessionAction(id: string, admin = false) {
  const current = admin ? await requireAdminSession() : await requireSession();
  const [record] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, id),
        ...(admin ? [] : [eq(sessions.userId, current.user.id)]),
      ),
    );
  if (!record) return { success: false, message: "Session not found." };
  try {
    if (admin)
      await auth.api.revokeUserSession({
        headers: await headers(),
        body: { sessionToken: record.token },
      });
    else
      await auth.api.revokeSession({
        headers: await headers(),
        body: { token: record.token },
      });
    revalidatePath("/", "layout");
    return {
      success: true,
      message: "Session revoked.",
      current: record.id === current.session.id,
    };
  } catch (error) {
    return { ...failure(error), current: false };
  }
}

export async function revokeOtherSessionsAction() {
  await requireSession();
  try {
    await auth.api.revokeOtherSessions({ headers: await headers() });
    revalidatePath("/", "layout");
    return { success: true, message: "Other sessions revoked." };
  } catch (error) {
    return failure(error);
  }
}

export async function createUserAction(data: unknown) {
  await requireAdminSession();
  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid user details.",
    };
  try {
    assertEmailDeliveryAvailable();
    await auth.api.createUser({ headers: await headers(), body: parsed.data });
    // The admin is already authorized above. Sending for the newly-created
    // account must not use the admin's session (Better Auth enforces an
    // email match when this endpoint receives an authenticated session).
    await auth.api.sendVerificationEmail({
      body: { email: parsed.data.email, callbackURL: "/sign-in?verified=1" },
    });
    revalidatePath("/admin/users");
    return { success: true, message: "User created. Verification link sent." };
  } catch (error) {
    return failure(error);
  }
}

export async function manageUserAction(
  id: string,
  operation: "role" | "ban" | "unban" | "revoke",
  value?: string,
) {
  const current = await requireAdminSession();
  if (id === current.user.id && (operation === "ban" || operation === "role"))
    return {
      success: false,
      message: "You cannot suspend or change your own role.",
    };
  try {
    const requestHeaders = await headers();
    if (operation === "role") {
      const role = roleSchema.safeParse(value);
      if (!role.success) return { success: false, message: "Invalid role." };
      await auth.api.setRole({
        headers: requestHeaders,
        body: { userId: id, role: role.data },
      });
      await auth.api.revokeUserSessions({
        headers: requestHeaders,
        body: { userId: id },
      });
    } else if (operation === "ban") {
      await auth.api.banUser({
        headers: requestHeaders,
        body: {
          userId: id,
          banReason: value?.slice(0, 500) || "Suspended by an administrator",
        },
      });
    } else if (operation === "unban") {
      await auth.api.unbanUser({
        headers: requestHeaders,
        body: { userId: id },
      });
    } else if (operation === "revoke") {
      await auth.api.revokeUserSessions({
        headers: requestHeaders,
        body: { userId: id },
      });
    } else return { success: false, message: "Invalid operation." };
    revalidatePath("/admin", "layout");
    return { success: true, message: "User updated." };
  } catch (error) {
    return failure(error);
  }
}

export async function listAccountSessions(admin = false) {
  const current = admin ? await requireAdminSession() : await requireSession();
  return db
    .select({
      id: sessions.id,
      name: users.name,
      email: users.email,
      ipAddress: sessions.ipAddress,
      userAgent: sessions.userAgent,
      expiresAt: sessions.expiresAt,
      updatedAt: sessions.updatedAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        gt(sessions.expiresAt, new Date()),
        ...(admin ? [] : [eq(sessions.userId, current.user.id)]),
      ),
    );
}
