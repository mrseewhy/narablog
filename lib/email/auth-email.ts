import { APIError } from "better-auth/api";

export type AuthEmail = {
  to: string;
  kind: "verify-email" | "reset-password" | "change-email";
  url: string;
};

export function assertEmailDeliveryAvailable() {
  const origin = new URL(
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  );
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.VERCEL === "1" ||
    !local
  ) {
    throw new APIError("SERVICE_UNAVAILABLE", {
      message: "Email delivery is not configured. Please try again later.",
    });
  }
}

// Add the Resend implementation here later. Never log tokens on deployed hosts.
export async function sendAuthEmail(email: AuthEmail) {
  assertEmailDeliveryAvailable();
  console.info(
    `[Local auth email: ${email.kind}] To: ${email.to}\n${email.url}`,
  );
}
