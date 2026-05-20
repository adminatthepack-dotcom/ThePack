"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendMessageNotification } from "@/lib/email";

export async function sendMessage(formData: FormData) {
  const recipientId = String(formData.get("recipient_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!recipientId || !body) {
    return;
  }
  if (body.length > 5000) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  if (user.id === recipientId) {
    return;
  }

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    recipient_id: recipientId,
    body,
  });

  if (error) {
    redirect(
      `/messages/${recipientId}?error=${encodeURIComponent(error.message)}`
    );
  }

  // Create a 🔔 notification for the recipient (if they opted in).
  const { data: recipient } = await supabase
    .from("profiles")
    .select("notify_on_messages, full_name, contact_email")
    .eq("id", recipientId)
    .maybeSingle<{
      notify_on_messages: boolean | null;
      full_name: string | null;
      contact_email: string | null;
    }>();

  if (recipient?.notify_on_messages !== false) {
    const { data: sender } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle<{ full_name: string | null }>();

    const senderName = sender?.full_name ?? "Someone";
    const preview =
      body.length > 140 ? body.substring(0, 137).trimEnd() + "…" : body;

    await supabase.rpc("create_notification", {
      p_user_id: recipientId,
      p_type: "message_received",
      p_title: `Message from ${senderName}`,
      p_body: preview,
      p_link: `/messages/${user.id}`,
    });

    if (recipient?.contact_email) {
      await sendMessageNotification({
        to: recipient.contact_email,
        senderName,
        preview,
        senderId: user.id,
      });
    }
  }

  revalidatePath(`/messages/${recipientId}`);
  revalidatePath("/messages");
  redirect(`/messages/${recipientId}`);
}
