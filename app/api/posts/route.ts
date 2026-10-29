import { NextResponse } from "next/server";
import { getHomePostsPage } from "@/lib/data/dal/post.dal";

export async function GET(request: Request) {
  const cursor = new URL(request.url).searchParams.get("cursor") ?? undefined;
  try {
    const page = await getHomePostsPage(cursor);
    return NextResponse.json(page);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid post cursor.") {
      return NextResponse.json({ error: "Invalid cursor." }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to load posts." }, { status: 500 });
  }
}
