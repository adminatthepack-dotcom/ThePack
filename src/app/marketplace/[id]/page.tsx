import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/roles";
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_BADGE,
  BID_STATUS_LABELS,
  BID_STATUS_BADGE,
  CATEGORY_BADGE,
  getCategoryLabel,
  getCapabilityLabel,
} from "@/lib/marketplace";
import type { JobPost, Bid, Profile } from "@/types/database";
import { placeBid, updateBidStatus, closeJob } from "./actions";

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("job_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle<JobPost>();
  if (!job) notFound();

  const { data: poster } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", job.poster_id)
    .maybeSingle<Profile>();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isPoster = user?.id === job.poster_id;

  // Bids: poster sees all bids on their job; bidders see only their own.
  // RLS does the filtering server-side — we just query.
  const { data: bids } = await supabase
    .from("bids")
    .select("*")
    .eq("job_id", job.id)
    .order("created_at", { ascending: false })
    .returns<Bid[]>();

  const myBid =
    user && !isPoster ? bids?.find((b) => b.bidder_id === user.id) ?? null : null;

  // Fetch bidder profiles (only relevant for poster view).
  const bidderProfiles = new Map<string, Profile>();
  if (isPoster && bids && bids.length > 0) {
    const ids = Array.from(new Set(bids.map((b) => b.bidder_id)));
    const { data: profs } = await supabase
      .from("profiles")
      .select("*")
      .in("id", ids)
      .returns<Profile[]>();
    for (const p of profs ?? []) bidderProfiles.set(p.id, p);
  }

  const canBid =
    !!user && !isPoster && job.status === "open" && !myBid;

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/marketplace"
        className="text-sm text-pack-brown hover:text-pack-mask"
      >
        ← Back to marketplace
      </Link>

      <header className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${CATEGORY_BADGE[job.category]}`}
            >
              {getCategoryLabel(job.category)}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${JOB_STATUS_BADGE[job.status]}`}
            >
              {JOB_STATUS_LABELS[job.status]}
            </span>
            <span className="text-xs text-pack-brown/70">
              Posted {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-pack-mask">
            {job.title}
          </h1>
        </div>
        {isPoster && job.status === "open" && (
          <form action={closeJob}>
            <input type="hidden" name="job_id" value={job.id} />
            <button
              type="submit"
              className="rounded-md border border-pack-tan/40 bg-white px-3 py-1.5 text-sm hover:bg-pack-sand/40"
            >
              Close job
            </button>
          </form>
        )}
      </header>

      {/* Posted-by card */}
      {poster && (
        <section className="mt-6 flex items-center gap-3 rounded-lg border border-pack-tan/40 bg-white p-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-pack-sand">
            {poster.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-pack-brown">
                {(poster.full_name ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide text-pack-brown/70">
              Posted by
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/profile/${poster.id}`}
                className="font-medium hover:underline"
              >
                {poster.full_name ?? "Unknown"}
              </Link>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ROLE_BADGE_CLASSES[poster.role]}`}
              >
                {ROLE_LABELS[poster.role]}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Details grid */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <DetailField label="Location" value={job.location} />
        <DetailField label="Pay" value={job.pay} />
        <DetailField label="Start date" value={job.start_date} />
        <DetailField label="End date" value={job.end_date} />
        <DetailField label="Duration" value={job.duration} />
      </section>

      {/* Description */}
      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-pack-brown">
          Description
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-pack-mask">
          {job.description}
        </p>
      </section>

      {/* Required licensing */}
      {job.required_licensing && (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-pack-brown">
            Required licensing / credentials
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-pack-mask">
            {job.required_licensing}
          </p>
        </section>
      )}

      {/* Required capabilities */}
      {(job.required_capabilities.length > 0 || job.other_capability) && (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-pack-brown">
            Dog capabilities required
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {job.required_capabilities.map((c) => (
              <span
                key={c}
                className="rounded-full bg-pack-sand/70 px-3 py-1 text-sm font-medium text-pack-brown ring-1 ring-inset ring-pack-tan/40"
              >
                {getCapabilityLabel(c)}
              </span>
            ))}
            {job.other_capability && (
              <span className="rounded-full bg-pack-cream px-3 py-1 text-sm font-medium text-pack-brown ring-1 ring-inset ring-pack-tan/40">
                Other: {job.other_capability}
              </span>
            )}
          </div>
        </section>
      )}

      {/* Banners */}
      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}
      {saved && (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Saved.
        </div>
      )}

      {/* Bid form for eligible bidders */}
      {canBid && (
        <section className="mt-10 rounded-lg border border-pack-tan/40 bg-white p-5">
          <h2 className="text-lg font-semibold text-pack-mask">Place a bid</h2>
          <p className="mt-1 text-sm text-pack-brown">
            Tell the client what you can offer and what you charge.
          </p>
          <form action={placeBid} className="mt-4 space-y-4">
            <input type="hidden" name="job_id" value={job.id} />
            <div>
              <label className="block text-sm font-medium">Your bid amount</label>
              <input
                name="amount"
                type="text"
                placeholder="e.g., $1,200 flat, $80/hr"
                className="mt-1 block w-full rounded-md border border-pack-tan/40 bg-white px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Message <span className="text-red-700">*</span>
              </label>
              <textarea
                name="message"
                rows={4}
                required
                placeholder="Why you're a good fit, what's included, certifications you hold, availability, etc."
                className="mt-1 block w-full rounded-md border border-pack-tan/40 bg-white px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-pack-mask px-4 py-2 text-sm font-semibold text-pack-cream hover:bg-pack-brown"
            >
              Submit bid
            </button>
          </form>
        </section>
      )}

      {/* Bidder's view of their own bid */}
      {myBid && !isPoster && (
        <section className="mt-10 rounded-lg border border-pack-tan/40 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-pack-mask">Your bid</h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${BID_STATUS_BADGE[myBid.status]}`}
            >
              {BID_STATUS_LABELS[myBid.status]}
            </span>
          </div>
          {myBid.amount && (
            <div className="mt-2 text-sm text-pack-brown">
              <span className="font-medium">Amount:</span> {myBid.amount}
            </div>
          )}
          <p className="mt-2 whitespace-pre-wrap text-sm text-pack-mask">
            {myBid.message}
          </p>
          {myBid.status === "pending" && (
            <form action={updateBidStatus} className="mt-3">
              <input type="hidden" name="bid_id" value={myBid.id} />
              <input type="hidden" name="new_status" value="withdrawn" />
              <input type="hidden" name="job_id" value={job.id} />
              <button
                type="submit"
                className="text-xs text-red-700 underline hover:text-red-900"
              >
                Withdraw bid
              </button>
            </form>
          )}
        </section>
      )}

      {/* Poster's view of all bids */}
      {isPoster && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-pack-mask">
            Bids {bids && bids.length > 0 ? `(${bids.length})` : ""}
          </h2>
          {!bids || bids.length === 0 ? (
            <p className="mt-2 text-sm text-pack-brown">No bids yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {bids.map((b) => {
                const bp = bidderProfiles.get(b.bidder_id);
                return (
                  <li
                    key={b.id}
                    className="rounded-lg border border-pack-tan/40 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {bp ? (
                            <Link
                              href={`/profile/${bp.id}`}
                              className="font-medium hover:underline"
                            >
                              {bp.full_name ?? "Bidder"}
                            </Link>
                          ) : (
                            <span className="font-medium">Bidder</span>
                          )}
                          {bp && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ROLE_BADGE_CLASSES[bp.role]}`}
                            >
                              {ROLE_LABELS[bp.role]}
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${BID_STATUS_BADGE[b.status]}`}
                          >
                            {BID_STATUS_LABELS[b.status]}
                          </span>
                        </div>
                        {b.amount && (
                          <div className="mt-1 text-sm text-pack-brown">
                            <span className="font-medium">Amount:</span>{" "}
                            {b.amount}
                          </div>
                        )}
                        <p className="mt-2 whitespace-pre-wrap text-sm text-pack-mask">
                          {b.message}
                        </p>
                      </div>
                    </div>

                    {b.status === "pending" && job.status === "open" && (
                      <div className="mt-3 flex gap-2">
                        <form action={updateBidStatus}>
                          <input type="hidden" name="bid_id" value={b.id} />
                          <input type="hidden" name="job_id" value={job.id} />
                          <input
                            type="hidden"
                            name="new_status"
                            value="accepted"
                          />
                          <button
                            type="submit"
                            className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                          >
                            Accept (awards the job)
                          </button>
                        </form>
                        <form action={updateBidStatus}>
                          <input type="hidden" name="bid_id" value={b.id} />
                          <input type="hidden" name="job_id" value={job.id} />
                          <input
                            type="hidden"
                            name="new_status"
                            value="rejected"
                          />
                          <button
                            type="submit"
                            className="rounded-md border border-pack-tan/40 bg-white px-3 py-1.5 text-xs hover:bg-pack-sand/40"
                          >
                            Reject
                          </button>
                        </form>
                        <Link
                          href={`/messages/${b.bidder_id}`}
                          className="rounded-md border border-pack-tan/40 bg-white px-3 py-1.5 text-xs hover:bg-pack-sand/40"
                        >
                          Message
                        </Link>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Sign-in prompt for visitors */}
      {!user && job.status === "open" && (
        <section className="mt-10 rounded-lg border border-dashed border-pack-tan/40 bg-pack-sand/30 p-5 text-center">
          <p className="text-sm text-pack-brown">
            <Link
              href={`/login?redirect=/marketplace/${job.id}`}
              className="font-medium text-pack-mask underline"
            >
              Log in
            </Link>{" "}
            to place a bid on this job.
          </p>
        </section>
      )}
    </article>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div className="rounded-md border border-pack-tan/40 bg-white p-3">
      <div className="text-xs uppercase tracking-wide text-pack-brown/70">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-pack-mask">{value}</div>
    </div>
  );
}
