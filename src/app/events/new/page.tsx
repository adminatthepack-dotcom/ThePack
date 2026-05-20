import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createEvent } from "./actions";

const inputCls =
  "mt-1 block w-full rounded-md border border-pack-tan/40 bg-white px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/events/new");

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/events" className="text-sm text-pack-brown hover:text-pack-mask">
        ← Back to events
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-pack-mask">
        Post an event
      </h1>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createEvent} className="mt-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title <span className="text-red-700">*</span>
          </label>
          <input id="title" name="title" required type="text" className={inputCls} />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description <span className="text-red-700">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            className={inputCls}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="start_at" className="block text-sm font-medium">
              Starts <span className="text-red-700">*</span>
            </label>
            <input
              id="start_at"
              name="start_at"
              type="datetime-local"
              required
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="end_at" className="block text-sm font-medium">
              Ends
            </label>
            <input
              id="end_at"
              name="end_at"
              type="datetime-local"
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Venue, city, state"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="url" className="block text-sm font-medium">
            External link (registration, info)
          </label>
          <input
            id="url"
            name="url"
            type="url"
            placeholder="https://"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="image_url" className="block text-sm font-medium">
            Cover image URL (optional)
          </label>
          <input
            id="image_url"
            name="image_url"
            type="url"
            placeholder="https://example.com/cover.jpg"
            className={inputCls}
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-pack-mask px-4 py-2 text-sm font-semibold text-pack-cream hover:bg-pack-brown"
        >
          Post event
        </button>
      </form>
    </div>
  );
}
