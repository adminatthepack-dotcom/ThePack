"use server";

import { randomUUID } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { setPkceVerifier } from "@/lib/pkce-store";

export async function requestPasswordReset(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Email is required." };

  const cookieStore = await cookies();

  // Generate a unique ID for this reset attempt. We embed it in the
  // redirectTo URL so the callback can look up the PKCE verifier without
  // relying on the browser sending cookies (which breaks when the email
  // client opens the link in a different browser context).
  const vid = randomUUID();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectTo = `${siteUrl}/auth/callback?vid=${vid}`;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            if (name.endsWith("-code-verifier")) {
              // Store the raw encoded cookie value server-side instead of
              // relying on Set-Cookie making it to the browser.
              setPkceVerifier(vid, value);
            }
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) return { error: error.message };
  return { success: true };
}
