import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/types/database";
import { clearAllNotifications } from "./actions";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/notifications");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Notification[]>();

  // Mark unread as read on view
  const unreadIds = (notifications ?? [])
    .filter((n) => !n.read_at)
    .map((n) => n.id);
  if (unreadIds.length > 0) {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-pack-mask">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-pack-brown">
            Recent activity for your account.
          </p>
        </div>
        {notifications && notifications.length > 0 && (
          <form action={clearAllNotifications}>
            <button
              type="submit"
              className="rounded-md border border-pack-tan/40 bg-white px-3 py-1.5 text-sm hover:bg-pack-sand/40"
            >
              Clear all
            </button>
          </form>
        )}
      </div>

      <div className="mt-6">
        {!notifications || notifications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-pack-tan/40 bg-white p-8 text-center text-sm text-pack-brown">
            You&apos;re all caught up.
          </div>
        ) : (
          <ul className="divide-y divide-pack-tan/40 overflow-hidden rounded-lg border border-pack-tan/40 bg-white">
            {notifications.map((n) => (
              <li key={n.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      n.read_at ? "bg-pack-tan/40" : "bg-pack-blue"
                    }`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      {n.link ? (
                        <Link
                          href={n.link}
                          className="font-semibold text-pack-mask hover:underline"
                        >
                          {n.title}
                        </Link>
                      ) : (
                        <span className="font-semibold text-pack-mask">
                          {n.title}
                        </span>
                      )}
                      <span className="text-xs text-pack-brown/70">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    {n.body && (
                      <p className="mt-1 text-sm text-pack-mask/80">{n.body}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
