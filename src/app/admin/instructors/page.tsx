import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS, ROLE_BADGE_CLASSES, type Role } from "@/lib/roles";
import { approveInstructor, denyInstructor } from "./actions";

export default async function AdminInstructorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) redirect("/");

  const { data: pending } = await supabase
    .from("profiles")
    .select("id, full_name, role, contact_email, created_at")
    .eq("instructor_status", "pending")
    .order("created_at", { ascending: true });

  const { data: approved } = await supabase
    .from("profiles")
    .select("id, full_name, role, contact_email")
    .eq("instructor_status", "approved")
    .order("full_name", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-pack-mask">Instructor Requests</h1>
        <Link href="/admin/applications" className="text-sm text-pack-brown hover:text-pack-mask">
          ← Applications
        </Link>
      </div>

      {/* Pending */}
      <section className="mt-6">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Pending ({pending?.length ?? 0})
        </h2>

        {!pending || pending.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-pack-tan/40 bg-white p-6 text-center text-sm text-pack-brown">
            No pending requests.
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-pack-tan/40 overflow-hidden rounded-lg border border-pack-tan/40 bg-white">
            {pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/profile/${p.id}`}
                      className="font-medium text-pack-mask hover:underline"
                    >
                      {p.full_name ?? "Unknown"}
                    </Link>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ROLE_BADGE_CLASSES[p.role as Role]}`}>
                      {ROLE_LABELS[p.role as Role]}
                    </span>
                  </div>
                  <p className="text-xs text-pack-brown">{p.contact_email}</p>
                </div>
                <div className="flex gap-2">
                  <form action={approveInstructor.bind(null, p.id)}>
                    <button
                      type="submit"
                      className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={denyInstructor.bind(null, p.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Deny
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Approved */}
      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Approved instructors ({approved?.length ?? 0})
        </h2>
        {!approved || approved.length === 0 ? (
          <p className="mt-3 text-sm text-pack-brown">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-pack-tan/40 overflow-hidden rounded-lg border border-pack-tan/40 bg-white">
            {approved.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/profile/${p.id}`} className="font-medium text-pack-mask hover:underline">
                      {p.full_name ?? "Unknown"}
                    </Link>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ROLE_BADGE_CLASSES[p.role as Role]}`}>
                      {ROLE_LABELS[p.role as Role]}
                    </span>
                  </div>
                  <p className="text-xs text-pack-brown">{p.contact_email}</p>
                </div>
                <span className="text-xs font-medium text-emerald-700">✓ Instructor</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
