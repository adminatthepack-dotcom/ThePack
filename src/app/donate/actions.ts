"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitPledge(formData: FormData) {
  const offer = (formData.get("offer") as string)?.trim();
  const coverage = (formData.get("coverage") as string)?.trim();

  if (!offer || !coverage) redirect("/donate?error=missing-fields");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/donate");

  await supabase.from("vet_pledges").insert({
    vet_id: user.id,
    offer,
    coverage,
  });

  revalidatePath("/donate");
  redirect("/donate?pledged=1");
}
