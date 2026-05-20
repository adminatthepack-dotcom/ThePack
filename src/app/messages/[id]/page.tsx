// One conversation thread between the logged-in user and the user in the URL.
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/roles";
import type { Message, Profile } from "@/types/database";
import { sendMessage } from "./actions";
import ThreadRealtime from "./thread-realtime";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: otherId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/messages/" + otherId);
  }
  if (user.id === otherId) {
    // Can't message yourself.
    redirect("/messages");
  }

  const { data: other } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", otherId)
    .maybeSingle<Profile>();
  if (!other) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true })
    .returns<Message[]>();

  // Mark any unread messages from the other user as read.
  const unreadIds =
    messages
      ?.filter((m) => m.recipient_id === user.id && !m.read_at)
      .map((m) => m.id) ?? [];
  if (unreadIds.length > 0) {
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/messages"
        className="text-sm text-neutral-600 hover:text-neutral-900"
      >
        ← Back to messages
      </Link>

      <header className="mt-4 flex items-center gap-3 border-b border-neutral-200 pb-4">
        <Link href={`/profile/${other.id}`} className="shrink-0">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-200">
            {other.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={other.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
                {(other.full_name ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${other.id}`}
            className="block truncate font-medium hover:underline"
          >
            {other.full_name ?? "Unknown user"}
          </Link>
          <span
            className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ROLE_BADGE_CLASSES[other.role]}`}
          >
            {ROLE_LABELS[other.role]}
          </span>
        </div>
      </header>

      <div className="mt-6 space-y-3">
        {messages && messages.length > 0 ? (
          messages.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    mine
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-900 ring-1 ring-neutral-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.body}</div>
                  <div
                    className={`mt-1 text-[10px] ${mine ? "text-neutral-300" : "text-neutral-500"}`}
                  >
                    {formatTime(m.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-sm text-neutral-500">
            No messages yet. Say hi!
          </p>
        )}
      </div>

      <form
        action={sendMessage}
        className="mt-6 flex items-end gap-2 border-t border-neutral-200 pt-4"
      >
        <input type="hidden" name="recipient_id" value={other.id} />
        <textarea
          name="body"
          required
          rows={2}
          placeholder="Write a message…"
          className="flex-1 resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Send
        </button>
      </form>

      <ThreadRealtime currentUserId={user.id} otherUserId={other.id} />
    </div>
  );
}
