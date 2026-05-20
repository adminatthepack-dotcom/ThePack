"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isDogSex, isDogStatus } from "@/lib/dogs";
import { filterSubstances } from "@/lib/detection";

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length === 0 ? null : s;
}

export async function updateDog(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = emptyToNull(formData.get("name"));
  if (!name) {
    redirect(`/dogs/${id}/edit?error=` + encodeURIComponent("Name is required."));
  }

  const sexRaw = String(formData.get("sex") ?? "");
  const sex = isDogSex(sexRaw) ? sexRaw : null;
  const statusRaw = String(formData.get("status") ?? "active");
  const status = isDogStatus(statusRaw) ? statusRaw : "active";

  // Detection capabilities — keep only known substance values.
  const detectionCapabilities = filterSubstances(
    formData.getAll("detection_capabilities").map((v) => String(v))
  );

  const { error } = await supabase
    .from("dogs")
    .update({
      name,
      call_name: emptyToNull(formData.get("call_name")),
      breed: emptyToNull(formData.get("breed")),
      sex,
      date_of_birth: emptyToNull(formData.get("date_of_birth")),
      color: emptyToNull(formData.get("color")),
      registration: emptyToNull(formData.get("registration")),
      status,
      bio: emptyToNull(formData.get("bio")),
      detection_capabilities: detectionCapabilities,
    })
    .eq("id", id);

  if (error) {
    redirect(`/dogs/${id}/edit?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/dogs/${id}`);
  revalidatePath(`/profile/${user.id}`);
  redirect(`/dogs/${id}/edit?saved=1`);
}

export async function deleteDog(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("dogs").delete().eq("id", id);
  if (error) {
    redirect(`/dogs/${id}/edit?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/profile/${user.id}`);
  redirect(`/profile/${user.id}`);
}
