"use server";

import type { signUpFormSchemaType } from "@/lib/data/validation/signup.validate";
import { signUpFormSchema } from "@/lib/data/validation/signup.validate";
import { auth } from "@/lib/auth";
import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import {
  signInFormSchema,
  type SignInInput,
  type SignInErrors,
} from "@/lib/data/validation/signin.validate";

type SignInResult = {
  success: boolean;
  message: string;
  errors?: SignInErrors;
};

export const signInAction = async (
  data: SignInInput,
): Promise<SignInResult> => {
  const result = signInFormSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: "Please correct the invalid fields.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await auth.api.signInEmail({
      headers: await headers(),
      body: { ...result.data, callbackURL: "/redirect" },
    });
    return { success: true, message: "Signed in successfully." };
  } catch (error) {
    if (isAPIError(error)) {
      if (error.statusCode === 429) {
        return {
          success: false,
          message: "Too many sign-in attempts. Please try again later.",
        };
      }
      if (error.body?.code === "BANNED_USER") {
        return {
          success: false,
          message: "Your account is suspended. Please contact support.",
        };
      }
      if (error.body?.code === "INVALID_EMAIL_OR_PASSWORD") {
        return { success: false, message: "Email or password is incorrect." };
      }
      if (error.statusCode === 503) {
        return {
          success: false,
          message:
            "Sign-in is temporarily unavailable. Please try again later.",
        };
      }
    }
    return { success: false, message: "Unable to sign in. Please try again." };
  }
};

export const signOutAction = async () => {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { success: true, message: "Signed out successfully." };
  } catch {
    return { success: false, message: "Unable to sign out. Please try again." };
  }
};

export const signUpAction = async (data: signUpFormSchemaType) => {
  //validation

  const result = signUpFormSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: "Invalid input!",
      errors: result.error.flatten().fieldErrors,
    };
  }
  try {
    await auth.api.signUpEmail({
      headers: await headers(),
      body: {
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
        callbackURL: "/redirect",
      },
    });
    return {
      success: true,
      message: "Account created.",
    };
  } catch (error) {
    if (isAPIError(error)) {
      if (error.statusCode === 429) {
        return {
          success: false,
          message: "Too many registration attempts. Please try again later.",
        };
      }

      if (
        error.body?.code === "USER_ALREADY_EXISTS" ||
        error.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
      ) {
        return {
          success: false,
          message: "An account with this email already exists. Please sign in.",
          errors: { email: ["This email is already registered."] },
        };
      }

      if (error.statusCode === 503) {
        return {
          success: false,
          message:
            "Registration is temporarily unavailable. Please try again later.",
        };
      }
    }

    return {
      success: false,
      message: "Registration failed",
    };
  }
};
