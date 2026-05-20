import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/logo";
import NavBar from "@/components/nav-bar";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let unreadCount = 0;
  let unreadNotifs = 0;
  let isAdmin = false;

  if (user) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .is("read_at", null);
    unreadCount = count ?? 0;

    const { count: notifCount } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);
    unreadNotifs = notifCount ?? 0;

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin ?? false;
  }

  return (
    <header className="relative border-b-2 border-pack-tan/40 bg-pack-mask text-pack-cream">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-9 w-auto" />
          <span className="text-lg font-bold tracking-[0.18em]">THE PACK</span>
        </Link>
        <NavBar
          user={!!user}
          unreadTotal={unreadCount + unreadNotifs}
          isAdmin={isAdmin}
        />
      </nav>
    </header>
  );
}
