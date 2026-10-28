import { db } from "../index";
import { rateLimitsTable } from "@/lib/data/schema";
import { sql, lt } from "drizzle-orm";
import { headers } from "next/headers";
import { getIP } from "better-auth/api";
import { ipAddressOptions } from "./client-ip";

type RateLimitOptions = {
  identifier: string;
  action: string;
  limit: number;
  windowSeconds: number;
};

export const rateLimit = async (options: RateLimitOptions) => {
  // Keep every comparison and write on the database clock. Mixing Drizzle's
  // UTC timestamp encoding with raw pg Date parameters can reset the first
  // counter incorrectly when the Node process uses a different timezone.
  const now = sql`timezone('UTC', statement_timestamp())`;
  const expiresAt = sql`${now} + (${options.windowSeconds} * interval '1 second')`;

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
      retryAfter: sql<number>`greatest(0, ceil(extract(epoch from (${rateLimitsTable.expiresAt} - ${now}))))::int`,
    });

  return {
    allowed: record.count <= options.limit,
    remaining: Math.max(0, options.limit - record.count),
    retryAfter: record.count > options.limit ? record.retryAfter : 0,
  };
};

const rates = {
  contact: { limit: 3, windowSeconds: 3600 },
  login: { limit: 5, windowSeconds: 900 },
  register: { limit: 3, windowSeconds: 3600 },
  email: { limit: 3, windowSeconds: 3600 },
  password: { limit: 5, windowSeconds: 900 },
} as const;

export const rateLimiter = async (action: keyof typeof rates) => {
  const headersList = await headers();
  const ip = getIP(headersList, {
    advanced: { ipAddress: ipAddressOptions },
  });

  if (!ip) {
    return {
      allowed: false,
      reason: "unavailable" as const,
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
        reason: "rate-limited" as const,
        message: "Too many requests. Please try again later.",
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Rate limiter database error:", error);

    return {
      allowed: false,
      reason: "unavailable" as const,
      message: "Unable to process your request. Please try again later.",
    };
  }
};

export const cleanupExpiredRateLimits = async () => {
  await db
    .delete(rateLimitsTable)
    .where(lt(rateLimitsTable.expiresAt, new Date()));
};
