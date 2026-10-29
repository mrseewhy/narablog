import { betterAuth } from "better-auth";
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./data/index"; // your drizzle instance
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import * as schema from "@/lib/data/schema";
import * as authSchema from "@/lib/data/auth-schema";
import { signUpFormSchema } from "@/lib/data/validation/signup.validate";
import { rateLimiter } from "@/lib/data/security/ratelimit";
import { ipAddressOptions } from "@/lib/data/security/client-ip";
import { ROLES } from "@/lib/roles";
import { signInFormSchema } from "@/lib/data/validation/signin.validate";

import {
  profileSchema,
  newPasswordSchema,
  roleSchema,
  accountWriteSchema,
} from "@/lib/data/validation/account.validate";
import {
  assertEmailDeliveryAvailable,
  sendAuthEmail,
} from "@/lib/email/auth-email";
import { authEnvironment } from "@/lib/auth-environment";

const environment = authEnvironment();

function validateAccountFields(data: unknown) {
  const result = accountWriteSchema.safeParse(data);
  if (!result.success) {
    throw new APIError("BAD_REQUEST", {
      message: result.error.issues[0]?.message ?? "Invalid account details.",
    });
  }
  return result.data;
}

export const auth = betterAuth({
  baseURL: environment.baseURL,
  secret: environment.secret,
  trustedOrigins: [new URL(environment.baseURL).origin],
  user: {
    additionalFields: {
      username: { type: "string", required: false, defaultValue: "" },
      bio: { type: "string", required: false, defaultValue: "" },
      website: { type: "string", required: false, defaultValue: "" },
      location: { type: "string", required: false, defaultValue: "" },
    },
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: false,
      sendChangeEmailConfirmation: async ({ user, url }) => {
        await sendAuthEmail({ to: user.email, kind: "change-email", url });
      },
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    sendOnSignIn: false,
    autoSignInAfterVerification: false,
    expiresIn: 3600,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({ to: user.email, kind: "verify-email", url });
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: {
      ...schema,
      ...authSchema,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 70,
    resetPasswordTokenExpiresIn: 1800,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({ to: user.email, kind: "reset-password", url });
    },
  },
  // Apply profile and role rules to every user write, including extra signup
  // fields and the admin API, rather than only the profile form endpoint.
  databaseHooks: {
    user: {
      create: {
        before: async (data) => ({
          data: { ...data, ...validateAccountFields(data) },
        }),
      },
      update: {
        before: async (data) => ({
          data: { ...data, ...validateAccountFields(data) },
        }),
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      environment.validate();
      const emailPaths = [
        "/request-password-reset",
        "/send-verification-email",
        "/change-email",
      ];
      if (emailPaths.includes(ctx.path)) assertEmailDeliveryAvailable();

      if (
        ctx.path.startsWith("/admin/") ||
        ["/update-user", "/change-password", "/change-email"].includes(ctx.path)
      ) {
        const current = await getSessionFromCtx(ctx, {
          disableCookieCache: true,
          disableRefresh: true,
        });
        if (!current)
          throw new APIError("UNAUTHORIZED", {
            message: "Sign in to continue.",
          });
        if (
          current.user.banned &&
          (!current.user.banExpires ||
            new Date(current.user.banExpires).getTime() > Date.now())
        ) {
          throw new APIError("FORBIDDEN", {
            message: "This account is suspended.",
          });
        }
      }
      const emailAction = [
        "/request-password-reset",
        "/send-verification-email",
        "/change-email",
      ].includes(ctx.path);
      const passwordAction = ["/reset-password", "/change-password"].includes(
        ctx.path,
      );
      if (emailAction || passwordAction) {
        const limit = await rateLimiter(emailAction ? "email" : "password");
        if (!limit.allowed)
          throw new APIError(
            limit.reason === "rate-limited"
              ? "TOO_MANY_REQUESTS"
              : "SERVICE_UNAVAILABLE",
            { message: limit.message },
          );
      }
      if (passwordAction || ctx.path === "/admin/set-user-password") {
        const result = newPasswordSchema.safeParse(ctx.body?.newPassword);
        if (!result.success)
          throw new APIError("BAD_REQUEST", {
            message: result.error.issues[0]?.message,
          });
      }
      if (ctx.path === "/update-user") {
        // Validate only supplied profile fields; role/email are never accepted here.
        const result = profileSchema.partial().safeParse(ctx.body);
        if (!result.success)
          throw new APIError("BAD_REQUEST", {
            message: result.error.issues[0]?.message,
          });
        return { context: { body: result.data } };
      }
      if (ctx.path === "/admin/set-role" || ctx.path === "/admin/create-user") {
        if (!roleSchema.safeParse(ctx.body?.role).success)
          throw new APIError("BAD_REQUEST", {
            message: "Choose a valid role.",
          });
        if (ctx.path === "/admin/create-user") {
          const result = signUpFormSchema.safeParse(ctx.body);
          if (!result.success)
            throw new APIError("BAD_REQUEST", {
              message: result.error.issues[0]?.message,
            });
        }
      }
      if (
        [
          "/admin/set-role",
          "/admin/ban-user",
          "/admin/remove-user",
          "/admin/update-user",
        ].includes(ctx.path)
      ) {
        const current = await getSessionFromCtx(ctx, {
          disableCookieCache: true,
        });
        if (current && ctx.body?.userId === current.user.id) {
          const requestedRole = ctx.body?.role ?? ctx.body?.data?.role;
          if (
            ctx.path === "/admin/ban-user" ||
            ctx.path === "/admin/remove-user" ||
            (requestedRole !== undefined && requestedRole !== ROLES.ADMIN)
          ) {
            throw new APIError("FORBIDDEN", {
              message: "You cannot remove your own administrator access.",
            });
          }
        }
      }
      const isSignUp = ctx.path === "/sign-up/email";
      const isSignIn = ctx.path === "/sign-in/email";
      if (!isSignUp && !isSignIn) return;

      const limit = await rateLimiter(isSignUp ? "register" : "login");
      if (!limit.allowed) {
        throw new APIError(
          limit.reason === "rate-limited"
            ? "TOO_MANY_REQUESTS"
            : "SERVICE_UNAVAILABLE",
          {
            message:
              limit.message ?? "Authentication is temporarily unavailable.",
          },
        );
      }

      const result = isSignUp
        ? signUpFormSchema.safeParse(ctx.body)
        : signInFormSchema.safeParse(ctx.body);
      if (!result.success) {
        throw new APIError("BAD_REQUEST", {
          message: result.error.issues[0]?.message ?? "Invalid input.",
        });
      }

      return {
        context: {
          body: {
            ...ctx.body,
            ...result.data,
          },
        },
      };
    }),
  },
  advanced: {
    ipAddress: ipAddressOptions,
    database: {
      joins: true,
    },
  },
  plugins: [
    admin({ defaultRole: ROLES.USER, adminRoles: [ROLES.ADMIN] }),
    nextCookies(),
  ],
});
