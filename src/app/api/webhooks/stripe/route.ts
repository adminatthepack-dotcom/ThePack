import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const listingId = session.metadata?.listing_id;

    if (listingId && session.payment_status === "paid") {
      const supabase = createServiceClient();
      await supabase
        .from("equipment_listings")
        .update({ status: "sold" })
        .eq("id", listingId);
    }
  }

  return NextResponse.json({ received: true });
}
