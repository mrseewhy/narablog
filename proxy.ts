import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/roles";

function redirectTo(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function proxy(request: NextRequest) {
  // Cookie presence is only a fast rejection; it never grants access.
  if (!getSessionCookie(request)) return redirectTo(request, "/sign-in");

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true, disableRefresh: true },
    });

    if (!session) return redirectTo(request, "/sign-in");

    const { role, banned, banExpires } = session.user;
    if (banned && (!banExpires || new Date(banExpires).getTime() > Date.now())) {
      return redirectTo(request, "/unauthorized");
    }

    const isAdmin = role?.split(",").some((value) => value.trim() === ROLES.ADMIN);
    const isAdminRoute =
      request.nextUrl.pathname === "/admin" ||
      request.nextUrl.pathname.startsWith("/admin/");

    if (isAdminRoute && !isAdmin) return redirectTo(request, "/dashboard");
    if (!isAdminRoute && isAdmin) return redirectTo(request, "/admin");

    return NextResponse.next();
  } catch {
    // A failed session lookup must never allow protected rendering.
    return new NextResponse("Unable to verify your session. Please try again.", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
