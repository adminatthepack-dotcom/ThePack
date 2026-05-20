"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  if (!data.user) {
    redirect(
      "/signup?error=" +
        encodeURIComponent(
          "Account created — please check your email to confirm, then log in."
        )
    );
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    role: "customer",
    full_name: fullName || null,
    contact_email: email,
    approval_status: "approved",
  });

  if (profileError) {
    redirect("/signup?error=" + encodeURIComponent(profileError.message));
  }

  redirect("/profile/edit");
}
