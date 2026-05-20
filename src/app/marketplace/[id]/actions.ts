"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isBidStatus } from "@/lib/marketplace";
import {
  sendBidReceivedNotification,
  sendBidAcceptedNotification,
} from "@/lib/email";

export async function placeBid(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const jobId = String(formData.get("job_id") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  const amount = String(formData.get("amount") ?? "").trim() || null;

  if (!jobId) redirect("/marketplace");
  if (!message) {
    redirect(
      `/marketplace/${jobId}?error=` + encodeURIComponent("Message is required.")
    );
  }

  const { error } = await supabase.from("bids").insert({
    job_id: jobId,
    bidder_id: user.id,
    amount,
    message,
  });

  if (error) {
    redirect(`/marketplace/${jobId}?error=` + encodeURIComponent(error.message));
  }

  // Notify the job poster (if they opted in) that a bid came in.
  const { data: job } = await supabase
    .from("job_posts")
    .select("poster_id, title")
    .eq("id", jobId)
    .maybeSingle<{ poster_id: string; title: string }>();
  if (job && job.poster_id !== user.id) {
    const { data: poster } = await supabase
      .from("profiles")
      .select("notify_on_bids, contact_email, full_name")
      .eq("id", job.poster_id)
      .maybeSingle<{
        notify_on_bids: boolean;
        contact_email: string | null;
        full_name: string | null;
      }>();
    if (poster?.notify_on_bids !== false) {
      await supabase.rpc("create_notification", {
        p_user_id: job.poster_id,
        p_type: "bid_received",
        p_title: "New bid received",
        p_body: `Someone placed a bid on "${job.title}".`,
        p_link: `/marketplace/${jobId}`,
      });

      if (poster?.contact_email) {
        const { data: bidder } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle<{ full_name: string | null }>();
        const preview =
          message.length > 200
            ? message.substring(0, 197).trimEnd() + "…"
            : message;
        await sendBidReceivedNotification({
          to: poster.contact_email,
          bidderName: bidder?.full_name ?? "Someone",
          jobTitle: job.title,
          jobId,
          amount,
          messagePreview: preview,
        });
      }
    }
  }

  revalidatePath(`/marketplace/${jobId}`);
  redirect(`/marketplace/${jobId}?saved=1`);
}

export async function updateBidStatus(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const bidId = String(formData.get("bid_id") ?? "");
  const jobId = String(formData.get("job_id") ?? "");
  const newStatus = String(formData.get("new_status") ?? "");

  if (!bidId || !jobId || !isBidStatus(newStatus)) {
    redirect(`/marketplace/${jobId || ""}`);
  }

  // Update the bid's status. RLS controls who's allowed to do what:
  // - bidders may update their own bids (only sensible action: withdraw)
  // - posters may update bids on their own jobs (accept/reject)
  const { error } = await supabase
    .from("bids")
    .update({ status: newStatus })
    .eq("id", bidId);

  if (error) {
    redirect(`/marketplace/${jobId}?error=` + encodeURIComponent(error.message));
  }

  // If a bid is accepted, mark the job as awarded and reject other pending bids.
  if (newStatus === "accepted") {
    await supabase
      .from("job_posts")
      .update({ status: "awarded" })
      .eq("id", jobId)
      .eq("poster_id", user.id);

    await supabase
      .from("bids")
      .update({ status: "rejected" })
      .eq("job_id", jobId)
      .eq("status", "pending")
      .neq("id", bidId);

    // Notify the winning bidder.
    const { data: bid } = await supabase
      .from("bids")
      .select("bidder_id")
      .eq("id", bidId)
      .maybeSingle<{ bidder_id: string }>();
    if (bid) {
      await supabase.rpc("create_notification", {
        p_user_id: bid.bidder_id,
        p_type: "bid_accepted",
        p_title: "Your bid was accepted!",
        p_body: "The job has been awarded to you. Coordinate next steps with the poster.",
        p_link: `/marketplace/${jobId}`,
      });

      const { data: winningJob } = await supabase
        .from("job_posts")
        .select("title")
        .eq("id", jobId)
        .maybeSingle<{ title: string }>();
      const { data: bidderProfile } = await supabase
        .from("profiles")
        .select("contact_email")
        .eq("id", bid.bidder_id)
        .maybeSingle<{ contact_email: string | null }>();
      if (bidderProfile?.contact_email && winningJob) {
        await sendBidAcceptedNotification({
          to: bidderProfile.contact_email,
          jobTitle: winningJob.title,
          jobId,
        });
      }
    }
  }

  revalidatePath(`/marketplace/${jobId}`);
  revalidatePath("/marketplace");
  redirect(`/marketplace/${jobId}?saved=1`);
}

export async function closeJob(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const jobId = String(formData.get("job_id") ?? "");
  if (!jobId) redirect("/marketplace");

  const { error } = await supabase
    .from("job_posts")
    .update({ status: "closed" })
    .eq("id", jobId)
    .eq("poster_id", user.id);

  if (error) {
    redirect(`/marketplace/${jobId}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/marketplace/${jobId}`);
  revalidatePath("/marketplace");
  redirect(`/marketplace/${jobId}?saved=1`);
}
