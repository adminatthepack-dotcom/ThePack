import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPkceVerifier } from "@/lib/pkce-store";

// Derive the cookie name from the Supabase project URL.
const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname
  .split(".")[0];
const CODE_VERIFIER_COOKIE = `sb-${projectRef}-auth-token-code-verifier`;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const vid = searchParams.get("vid");
  const next = searchParams.get("next") ?? "/reset-password";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("No auth code found.")}`
    );
  }

  // Look up the PKCE code verifier that was stored server-side when the
  // user submitted the forgot-password form. This avoids relying on the
  // browser sending a cookie (which fails when the email client opens the
  // link in a different context than the browser that started the flow).
  const verifierValue = vid ? getPkceVerifier(vid) : null;

  const newCookies: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const requestCookies = request.cookies.getAll();
          if (!verifierValue) return requestCookies;
          // Inject the server-stored verifier so exchangeCodeForSession can
          // find it regardless of whether the browser sent any cookies.
          return [
            ...requestCookies.filter((c) => c.name !== CODE_VERIFIER_COOKIE),
            { name: CODE_VERIFIER_COOKIE, value: verifierValue },
          ];
        },
        setAll(cookiesToSet) {
          newCookies.push(...cookiesToSet);
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  const redirectUrl = error
    ? `${origin}/login?error=${encodeURIComponent(error.message)}`
    : `${origin}${next}`;

  const response = NextResponse.redirect(redirectUrl);

  for (const { name, value, options } of newCookies) {
    response.cookies.set(
      name,
      value,
      options as Parameters<typeof response.cookies.set>[2]
    );
  }

  return response;
}
