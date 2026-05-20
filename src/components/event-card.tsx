import Link from "next/link";
import type { EventPost } from "@/types/database";

function formatRange(startIso: string, endIso: string | null): string {
  const start = new Date(startIso);
  if (!endIso) {
    return start.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
  const end = new Date(endIso);
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${start.toLocaleDateString(undefined, { dateStyle: "medium" })} · ${start.toLocaleTimeString(
      undefined,
      { timeStyle: "short" }
    )} – ${end.toLocaleTimeString(undefined, { timeStyle: "short" })}`;
  }
  return `${start.toLocaleDateString(undefined, { dateStyle: "medium" })} – ${end.toLocaleDateString(undefined, { dateStyle: "medium" })}`;
}

export default function EventCard({ event }: { event: EventPost }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-lg border border-pack-tan/40 bg-white p-5 transition hover:border-pack-tan hover:shadow-sm"
    >
      {event.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.image_url}
          alt=""
          className="mb-3 h-40 w-full rounded-md object-cover"
        />
      )}
      <h3 className="font-semibold text-pack-mask">{event.title}</h3>
      <div className="mt-1 text-xs text-pack-brown">
        🗓 {formatRange(event.start_at, event.end_at)}
      </div>
      {event.location && (
        <div className="mt-0.5 text-xs text-pack-brown">📍 {event.location}</div>
      )}
      <p className="mt-2 line-clamp-3 text-sm text-pack-mask/80">
        {event.description}
      </p>
    </Link>
  );
}
