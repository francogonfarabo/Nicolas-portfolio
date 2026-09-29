import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/** Leaves draft preview and goes back to the page you were on. */
export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  const target = request.nextUrl.searchParams.get("redirect") ?? "/";
  const safe = target.startsWith("/") && !target.startsWith("//") ? target : "/";
  return NextResponse.redirect(new URL(safe, request.url));
}
