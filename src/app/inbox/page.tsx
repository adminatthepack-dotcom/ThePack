import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/roles";
import type { Message, Notification, Profile } from "@/types/database";
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

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "messages" ? "messages" : "notifications";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/inbox");

  // --- Notifications ---
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Notification[]>();

  const unreadNotifIds = (notifications ?? [])
    .filter((n) => !n.read_at)
    .map((n) => n.id);

  if (activeTab === "notifications" && unreadNotifIds.length > 0) {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadNotifIds);
  }

  // --- Messages ---
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Message[]>();

  type Conversation = {
    otherUserId: string;
    lastMessage: Message;
    unreadCount: number;
  };

  const map = new Map<string, Conversation>();
  for (const m of messages ?? []) {
    const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
    if (!map.has(other)) {
      map.set(other, { otherUserId: other, lastMessage: m, unreadCount: 0 });
    }
    if (m.recipient_id === user.id && !m.read_at) {
      map.get(other)!.unreadCount += 1;
    }
  }
  const conversations = Array.from(map.values());

  const otherIds = conversations.map((c) => c.otherUserId);
  const profilesById = new Map<string, Profile>();
  if (otherIds.length > 0) {
    const { data: others } = await supabase
      .from("profiles")
      .select("*")
      .in("id", otherIds)
      .returns<Profile[]>();
    for (const p of others ?? []) profilesById.set(p.id, p);
  }

  const unreadMessages = conversations.reduce((s, c) => s + c.unreadCount, 0);
  const unreadNotifs = unreadNotifIds.length;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-pack-mask">Inbox</h1>

      {/* Tab bar */}
      <div className="mt-4 flex gap-1 rounded-lg border border-pack-tan/40 bg-pack-sand/30 p-1">
        <Link
          href="/inbox"
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
            activeTab === "notifications"
              ? "bg-white text-pack-mask shadow-sm"
              : "text-pack-brown hover:text-pack-mask"
          }`}
        >
          Notifications
          {unreadNotifs > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pack-blue px-1.5 text-[11px] font-semibold text-white">
              {unreadNotifs}
            </span>
          )}
        </Link>
        <Link
          href="/inbox?tab=messages"
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
            activeTab === "messages"
              ? "bg-white text-pack-mask shadow-sm"
              : "text-pack-brown hover:text-pack-mask"
          }`}
        >
          Direct Messages
          {unreadMessages > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pack-blue px-1.5 text-[11px] font-semibold text-white">
              {unreadMessages}
            </span>
          )}
        </Link>
      </div>

      {/* Notifications tab */}
      {activeTab === "notifications" && (
        <div className="mt-4">
          {notifications && notifications.length > 0 && (
            <div className="mb-3 flex justify-end">
              <form action={clearAllNotifications}>
                <button
                  type="submit"
                  className="rounded-md border border-pack-tan/40 bg-white px-3 py-1.5 text-sm hover:bg-pack-sand/40"
                >
                  Clear all
                </button>
              </form>
            </div>
          )}
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
      )}

      {/* Messages tab */}
      {activeTab === "messages" && (
        <div className="mt-4">
          {conversations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-pack-tan/40 bg-white p-8 text-center text-sm text-pack-brown">
              No conversations yet. Visit a profile in the{" "}
              <Link href="/directory" className="font-medium underline">
                directory
              </Link>{" "}
              and tap <b>Message</b> to start one.
            </div>
          ) : (
            <ul className="divide-y divide-pack-tan/40 overflow-hidden rounded-lg border border-pack-tan/40 bg-white">
              {conversations.map((c) => {
                const p = profilesById.get(c.otherUserId);
                const lastFromMe = c.lastMessage.sender_id === user.id;
                return (
                  <li key={c.otherUserId}>
                    <Link
                      href={`/messages/${c.otherUserId}`}
                      className="flex items-start gap-4 px-4 py-3 hover:bg-neutral-50"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-pack-sand">
                        {p?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-pack-brown">
                            {(p?.full_name ?? "?").slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-medium text-pack-mask">
                            {p?.full_name ?? "Unknown user"}
                          </span>
                          {p && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ROLE_BADGE_CLASSES[p.role]}`}
                            >
                              {ROLE_LABELS[p.role]}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-sm text-pack-brown">
                          {lastFromMe ? "You: " : ""}
                          {c.lastMessage.body}
                        </p>
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="shrink-0 rounded-full bg-pack-blue px-2 py-0.5 text-[11px] font-medium text-white">
                          {c.unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
