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

export async function createDog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/dogs/new");
  }

  const name = emptyToNull(formData.get("name"));
  if (!name) {
    redirect("/dogs/new?error=" + encodeURIComponent("Name is required."));
  }

  const sexRaw = String(formData.get("sex") ?? "");
  const sex = isDogSex(sexRaw) ? sexRaw : null;
  const statusRaw = String(formData.get("status") ?? "active");
  const status = isDogStatus(statusRaw) ? statusRaw : "active";

  const detectionCapabilities = filterSubstances(
    formData.getAll("detection_capabilities").map((v) => String(v))
  );

  const { data, error } = await supabase
    .from("dogs")
    .insert({
      owner_id: user.id,
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
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      "/dogs/new?error=" + encodeURIComponent(error?.message ?? "Failed to add dog.")
    );
  }

  revalidatePath("/profile/edit");
  revalidatePath(`/profile/${user.id}`);
  redirect(`/dogs/${data.id}`);
}
