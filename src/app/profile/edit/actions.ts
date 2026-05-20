"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isRole } from "@/lib/roles";
import { filterTagsForRole } from "@/lib/tags";
import { filterSubstances } from "@/lib/detection";
import { geocode } from "@/lib/geo";

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length === 0 ? null : s;
}

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const roleRaw = formData.get("role");
  if (!isRole(roleRaw)) {
    redirect(
      "/profile/edit?error=" + encodeURIComponent("Invalid role selected.")
    );
  }

  const rawTags = formData.getAll("tags").map((v) => String(v));
  const tags = filterTagsForRole(rawTags, roleRaw);

  const detectionRoles = ["handler", "trainer"] as const;
  const detection_capabilities =
    detectionRoles.includes(roleRaw as (typeof detectionRoles)[number])
      ? filterSubstances(
          formData.getAll("detection_capabilities").map((v) => String(v))
        )
      : [];

  const isCertAgency = roleRaw === "certification_agency";
  const certMeaning = isCertAgency
    ? emptyToNull(formData.get("cert_meaning"))
    : null;
  const certAudience = isCertAgency
    ? emptyToNull(formData.get("cert_audience"))
    : null;
  const certRequirements = isCertAgency
    ? emptyToNull(formData.get("cert_requirements"))
    : null;

  const radiusRaw = parseInt(
    String(formData.get("search_radius_miles") ?? ""),
    10
  );
  const search_radius_miles =
    Number.isFinite(radiusRaw) && radiusRaw >= 10 && radiusRaw <= 500
      ? radiusRaw
      : 120;

  const notify_on_bids = formData.get("notify_on_bids") === "on";
  const notify_on_matching_jobs =
    formData.get("notify_on_matching_jobs") === "on";
  const notify_on_messages = formData.get("notify_on_messages") === "on";

  const newLocation = emptyToNull(formData.get("location"));

  // Look up current state so we can decide whether to re-geocode.
  const { data: current } = await supabase
    .from("profiles")
    .select("location, latitude, longitude")
    .eq("id", user.id)
    .maybeSingle<{
      location: string | null;
      latitude: number | null;
      longitude: number | null;
    }>();

  const update: Record<string, unknown> = {
    role: roleRaw,
    full_name: emptyToNull(formData.get("full_name")),
    location: newLocation,
    bio: emptyToNull(formData.get("bio")),
    contact_email: emptyToNull(formData.get("contact_email")),
    website: emptyToNull(formData.get("website")),
    tags,
    detection_capabilities,
    cert_meaning: certMeaning,
    cert_audience: certAudience,
    cert_requirements: certRequirements,
    search_radius_miles,
    notify_on_bids,
    notify_on_matching_jobs,
    notify_on_messages,
  };

  // Geocoding decision:
  //   - If location was cleared → clear coords too.
  //   - If location changed OR coords were missing → re-geocode now (best effort).
  //   - Otherwise leave coords as-is.
  let geocodingNotice: string | null = null;
  if (!newLocation) {
    update.latitude = null;
    update.longitude = null;
  } else {
    const locationChanged = current?.location !== newLocation;
    const missingCoords =
      current?.latitude === null || current?.longitude === null;
    if (locationChanged || missingCoords) {
      const coords = await geocode(newLocation);
      if (coords) {
        update.latitude = coords.lat;
        update.longitude = coords.lng;
      } else {
        // Couldn't resolve — leave existing coords alone and warn the user
        // (we still save the rest of the profile changes).
        geocodingNotice =
          "Couldn't find map coordinates for that location. Try a more specific address (e.g., 'New Orleans, LA').";
      }
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) {
    redirect("/profile/edit?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/directory");
  revalidatePath(`/profile/${user.id}`);
  if (geocodingNotice) {
    redirect(
      "/profile/edit?saved=1&geo_warning=" +
        encodeURIComponent(geocodingNotice)
    );
  }
  redirect("/profile/edit?saved=1");
}

// Manually re-fetch coordinates from the location text. Useful when the
// auto-geocode on save returns nothing (rate-limited, hard-to-match address).
export async function geocodeMyLocation() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("location")
    .eq("id", user.id)
    .maybeSingle<{ location: string | null }>();

  if (!profile?.location) {
    redirect(
      "/profile/edit?error=" +
        encodeURIComponent(
          "Add your location text and save first, then come back."
        )
    );
  }

  const coords = await geocode(profile.location);
  if (!coords) {
    redirect(
      "/profile/edit?error=" +
        encodeURIComponent(
          "Couldn't find that location on the map. Try a more specific address."
        )
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ latitude: coords.lat, longitude: coords.lng })
    .eq("id", user.id);
  if (error) {
    redirect("/profile/edit?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/profile/edit");
  redirect("/profile/edit?saved=1");
}

export async function requestInstructorTag() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, instructor_status")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "handler" && profile.role !== "employer")) {
    redirect("/profile/edit");
  }
  if (profile.instructor_status) {
    redirect("/profile/edit"); // already requested or approved
  }

  await supabase
    .from("profiles")
    .update({ instructor_status: "pending" })
    .eq("id", user.id);

  // Notify admin
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data: p } = await supabase
      .from("profiles")
      .select("full_name, contact_email")
      .eq("id", user.id)
      .single();
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.ADMIN_EMAIL!,
      subject: `Instructor Tag Request — ${p?.full_name ?? user.email}`,
      html: `<p><strong>${p?.full_name ?? "A user"}</strong> (${p?.contact_email ?? user.email}) has requested the Instructor tag.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/instructors">Review requests →</a></p>`,
    });
  } catch {
    // don't block on email failure
  }

  revalidatePath("/profile/edit");
  redirect("/profile/edit?saved=1");
}

export async function clearMyCoordinates() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({ latitude: null, longitude: null })
    .eq("id", user.id);
  if (error) {
    redirect("/profile/edit?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/profile/edit");
  redirect("/profile/edit?saved=1");
}
