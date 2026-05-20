"use client";

import { useState } from "react";

export default function BuyNowButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-pack-mask px-6 py-3 text-sm font-semibold text-pack-cream shadow-sm disabled:opacity-60 hover:bg-pack-brown sm:w-auto"
      >
        {loading ? "Redirecting to checkout…" : "Buy Now →"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
