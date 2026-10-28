export function authEnvironment() {
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const secret = process.env.BETTER_AUTH_SECRET;
  const production = process.env.NODE_ENV === "production";
  // Validate deployment configuration when auth handles a request, not when
  // Next.js merely imports the config while building or the CLI reads it.
  const validate = () => {
    if (production && (!secret || secret.length < 32)) {
      throw new Error(
        "BETTER_AUTH_SECRET must contain at least 32 characters in production",
      );
    }
    if (
      production &&
      (!process.env.BETTER_AUTH_URL || new URL(baseURL).protocol !== "https:")
    ) {
      throw new Error(
        "BETTER_AUTH_URL must be an explicit HTTPS URL in production",
      );
    }
  };
  return { baseURL, secret, validate };
}
