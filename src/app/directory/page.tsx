import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROLES, ROLE_LABELS, isRole, type Role } from "@/lib/roles";
import type { Profile } from "@/types/database";
import ProfileCard from "@/components/profile-card";

type Intent = {
  question: string;
  href: string;
  hint: string;
  accent: string;
};

// Guided-workflow cards shown on the default /directory view.
const INTENTS: Intent[] = [
  {
    question: "I need to hire a K9 handler",
    hint: "Detection, protection, patrol, search & rescue.",
    href: "/directory?role=handler",
    accent: "bg-emerald-50 ring-emerald-200 hover:ring-emerald-400",
  },
  {
    question: "I'm looking to acquire a dog",
    hint: "Working-line breeders, started prospects, fully trained dogs.",
    href: "/directory?role=breeder",
    accent: "bg-amber-50 ring-amber-200 hover:ring-amber-400",
  },
  {
    question: "I need training",
    hint: "For me, my dog, or my team.",
    href: "/directory?role=trainer",
    accent: "bg-sky-50 ring-sky-200 hover:ring-sky-400",
  },
  {
    question: "I need a veterinarian",
    hint: "Working-dog medicine, sports med, rehab, reproduction.",
    href: "/directory?role=veterinarian",
    accent: "bg-teal-50 ring-teal-200 hover:ring-teal-400",
  },
  {
    question: "I need to transport a dog",
    hint: "Ground, air, climate-controlled — local or cross-country.",
    href: "/directory?role=transporter",
    accent: "bg-orange-50 ring-orange-200 hover:ring-orange-400",
  },
  {
    question: "I want to certify a dog or handler",
    hint: "Find a certification agency for your discipline.",
    href: "/directory?role=certification_agency",
    accent: "bg-violet-50 ring-violet-200 hover:ring-violet-400",
  },
  {
    question: "I'm hiring (security, training academy, agency)",
    hint: "Browse employers and post a job in the marketplace.",
    href: "/directory?role=employer",
    accent: "bg-indigo-50 ring-indigo-200 hover:ring-indigo-400",
  },
  {
    question: "I'm offering my services — find me clients",
    hint: "Browse open jobs and bid on the work that fits.",
    href: "/marketplace",
    accent: "bg-pack-sand ring-pack-tan/40 hover:ring-pack-tan",
  },
];

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; show?: string }>;
}) {
  const { role, show } = await searchParams;
  const activeRole: Role | null = isRole(role) ? role : null;
  const showAll = show === "all";
  const showDock = !activeRole && !showAll;

  const supabase = await createClient();
  let profiles: Profile[] | null = null;
  let queryError: string | null = null;

  if (!showDock) {
    let query = supabase
      .from("profiles")
      .select("*")
      .order("updated_at", { ascending: false });
    if (activeRole) query = query.eq("role", activeRole);
    const { data, error } = await query.returns<Profile[]>();
    profiles = data;
    queryError = error?.message ?? null;
  }

  return (
    <div>
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-pack-mask">
          Directory
        </h1>
        <p className="mt-1 text-sm text-pack-brown">
          {showDock
            ? "What are you looking for today?"
            : activeRole
              ? `Showing ${ROLE_LABELS[activeRole]}s`
              : "Showing everyone"}
        </p>
      </header>

      {/* Role tabs — always visible as an escape hatch from the dock */}
      <nav className="mt-6 flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <FilterPill
            key={r}
            href={`/directory?role=${r}`}
            active={activeRole === r}
          >
            {ROLE_LABELS[r]}
          </FilterPill>
        ))}
        <FilterPill href="/directory?show=all" active={showAll}>
          Everyone
        </FilterPill>
      </nav>

      {showDock ? (
        <section className="mt-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {INTENTS.map((intent) => (
              <Link
                key={intent.question}
                href={intent.href}
                className={`group flex items-start justify-between gap-4 rounded-lg p-5 ring-1 ring-inset transition ${intent.accent}`}
              >
                <div>
                  <div className="font-semibold text-pack-mask">
                    {intent.question}
                  </div>
                  <p className="mt-1 text-sm text-pack-brown">{intent.hint}</p>
                </div>
                <span
                  aria-hidden
                  className="mt-1 text-xl text-pack-mask/40 transition group-hover:translate-x-1 group-hover:text-pack-mask"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-pack-brown">
            Or{" "}
            <Link
              href="/directory?show=all"
              className="font-medium text-pack-mask underline underline-offset-2"
            >
              browse all profiles
            </Link>
            .
          </p>
        </section>
      ) : (
        <div className="mt-6">
          {queryError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              Couldn&apos;t load the directory: {queryError}
            </div>
          )}

          {profiles && profiles.length === 0 && (
            <div className="rounded-lg border border-dashed border-pack-tan/40 bg-white p-8 text-center text-sm text-pack-brown">
              No profiles in this category yet.{" "}
              <Link
                href="/signup"
                className="font-medium text-pack-mask underline"
              >
                Be the first
              </Link>
              .
            </div>
          )}

          {profiles && profiles.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {profiles.map((p) => (
                <li key={p.id}>
                  <ProfileCard profile={p} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm ring-1 ring-inset transition ${
        active
          ? "bg-pack-mask text-pack-cream ring-pack-mask"
          : "bg-white text-pack-brown ring-pack-tan/40 hover:bg-pack-sand/60"
      }`}
    >
      {children}
    </Link>
  );
}
