// Keep this non-secret configuration importable by the standalone auth CLI.
// Only trust this header when the application is actually running on Vercel.
// Elsewhere, an HTTP client could supply the header itself.
export const ipAddressOptions = {
  ipAddressHeaders:
    process.env.VERCEL === "1" ? ["x-vercel-forwarded-for"] : [],
};
