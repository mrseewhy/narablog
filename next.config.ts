import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.AUTH_E2E_DIST_DIR || ".next",
  typescript: {
    tsconfigPath: process.env.AUTH_E2E_TSCONFIG || "tsconfig.json",
  },
  experimental: {
    agentFeedback: true,
  },
  reactCompiler: true,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
