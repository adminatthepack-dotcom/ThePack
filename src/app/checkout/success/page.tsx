import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ listing_id?: string }>;
}) {
  const { listing_id } = await searchParams;

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="text-5xl">🎉</div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-pack-mask">
        Order confirmed!
      </h1>
      <p className="mt-3 text-pack-brown">
        Your payment was successful. The seller has been notified and will be in
        touch shortly to arrange shipping or pickup.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {listing_id && (
          <Link
            href={`/gear/${listing_id}`}
            className="rounded-md border border-pack-tan/40 bg-white px-5 py-2.5 text-sm font-medium text-pack-mask hover:bg-pack-sand/40"
          >
            View listing
          </Link>
        )}
        <Link
          href="/gear"
          className="rounded-md bg-pack-mask px-5 py-2.5 text-sm font-semibold text-pack-cream hover:bg-pack-brown"
        >
          Browse more equipment
        </Link>
      </div>
    </div>
  );
}
