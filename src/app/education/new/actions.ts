"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length === 0 ? null : s;
}

export async function createArticle(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/education/new");

  const title = emptyToNull(formData.get("title"));
  const body = emptyToNull(formData.get("body"));
  if (!title || !body) {
    redirect(
      "/education/new?error=" +
        encodeURIComponent("Title and body are required.")
    );
  }

  const { data, error } = await supabase
    .from("articles")
    .insert({
      author_id: user.id,
      title,
      body,
      summary: emptyToNull(formData.get("summary")),
      image_url: emptyToNull(formData.get("image_url")),
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      "/education/new?error=" +
        encodeURIComponent(error?.message ?? "Failed to publish.")
    );
  }

  revalidatePath("/education");
  redirect(`/education/${data.id}`);
}

export async function deleteArticle(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/education");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) {
    redirect(`/education/${id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/education");
  redirect("/education");
}
