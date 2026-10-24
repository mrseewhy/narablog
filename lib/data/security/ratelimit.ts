import { db } from "../index";
import { rateLimitsTable } from "@/lib/data/schema";
import { sql, lt } from "drizzle-orm";
import { headers } from "next/headers";

type RateLimitOptions = {
  identifier: string;
  action: string;
  limit: number;
  windowSeconds: number;
};

export const rateLimit = async (options: RateLimitOptions) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + options.windowSeconds * 1000);

  const [record] = await db
    .insert(rateLimitsTable)
    .values({
      identifier: options.identifier,
      action: options.action,
      count: 1,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: [rateLimitsTable.identifier, rateLimitsTable.action],
      set: {
        count: sql<number>`
          CASE
            WHEN ${rateLimitsTable.expiresAt} <= ${now}
            THEN 1
            ELSE ${rateLimitsTable.count} + 1
          END
        `,
        expiresAt: sql<Date>`
          CASE
            WHEN ${rateLimitsTable.expiresAt} <= ${now}
            THEN ${expiresAt}
            ELSE ${rateLimitsTable.expiresAt}
          END
        `,
      },
    })
    .returning({
      count: rateLimitsTable.count,
      expiresAt: rateLimitsTable.expiresAt,
    });

  return {
    allowed: record.count <= options.limit,
    remaining: Math.max(0, options.limit - record.count),
    retryAfter:
      record.count > options.limit
        ? Math.max(
            0,
            Math.ceil((record.expiresAt.getTime() - now.getTime()) / 1000),
          )
        : 0,
  };
};

const rates = {
  contact: { limit: 3, windowSeconds: 3600 },
  login: { limit: 5, windowSeconds: 900 },
  register: { limit: 3, windowSeconds: 3600 },
} as const;

export const rateLimiter = async (action: keyof typeof rates) => {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();

  if (!ip) {
    return {
      allowed: false,
      message: "Unable to process your request. Please try again.",
    };
  }

  try {
    const rateLimitResult = await rateLimit({
      identifier: `ip:${ip}`,
      action,
      ...rates[action],
    });

    if (!rateLimitResult.allowed) {
      return {
        allowed: false,
        message: "Too many requests. Please try again later.",
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Rate limiter database error:", error);

    return {
      allowed: false,
      message: "Unable to process your request. Please try again later.",
    };
  }
};

export const cleanupExpiredRateLimits = async () => {
  await db
    .delete(rateLimitsTable)
    .where(lt(rateLimitsTable.expiresAt, new Date()));
};
