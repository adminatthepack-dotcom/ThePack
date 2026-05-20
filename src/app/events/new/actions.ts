"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length === 0 ? null : s;
}

function dtLocalToIso(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  // datetime-local has no timezone; treat as local
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/events/new");

  const title = emptyToNull(formData.get("title"));
  const description = emptyToNull(formData.get("description"));
  const startIso = dtLocalToIso(formData.get("start_at"));

  if (!title || !description || !startIso) {
    redirect(
      "/events/new?error=" +
        encodeURIComponent("Title, description, and start time are required.")
    );
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      organizer_id: user.id,
      title,
      description,
      start_at: startIso,
      end_at: dtLocalToIso(formData.get("end_at")),
      location: emptyToNull(formData.get("location")),
      url: emptyToNull(formData.get("url")),
      image_url: emptyToNull(formData.get("image_url")),
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      "/events/new?error=" +
        encodeURIComponent(error?.message ?? "Failed to post event.")
    );
  }

  revalidatePath("/events");
  redirect(`/events/${data.id}`);
}

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/events");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) {
    redirect(
      `/events/${id}?error=` + encodeURIComponent(error.message)
    );
  }

  revalidatePath("/events");
  redirect("/events");
}
