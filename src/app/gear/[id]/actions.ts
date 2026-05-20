"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitListingReview(
  formData: FormData
): Promise<{ error?: string }> {
  const listingId = formData.get("listing_id") as string;
  const rating = Number(formData.get("rating"));
  const title = ((formData.get("title") as string) ?? "").trim();
  const body = ((formData.get("body") as string) ?? "").trim();

  if (!listingId || rating < 1 || rating > 5 || !body) {
    return { error: "Please provide a rating and review text." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to leave a review." };

  const { error } = await supabase.from("listing_reviews").insert({
    listing_id: listingId,
    reviewer_id: user.id,
    rating,
    title: title || null,
    body,
  });

  if (error) {
    if (error.code === "23505") return { error: "You have already reviewed this item." };
    return { error: error.message };
  }

  revalidatePath(`/gear/${listingId}`);
  return {};
}

export async function markSold(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/gear");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("equipment_listings")
    .update({ status: "sold" })
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) {
    redirect(`/gear/${id}?error=` + encodeURIComponent(error.message));
  }
  revalidatePath("/gear");
  revalidatePath(`/gear/${id}`);
  redirect(`/gear/${id}`);
}

export async function deleteListing(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/gear");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Best-effort delete the image too — look up the listing first.
  const { data: listing } = await supabase
    .from("equipment_listings")
    .select("image_url, seller_id")
    .eq("id", id)
    .maybeSingle();

  if (listing && listing.seller_id === user.id && listing.image_url) {
    const url = listing.image_url as string;
    // Public URL pattern: /storage/v1/object/public/equipment-images/<userid>/<file>
    const marker = "/equipment-images/";
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const path = url.substring(idx + marker.length);
      await supabase.storage.from("equipment-images").remove([path]);
    }
  }

  const { error } = await supabase
    .from("equipment_listings")
    .delete()
    .eq("id", id);
  if (error) {
    redirect(`/gear/${id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/gear");
  redirect("/gear");
}
