"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitListingReview } from "@/app/gear/[id]/actions";

type ListingReview = {
  id: string;
  listing_id: string;
  reviewer_id: string;
  rating: number;
  title: string | null;
  body: string;
  created_at: string;
  reviewer: { id: string; full_name: string | null; avatar_url: string | null } | null;
};

function Stars({ rating, interactive, onSelect }: {
  rating: number;
  interactive?: boolean;
  onSelect?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type={interactive ? "button" : undefined}
          onClick={interactive ? () => onSelect?.(n) : undefined}
          onMouseEnter={interactive ? () => setHovered(n) : undefined}
          onMouseLeave={interactive ? () => setHovered(0) : undefined}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          tabIndex={interactive ? 0 : -1}
          aria-label={interactive ? `${n} star${n !== 1 ? "s" : ""}` : undefined}
        >
          <span className={`text-lg leading-none ${
            n <= (hovered || rating) ? "text-amber-400" : "text-neutral-200"
          }`}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export default function ListingReviewsSection({
  listingId,
  sellerId,
  currentUserId,
  initialReviews,
}: {
  listingId: string;
  sellerId: string;
  currentUserId: string | null;
  initialReviews: ListingReview[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isSeller = currentUserId === sellerId;
  const myReview = currentUserId
    ? reviews.find((r) => r.reviewer_id === currentUserId)
    : undefined;
  const canReview = !!currentUserId && !isSeller && !myReview;

  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) { setError("Select a star rating."); return; }
    if (!body.trim()) { setError("Write something in the review."); return; }
    setError(null);

    const fd = new FormData();
    fd.append("listing_id", listingId);
    fd.append("rating", String(rating));
    fd.append("title", title);
    fd.append("body", body);

    startTransition(async () => {
      const result = await submitListingReview(fd);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setRating(0);
        setTitle("");
        setBody("");
        // Optimistically add a placeholder — page will revalidate on next load
      }
    });
  }

  return (
    <section className="mt-10">
      <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
        Reviews
      </h2>

      {count > 0 && (
        <div className="mt-2 flex items-center gap-3">
          <Stars rating={Math.round(avg)} />
          <span className="text-sm text-pack-brown">
            {avg.toFixed(1)} · {count} {count === 1 ? "review" : "reviews"}
          </span>
        </div>
      )}

      {count === 0 && !canReview && (
        <p className="mt-3 text-sm text-neutral-500">No reviews yet.</p>
      )}

      {/* Review list */}
      {count > 0 && (
        <ul className="mt-4 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-lg border border-pack-tan/40 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-pack-sand">
                  {r.reviewer?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.reviewer.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-medium text-pack-brown">
                      {(r.reviewer?.full_name ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-pack-mask">
                      {r.reviewer?.full_name ?? "Community member"}
                    </span>
                    <Stars rating={r.rating} />
                    <span className="text-xs text-neutral-400">
                      {new Date(r.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </div>
                  {r.title && (
                    <p className="mt-1 text-sm font-semibold text-pack-mask">{r.title}</p>
                  )}
                  <p className="mt-1 text-sm text-neutral-700">{r.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Write a review */}
      {!currentUserId && (
        <p className="mt-4 text-sm text-neutral-500">
          <Link href="/login" className="underline hover:text-pack-mask">Log in</Link> to leave a review.
        </p>
      )}

      {canReview && !success && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-pack-tan/40 bg-white p-4">
          <h3 className="text-sm font-semibold text-pack-mask">Write a review</h3>
          <div className="mt-3">
            <p className="mb-1 text-xs text-neutral-500">Rating</p>
            <Stars rating={rating} interactive onSelect={setRating} />
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs text-neutral-500">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
            />
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs text-neutral-500">Review</label>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What do you think of this product?"
              className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
            />
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="mt-3 rounded-md bg-pack-mask px-4 py-1.5 text-sm font-medium text-pack-cream disabled:opacity-60 hover:bg-pack-brown"
          >
            {isPending ? "Submitting…" : "Submit review"}
          </button>
        </form>
      )}

      {success && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Review submitted — thank you! It will appear after the page refreshes.
        </p>
      )}
    </section>
  );
}
