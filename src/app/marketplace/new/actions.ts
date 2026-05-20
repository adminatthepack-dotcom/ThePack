"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  filterJobCapabilities,
  isJobCategory,
} from "@/lib/marketplace";
import { sendJobMatchNotification } from "@/lib/email";

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length === 0 ? null : s;
}

export async function createJob(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/marketplace/new");

  const title = emptyToNull(formData.get("title"));
  const description = emptyToNull(formData.get("description"));
  const categoryRaw = String(formData.get("category") ?? "");

  if (!title) {
    redirect("/marketplace/new?error=" + encodeURIComponent("Title is required."));
  }
  if (!description) {
    redirect(
      "/marketplace/new?error=" + encodeURIComponent("Description is required.")
    );
  }
  if (!isJobCategory(categoryRaw)) {
    redirect(
      "/marketplace/new?error=" + encodeURIComponent("Please pick a category.")
    );
  }

  const caps = filterJobCapabilities(
    formData.getAll("capabilities").map((v) => String(v))
  );
  const otherCapability = emptyToNull(formData.get("other_capability"));

  const { data, error } = await supabase
    .from("job_posts")
    .insert({
      poster_id: user.id,
      title,
      description,
      category: categoryRaw,
      location: emptyToNull(formData.get("location")),
      start_date: emptyToNull(formData.get("start_date")),
      end_date: emptyToNull(formData.get("end_date")),
      duration: emptyToNull(formData.get("duration")),
      pay: emptyToNull(formData.get("pay")),
      required_licensing: emptyToNull(formData.get("required_licensing")),
      required_capabilities: caps,
      other_capability: otherCapability,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      "/marketplace/new?error=" +
        encodeURIComponent(error?.message ?? "Failed to post job.")
    );
  }

  // Notify handlers whose tags overlap with this job's required capabilities,
  // and who opted in to category notifications. Runs via SECURITY DEFINER
  // function (the inserts bypass RLS so we can notify other users).
  if (caps.length > 0) {
    await supabase.rpc("notify_handlers_about_job", {
      p_job_id: data.id,
      p_capabilities: caps,
      p_title: title,
    });

    // Send email to the same matching handlers who have a contact_email.
    const { data: matchingHandlers } = await supabase
      .from("profiles")
      .select("contact_email")
      .eq("notify_on_matching_jobs", true)
      .overlaps("tags", caps)
      .not("contact_email", "is", null)
      .neq("id", user.id)
      .returns<{ contact_email: string }[]>();

    if (matchingHandlers && matchingHandlers.length > 0) {
      const descPreview =
        description.length > 200
          ? description.substring(0, 197).trimEnd() + "…"
          : description;
      await Promise.all(
        matchingHandlers.map((h) =>
          sendJobMatchNotification({
            to: h.contact_email,
            jobTitle: title,
            jobId: data.id,
            descriptionPreview: descPreview,
          })
        )
      );
    }
  }

  revalidatePath("/marketplace");
  redirect(`/marketplace/${data.id}`);
}
