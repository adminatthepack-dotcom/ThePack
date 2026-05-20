"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function submitFundApplication(formData: FormData) {
  const contactName = (formData.get("contact_name") as string)?.trim();
  const contactEmail = (formData.get("contact_email") as string)?.trim();
  const contactPhone = (formData.get("contact_phone") as string)?.trim();
  const dogName = (formData.get("dog_name") as string)?.trim();
  const situation = (formData.get("situation") as string)?.trim();
  const amountRequested = (formData.get("amount_requested") as string)?.trim();
  const whatFor = (formData.get("what_for") as string)?.trim();
  const prognosis = (formData.get("prognosis") as string)?.trim();
  const agreedToTerms = formData.get("agreed_to_terms") === "on";

  if (!contactName || !contactEmail || !situation || !whatFor || !prognosis || !agreedToTerms) {
    redirect("/donate/apply?error=missing-fields");
  }

  const supabase = await createClient();

  const { error } = await supabase.from("wdrf_applications").insert({
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone || null,
    dog_name: dogName || null,
    situation,
    amount_requested: amountRequested || null,
    what_for: whatFor,
    prognosis,
  });

  if (error) {
    redirect("/donate/apply?error=submit-failed");
  }

  // Notify admin
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.ADMIN_EMAIL!,
      subject: `New WDRF Application — ${contactName}`,
      html: `
        <h2>New Working Dog Relief Fund Application</h2>
        <p><strong>Contact:</strong> ${contactName} (${contactEmail}${contactPhone ? `, ${contactPhone}` : ""})</p>
        <p><strong>Dog's name:</strong> ${dogName || "Not provided"}</p>
        <p><strong>Amount requested:</strong> ${amountRequested || "Not specified"}</p>
        <h3>Situation</h3><p>${situation.replace(/\n/g, "<br>")}</p>
        <h3>Funds needed for</h3><p>${whatFor.replace(/\n/g, "<br>")}</p>
        <h3>Prognosis / expected outcome</h3><p>${prognosis.replace(/\n/g, "<br>")}</p>
      `,
    });
  } catch {
    // Email failure shouldn't block submission
  }

  redirect("/donate/apply?submitted=1");
}
