import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

// Paths that are always accessible regardless of approval status.
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/apply",
  "/pending",
  "/rejected",
  "/forgot-password",
  "/reset-password",
  "/auth",
  "/find",
  "/directory",
  "/about",
  "/donate",
  "/terms",
  "/faq",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  if (code && pathname === "/") {
    const callbackUrl = new URL("/auth/callback", request.url);
    callbackUrl.searchParams.set("code", code);
    return NextResponse.redirect(callbackUrl);
  }

  const sessionResponse = await updateSession(request);

  // Skip approval check for public paths and admin paths.
  if (isPublicPath(pathname) || pathname.startsWith("/admin")) {
    return sessionResponse;
  }

  // Check the user's approval status for protected paths.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return sessionResponse;

  const { data: profile } = await supabase
    .from("profiles")
    .select("approval_status")
    .eq("id", user.id)
    .single();

  if (!profile) return sessionResponse;

  if (profile.approval_status === "pending") {
    return NextResponse.redirect(new URL("/pending", request.url));
  }
  if (profile.approval_status === "rejected") {
    return NextResponse.redirect(new URL("/rejected", request.url));
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    // Run on everything except static assets and image optimization files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
