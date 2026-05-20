"use client";

// Reviews section shown on a profile detail page. Anyone can read; the
// logged-in viewer (if not the reviewee and not already a reviewer) can post.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StarRating from "@/components/star-rating";
import type { Review, Profile } from "@/types/database";

type ReviewWithReviewer = Review & {
  reviewer: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
};

export default function ReviewsSection({
  revieweeId,
  currentUserId,
  initialReviews,
}: {
  revieweeId: string;
  currentUserId: string | null;
  initialReviews: ReviewWithReviewer[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const isOwnProfile = currentUserId === revieweeId;
  const myReview =
    currentUserId !== null
      ? initialReviews.find((r) => r.reviewer_id === currentUserId)
      : undefined;
  const canPost = !!currentUserId && !isOwnProfile && !myReview;

  const count = initialReviews.length;
  const avg =
    count > 0
      ? initialReviews.reduce((sum, r) => sum + r.rating, 0) / count
      : 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError("Pick a star rating.");
      return;
    }
    if (!body.trim()) {
      setError("Write something in the review body.");
      return;
    }
    setBusy(true);
    try {
      const { error: insertErr } = await supabase.from("reviews").insert({
        reviewee_id: revieweeId,
        reviewer_id: currentUserId,
        rating,
        title: title.trim() || null,
        body: body.trim(),
      });
      if (insertErr) throw insertErr;
      setRating(0);
      setTitle("");
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post review.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete your review?")) return;
    setBusy(true);
    setError(null);
    try {
      const { error: delErr } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id);
      if (delErr) throw delErr;
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-baseline gap-3">
        {count > 0 ? (
          <>
            <StarRating value={avg} size="md" />
            <div className="text-sm text-pack-brown">
              <span className="font-semibold text-pack-mask">
                {avg.toFixed(1)}
              </span>{" "}
              · {count} review{count === 1 ? "" : "s"}
            </div>
          </>
        ) : (
          <p className="text-sm text-pack-brown">No reviews yet.</p>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {canPost && (
        <form
          onSubmit={onSubmit}
          className="mt-4 rounded-lg border border-pack-tan/40 bg-white p-5"
        >
          <div className="text-sm font-medium">Leave a review</div>

          <div className="mt-2">
            <div className="text-xs text-pack-brown/70">Your rating</div>
            <div className="mt-1 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  className="rounded p-0.5 transition hover:scale-110"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  title={`${n} star${n > 1 ? "s" : ""}`}
                >
                  <svg
                    viewBox="0 0 16 16"
                    width="28"
                    height="28"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M 8 1 L 10.2 6.1 L 15.5 6.5 L 11.4 9.9 L 12.7 15 L 8 12.3 L 3.3 15 L 4.6 9.9 L 0.5 6.5 L 5.8 6.1 Z"
                      fill={n <= rating ? "#f59e0b" : "#e7e5e4"}
                    />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-sm text-pack-brown">
                {rating > 0 ? `${rating} of 5` : "Click a star"}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs font-medium text-pack-brown">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary"
              className="mt-1 w-full rounded-md border border-pack-tan/40 bg-white px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
            />
          </div>

          <div className="mt-3">
            <label className="block text-xs font-medium text-pack-brown">
              Review <span className="text-red-700">*</span>
            </label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe your experience. Be specific and fair — others rely on this."
              className="mt-1 w-full rounded-md border border-pack-tan/40 bg-white px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-4 rounded-md bg-pack-mask px-4 py-2 text-sm font-semibold text-pack-cream hover:bg-pack-brown disabled:opacity-50"
          >
            {busy ? "Posting…" : "Post review"}
          </button>
        </form>
      )}

      {!currentUserId && (
        <p className="mt-4 text-sm text-pack-brown">
          <Link
            href={`/login?redirect=/profile/${revieweeId}`}
            className="font-medium text-pack-mask underline"
          >
            Log in
          </Link>{" "}
          to leave a review.
        </p>
      )}

      {myReview && (
        <p className="mt-4 text-sm text-pack-brown">
          You&apos;ve already reviewed this person — scroll down to your
          review.
        </p>
      )}

      {count > 0 && (
        <ul className="mt-6 space-y-4">
          {initialReviews.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-pack-tan/40 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-pack-sand">
                    {r.reviewer?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.reviewer.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-pack-brown">
                        {(r.reviewer?.full_name ?? "?")
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    {r.reviewer ? (
                      <Link
                        href={`/profile/${r.reviewer.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {r.reviewer.full_name ?? "Anonymous"}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium">Anonymous</span>
                    )}
                    <div className="text-xs text-pack-brown/70">
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <StarRating value={r.rating} size="sm" />
              </div>
              {r.title && (
                <div className="mt-2 font-semibold text-pack-mask">
                  {r.title}
                </div>
              )}
              <p className="mt-1 whitespace-pre-wrap text-sm text-pack-mask">
                {r.body}
              </p>
              {r.reviewer_id === currentUserId && (
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  disabled={busy}
                  className="mt-2 text-xs text-red-700 underline hover:text-red-900 disabled:opacity-50"
                >
                  Delete my review
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
