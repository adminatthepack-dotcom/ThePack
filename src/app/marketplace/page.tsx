import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  JOB_CATEGORIES,
  isJobCategory,
  type JobCategory,
} from "@/lib/marketplace";
import type { JobPost } from "@/types/database";
import JobCard from "@/components/job-card";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory: JobCategory | null = isJobCategory(category)
    ? category
    : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("job_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (activeCategory) {
    query = query.eq("category", activeCategory);
  }
  const { data: jobs } = await query.returns<JobPost[]>();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-pack-mask">
            Marketplace
          </h1>
          <p className="mt-1 text-sm text-pack-brown">
            Clients post jobs, handlers bid. Find work or hire freelance K9
            teams.
          </p>
        </div>
        {user && (
          <Link
            href="/marketplace/new"
            className="rounded-md bg-pack-mask px-4 py-2 text-sm font-semibold text-pack-cream transition hover:bg-pack-brown"
          >
            + Post a job
          </Link>
        )}
      </div>

      <nav className="mt-6 flex flex-wrap gap-2">
        <FilterPill href="/marketplace" active={!activeCategory}>
          All categories
        </FilterPill>
        {JOB_CATEGORIES.map((c) => (
          <FilterPill
            key={c.value}
            href={`/marketplace?category=${c.value}`}
            active={activeCategory === c.value}
          >
            {c.label}
          </FilterPill>
        ))}
      </nav>

      <div className="mt-6">
        {!jobs || jobs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-pack-tan/40 bg-white p-8 text-center text-sm text-pack-brown">
            No jobs in this category yet.
            {user && (
              <>
                {" "}
                <Link
                  href="/marketplace/new"
                  className="font-medium text-pack-mask underline"
                >
                  Post one
                </Link>
                .
              </>
            )}
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {jobs.map((j) => (
              <li key={j.id}>
                <JobCard job={j} />
              </li>
            ))}
          </ul>
        )}
      </div>
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
