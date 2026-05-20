// Inbox: lists conversations (grouped by the "other" user) with the latest
// message and unread count.
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/roles";
import type { Message, Profile } from "@/types/database";

type Conversation = {
  otherUserId: string;
  lastMessage: Message;
  unreadCount: number;
};

export default async function InboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Message[]>();

  // Group by the other user. Because of RLS we only see messages we sent or
  // received, so iterating once is enough.
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

  // Look up the other users' profiles (one batch query).
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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Conversations with other members.
      </p>

      {conversations.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-600">
          No conversations yet. Visit a profile in the{" "}
          <Link href="/directory" className="font-medium underline">
            directory
          </Link>{" "}
          and tap <b>Message</b> to start one.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {conversations.map((c) => {
            const p = profilesById.get(c.otherUserId);
            const lastFromMe = c.lastMessage.sender_id === user.id;
            return (
              <li key={c.otherUserId}>
                <Link
                  href={`/messages/${c.otherUserId}`}
                  className="flex items-start gap-4 px-4 py-3 hover:bg-neutral-50"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                    {p?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
                        {(p?.full_name ?? "?").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium">
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
                    <p className="mt-0.5 line-clamp-1 text-sm text-neutral-600">
                      {lastFromMe ? "You: " : ""}
                      {c.lastMessage.body}
                    </p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="shrink-0 rounded-full bg-neutral-900 px-2 py-0.5 text-[11px] font-medium text-white">
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
  );
}
