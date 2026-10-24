import { cleanupExpiredRateLimits } from "@/lib/data/security/ratelimit";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");

  if (
    !process.env.CRON_SECRET ||
    authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await cleanupExpiredRateLimits();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
