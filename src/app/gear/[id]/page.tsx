import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/roles";
import {
  EQUIPMENT_CONDITION_LABELS,
  EQUIPMENT_STATUS_BADGE,
  getEquipmentCategoryLabel,
  type EquipmentCondition,
} from "@/lib/gear";
import type { EquipmentListing, Profile } from "@/types/database";
import { deleteListing, markSold } from "./actions";
import BuyNowButton from "@/components/buy-now-button";
import ListingReviewsSection from "@/components/listing-reviews-section";

export default async function GearDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("equipment_listings")
    .select("*")
    .eq("id", id)
    .maybeSingle<EquipmentListing>();
  if (!item) notFound();

  const { data: seller } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", item.seller_id)
    .maybeSingle<Profile>();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSeller = user?.id === item.seller_id;

  const { data: reviews } = await supabase
    .from("listing_reviews")
    .select("id, listing_id, reviewer_id, rating, title, body, created_at, reviewer:profiles(id, full_name, avatar_url)")
    .eq("listing_id", id)
    .order("created_at", { ascending: false });

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/gear" className="text-sm text-pack-brown hover:text-pack-mask">
        ← Back to equipment
      </Link>

      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-pack-sand/40">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl text-pack-brown/40">
              🎒
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${EQUIPMENT_STATUS_BADGE[item.status]}`}
            >
              {item.status === "sold"
                ? "Sold"
                : item.status === "removed"
                  ? "Removed"
                  : "Available"}
            </span>
            <span className="text-xs text-pack-brown">
              {getEquipmentCategoryLabel(item.category)}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-pack-mask">
            {item.title}
          </h1>
          {/* Pack tags */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.pack_tags?.includes("pack-approved") && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                ✓ Pack Approved
              </span>
            )}
            {item.pack_tags?.includes("custom") && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pack-sand/60 px-2.5 py-0.5 text-xs font-semibold text-pack-brown ring-1 ring-pack-tan/40">
                ✏︎ Customize Your Equipment
              </span>
            )}
          </div>
          {item.price && (
            <div className="mt-3 text-2xl font-bold text-pack-mask">
              {item.price}
            </div>
          )}
          <dl className="mt-4 space-y-1 text-sm text-pack-brown">
            {item.condition && (
              <div>
                <dt className="inline font-medium text-pack-mask">Condition:</dt>{" "}
                <dd className="inline">
                  {EQUIPMENT_CONDITION_LABELS[item.condition as EquipmentCondition] ?? item.condition}
                </dd>
              </div>
            )}
            {item.location && (
              <div>
                <dt className="inline font-medium text-pack-mask">Location:</dt>{" "}
                <dd className="inline">{item.location}</dd>
              </div>
            )}
          </dl>

          {/* CTAs */}
          {item.status === "available" && !isSeller && (
            <div className="mt-4 space-y-2">
              {/* Fixed-price item: show Stripe Buy Now */}
              {item.price_cents && user && (
                <BuyNowButton listingId={item.id} />
              )}
              {/* Custom / no price: show message CTA */}
              {!item.price_cents && user && seller && (
                <Link
                  href={`/messages/${seller.id}`}
                  className="inline-flex rounded-md bg-pack-mask px-5 py-2.5 text-sm font-semibold text-pack-cream hover:bg-pack-brown"
                >
                  Inquire about this item →
                </Link>
              )}
              {/* Logged-out fallback */}
              {!user && (
                <Link
                  href={`/login?redirect=/gear/${item.id}`}
                  className="inline-flex rounded-md border border-pack-tan/40 bg-white px-4 py-2 text-sm hover:bg-pack-sand/40"
                >
                  Log in to purchase or inquire
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Description
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-pack-mask">
          {item.description}
        </p>
      </section>

      {seller && (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Seller
          </h2>
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-pack-tan/40 bg-white p-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-pack-sand">
              {seller.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={seller.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-pack-brown">
                  {(seller.full_name ?? "?").slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/profile/${seller.id}`}
                className="font-medium hover:underline"
              >
                {seller.full_name ?? "Unknown seller"}
              </Link>
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ROLE_BADGE_CLASSES[seller.role]}`}
              >
                {ROLE_LABELS[seller.role]}
              </span>
            </div>
          </div>
        </section>
      )}

      {isSeller && (
        <section className="mt-10 rounded-md border border-pack-tan/40 bg-white p-4">
          <h3 className="text-sm font-semibold">Seller tools</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.status === "available" && (
              <form action={markSold}>
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  className="rounded-md border border-pack-tan/40 bg-white px-3 py-1.5 text-sm hover:bg-pack-sand/40"
                >
                  Mark as sold
                </button>
              </form>
            )}
            <form action={deleteListing}>
              <input type="hidden" name="id" value={item.id} />
              <button
                type="submit"
                className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Delete listing
              </button>
            </form>
          </div>
        </section>
      )}

      <ListingReviewsSection
        listingId={item.id}
        sellerId={item.seller_id}
        currentUserId={user?.id ?? null}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialReviews={(reviews ?? []) as any}
      />
    </article>
  );
}
