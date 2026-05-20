"use client";

// Subscribes to new INSERTs on the messages table and refreshes the page
// when a message belongs to this conversation. Tiny piece of client glue,
// no UI of its own.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ThreadRealtime({
  currentUserId,
  otherUserId,
}: {
  currentUserId: string;
  otherUserId: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${currentUserId}:${otherUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as {
            sender_id: string;
            recipient_id: string;
          };
          const inThread =
            (m.sender_id === currentUserId && m.recipient_id === otherUserId) ||
            (m.sender_id === otherUserId && m.recipient_id === currentUserId);
          if (inThread) {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId, router]);

  return null;
}
