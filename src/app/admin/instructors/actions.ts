"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function verifyAdmin() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await authClient.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!p?.is_admin) redirect("/");
}

export async function approveInstructor(profileId: string) {
  await verifyAdmin();
  const supabase = createServiceClient();

  // Set status + add "instructor" to tags array
  const { data: profile } = await supabase
    .from("profiles")
    .select("tags")
    .eq("id", profileId)
    .single();

  const currentTags: string[] = profile?.tags ?? [];
  const updatedTags = currentTags.includes("instructor")
    ? currentTags
    : [...currentTags, "instructor"];

  await supabase
    .from("profiles")
    .update({ instructor_status: "approved", tags: updatedTags })
    .eq("id", profileId);

  revalidatePath("/admin/instructors");
  redirect("/admin/instructors");
}

export async function denyInstructor(profileId: string) {
  await verifyAdmin();
  const supabase = createServiceClient();

  await supabase
    .from("profiles")
    .update({ instructor_status: null })
    .eq("id", profileId);

  revalidatePath("/admin/instructors");
  redirect("/admin/instructors");
}
