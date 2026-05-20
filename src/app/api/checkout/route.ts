import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import type { EquipmentListing } from "@/types/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  const { listingId } = await request.json();
  if (!listingId) {
    return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: item } = await supabase
    .from("equipment_listings")
    .select("*")
    .eq("id", listingId)
    .eq("status", "available")
    .maybeSingle<EquipmentListing>();

  if (!item) {
    return NextResponse.json({ error: "Listing not found or unavailable" }, { status: 404 });
  }
  if (!item.price_cents) {
    return NextResponse.json({ error: "Item does not have a fixed price" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: item.price_cents,
          product_data: {
            name: item.title,
            description: item.description.slice(0, 500) || undefined,
            images: item.image_url ? [item.image_url] : [],
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      listing_id: item.id,
      buyer_id: user.id,
    },
    success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&listing_id=${item.id}`,
    cancel_url: `${SITE_URL}/gear/${item.id}?cancelled=1`,
  });

  return NextResponse.json({ url: session.url });
}
