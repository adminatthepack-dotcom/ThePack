import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/roles";
import type { EventPost, Profile } from "@/types/database";
import { deleteEvent } from "../new/actions";

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle<EventPost>();
  if (!event) notFound();

  const { data: organizer } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", event.organizer_id)
    .maybeSingle<Profile>();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOrganizer = user?.id === event.organizer_id;

  const start = new Date(event.start_at);
  const end = event.end_at ? new Date(event.end_at) : null;

  return (
    <article className="mx-auto max-w-2xl">
      <Link href="/events" className="text-sm text-pack-brown hover:text-pack-mask">
        ← Back to events
      </Link>

      {event.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.image_url}
          alt=""
          className="mt-4 h-56 w-full rounded-lg object-cover"
        />
      )}

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-pack-mask">
        {event.title}
      </h1>

      <div className="mt-2 text-sm text-pack-brown">
        🗓{" "}
        {start.toLocaleString(undefined, {
          dateStyle: "full",
          timeStyle: "short",
        })}
        {end && (
          <>
            {" "}
            – {end.toLocaleString(undefined, { timeStyle: "short" })}
          </>
        )}
      </div>
      {event.location && (
        <div className="mt-1 text-sm text-pack-brown">📍 {event.location}</div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}

      {organizer && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-pack-tan/40 bg-white p-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-pack-sand">
            {organizer.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={organizer.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-pack-brown">
                {(organizer.full_name ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide text-pack-brown/70">
              Organized by
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/profile/${organizer.id}`}
                className="font-medium hover:underline"
              >
                {organizer.full_name ?? "Unknown"}
              </Link>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ROLE_BADGE_CLASSES[organizer.role]}`}
              >
                {ROLE_LABELS[organizer.role]}
              </span>
            </div>
          </div>
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Details
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-pack-mask">
          {event.description}
        </p>
      </section>

      {event.url && (
        <section className="mt-6">
          <a
            href={event.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md bg-pack-mask px-4 py-2 text-sm font-semibold text-pack-cream hover:bg-pack-brown"
          >
            Visit event page →
          </a>
        </section>
      )}

      {isOrganizer && (
        <section className="mt-10 rounded-md border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">Organizer tools</h3>
          <form action={deleteEvent} className="mt-2">
            <input type="hidden" name="id" value={event.id} />
            <button
              type="submit"
              className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Delete this event
            </button>
          </form>
        </section>
      )}
    </article>
  );
}
