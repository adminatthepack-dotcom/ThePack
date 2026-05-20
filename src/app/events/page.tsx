import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { EventPost } from "@/types/database";
import EventCard from "@/components/event-card";

export default async function EventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nowIso = new Date().toISOString();
  const { data: upcoming } = await supabase
    .from("events")
    .select("*")
    .gte("start_at", nowIso)
    .order("start_at", { ascending: true })
    .returns<EventPost[]>();

  const { data: past } = await supabase
    .from("events")
    .select("*")
    .lt("start_at", nowIso)
    .order("start_at", { ascending: false })
    .limit(8)
    .returns<EventPost[]>();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-pack-mask">
            Events
          </h1>
          <p className="mt-1 text-sm text-pack-brown">
            Seminars, trials, certifications, and community gatherings.
          </p>
        </div>
        {user && (
          <Link
            href="/events/new"
            className="rounded-md bg-pack-mask px-4 py-2 text-sm font-semibold text-pack-cream transition hover:bg-pack-brown"
          >
            + Post an event
          </Link>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-pack-fawn">
          Upcoming
        </h2>
        {!upcoming || upcoming.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-pack-tan/40 bg-white p-6 text-center text-sm text-pack-brown">
            No upcoming events yet.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {upcoming.map((e) => (
              <li key={e.id}>
                <EventCard event={e} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {past && past.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-pack-fawn">
            Past
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 opacity-80">
            {past.map((e) => (
              <li key={e.id}>
                <EventCard event={e} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
