import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JOB_CATEGORIES } from "@/lib/marketplace";
import { createJob } from "./actions";
import JobCapabilitiesField from "@/components/job-capabilities-field";

const inputCls =
  "mt-1 block w-full rounded-md border border-pack-tan/40 bg-white px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/marketplace/new");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/marketplace"
        className="text-sm text-pack-brown hover:text-pack-mask"
      >
        ← Back to marketplace
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-pack-mask">
        Post a job
      </h1>
      <p className="mt-1 text-sm text-pack-brown">
        Describe what you need. Handlers and trainers can place bids on your
        post.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createJob} className="mt-6 space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Job title <span className="text-red-700">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g., Explosives sweep — 3-day conference"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            Category <span className="text-red-700">*</span>
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue=""
            className={inputCls}
          >
            <option value="" disabled>
              Pick a category…
            </option>
            {JOB_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description <span className="text-red-700">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            placeholder="Describe the work, expectations, environment, and any extra context."
            className={inputCls}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="location" className="block text-sm font-medium">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="City, state / venue"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="pay" className="block text-sm font-medium">
              Pay
            </label>
            <input
              id="pay"
              name="pay"
              type="text"
              placeholder="e.g., $1,500 flat, $75/hr, negotiable"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium">
              Start date
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium">
              End date
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium">
              Duration
            </label>
            <input
              id="duration"
              name="duration"
              type="text"
              placeholder="e.g., 3 days, ongoing"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="required_licensing"
            className="block text-sm font-medium"
          >
            Required licensing / credentials
          </label>
          <textarea
            id="required_licensing"
            name="required_licensing"
            rows={2}
            placeholder="e.g., NNDDA narcotics cert, state security license, insurance proof"
            className={inputCls}
          />
        </div>

        <JobCapabilitiesField />

        <button
          type="submit"
          className="rounded-md bg-pack-mask px-5 py-2 text-sm font-semibold text-pack-cream hover:bg-pack-brown"
        >
          Post job
        </button>
      </form>
    </div>
  );
}
