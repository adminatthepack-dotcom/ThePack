import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/roles";
import type { Profile, Certification, Dog, Review } from "@/types/database";
import TagList from "@/components/tag-list";
import CertificationsList from "@/components/certifications-list";
import DogCard from "@/components/dog-card";
import ReviewsSection from "@/components/reviews-section";
import EmployerHandlersSection from "@/components/employer-handlers-section";
import { roleCanOwnDogs } from "@/lib/dogs";
import { roleCanBeReviewed } from "@/lib/reviews";

function VerifiedBadge() {
  return (
    <span className="group relative inline-flex align-middle">
      <span className="ml-2 inline-flex h-5 w-5 cursor-default items-center justify-center rounded-full bg-pack-mask text-[11px] text-pack-cream">
        ✓
      </span>
      <span className="pointer-events-none invisible absolute bottom-full left-1/2 z-10 mb-1.5 w-52 -translate-x-1/2 rounded-md bg-pack-mask px-3 py-2 text-center text-xs leading-relaxed text-pack-cream opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
        Verified Handler — credentials reviewed and approved by The Pack
      </span>
    </span>
  );
}

function UnverifiedBadge() {
  return (
    <span className="group relative inline-flex align-middle">
      <span className="ml-2 inline-flex h-5 w-5 cursor-default items-center justify-center rounded-full bg-amber-400 text-[11px] text-white">
        !
      </span>
      <span className="pointer-events-none invisible absolute bottom-full left-1/2 z-10 mb-1.5 w-56 -translate-x-1/2 rounded-md bg-amber-700 px-3 py-2 text-center text-xs leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
        No verified credentials on file — verify qualifications before engaging
      </span>
    </span>
  );
}

function EmployerBadge({
  name,
  avatarUrl,
}: {
  name: string | null;
  avatarUrl: string | null;
}) {
  return (
    <span className="group relative ml-2 inline-flex items-center align-middle">
      <span className="inline-flex h-6 w-6 cursor-default overflow-hidden rounded-full border border-pack-tan bg-white shadow-sm">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[9px] font-bold text-pack-brown">
            {(name ?? "?").slice(0, 1).toUpperCase()}
          </span>
        )}
      </span>
      <span className="pointer-events-none invisible absolute bottom-full left-1/2 z-10 mb-1.5 w-52 -translate-x-1/2 rounded-md bg-pack-mask px-3 py-2 text-center text-xs leading-relaxed text-pack-cream opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
        Employed by {name ?? "an organization on The Pack"}
      </span>
    </span>
  );
}

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle<Profile>();

  if (!profile) {
    notFound();
  }

  const { data: certs } = await supabase
    .from("certifications")
    .select("*")
    .eq("profile_id", profile.id)
    .order("issued_date", { ascending: false, nullsFirst: false })
    .returns<Certification[]>();

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false })
    .returns<Dog[]>();

  // For handler profiles: fetch any employers they are linked to
  let employerProfiles: Pick<Profile, "id" | "full_name" | "avatar_url">[] = [];
  if (profile.role === "handler") {
    const { data: empLinks } = await supabase
      .from("employer_handlers")
      .select("employer_id")
      .eq("handler_id", profile.id);

    if (empLinks && empLinks.length > 0) {
      const empIds = empLinks.map((l) => l.employer_id);
      const { data: emps } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", empIds);
      employerProfiles =
        (emps as Pick<Profile, "id" | "full_name" | "avatar_url">[] | null) ??
        [];
    }
  }

  // For employer profiles: fetch linked handlers and their cert status
  let linkedHandlers: Pick<
    Profile,
    "id" | "full_name" | "avatar_url" | "location"
  >[] = [];
  let allHandlersCertified = true;
  let uncertifiedHandlerCount = 0;
  let certifiedHandlerIds = new Set<string>();
  if (profile.role === "employer") {
    const { data: handlerLinks } = await supabase
      .from("employer_handlers")
      .select("handler_id")
      .eq("employer_id", profile.id);

    if (handlerLinks && handlerLinks.length > 0) {
      const handlerIds = handlerLinks.map((l) => l.handler_id);
      const { data: handlers } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, location")
        .in("id", handlerIds);
      linkedHandlers =
        (handlers as Pick<
          Profile,
          "id" | "full_name" | "avatar_url" | "location"
        >[] | null) ?? [];

      if (linkedHandlers.length > 0) {
        const { data: handlerCerts } = await supabase
          .from("certifications")
          .select("profile_id")
          .in("profile_id", handlerIds);
        certifiedHandlerIds = new Set(
          (handlerCerts ?? []).map((c) => c.profile_id)
        );
        uncertifiedHandlerCount = linkedHandlers.filter(
          (h) => !certifiedHandlerIds.has(h.id)
        ).length;
        allHandlersCertified = uncertifiedHandlerCount === 0;
      }
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;
  const canMessage = !!user && !isOwner;
  const dogList = dogs ?? [];
  const showDogsSection =
    roleCanOwnDogs(profile.role) && (isOwner || dogList.length > 0);

  const showVerifiedBadge =
    profile.role === "handler" && (certs ?? []).length > 0;
  const showUnverifiedBadge =
    profile.role === "handler" && (certs ?? []).length === 0;

  const showReviewsSection = roleCanBeReviewed(profile.role);
  let reviewsWithReviewer: (Review & {
    reviewer: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  })[] = [];
  if (showReviewsSection) {
    const { data: rawReviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("reviewee_id", profile.id)
      .order("created_at", { ascending: false })
      .returns<Review[]>();

    const reviewerIds = Array.from(
      new Set((rawReviews ?? []).map((r) => r.reviewer_id))
    );
    const reviewerMap = new Map<
      string,
      Pick<Profile, "id" | "full_name" | "avatar_url">
    >();
    if (reviewerIds.length > 0) {
      const { data: reviewerProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", reviewerIds);
      for (const p of (reviewerProfiles as
        | Pick<Profile, "id" | "full_name" | "avatar_url">[]
        | null) ?? []) {
        reviewerMap.set(p.id, p);
      }
    }
    reviewsWithReviewer = (rawReviews ?? []).map((r) => ({
      ...r,
      reviewer: reviewerMap.get(r.reviewer_id) ?? null,
    }));
  }

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        href="/directory"
        className="text-sm text-neutral-600 hover:text-neutral-900"
      >
        ← Back to directory
      </Link>

      <header className="mt-4 flex items-start gap-5">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-neutral-200">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-medium text-neutral-500">
              {(profile.full_name ?? "?").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center text-2xl font-semibold tracking-tight">
            <span>{profile.full_name ?? "Unnamed user"}</span>
            {showVerifiedBadge && <VerifiedBadge />}
            {showUnverifiedBadge && <UnverifiedBadge />}
            {employerProfiles.map((emp) => (
              <EmployerBadge
                key={emp.id}
                name={emp.full_name}
                avatarUrl={emp.avatar_url}
              />
            ))}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_BADGE_CLASSES[profile.role]}`}
            >
              {ROLE_LABELS[profile.role]}
            </span>
            {profile.location && (
              <span className="text-sm text-neutral-600">
                {profile.location}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {isOwner && (
            <Link
              href="/profile/edit"
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Edit
            </Link>
          )}
          {canMessage && (
            <Link
              href={`/messages/${profile.id}`}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Message
            </Link>
          )}
          {!user && (
            <Link
              href="/login"
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Log in to message
            </Link>
          )}
        </div>
      </header>

      {profile.tags && profile.tags.length > 0 && (
        <section className="mt-6">
          <TagList tags={profile.tags} size="md" />
        </section>
      )}

      {profile.bio && (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            About
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-neutral-800">
            {profile.bio}
          </p>
        </section>
      )}

      {profile.role === "certification_agency" &&
        (profile.cert_meaning ||
          profile.cert_audience ||
          profile.cert_requirements) && (
          <section className="mt-8 rounded-lg border border-violet-200 bg-violet-50 p-6">
            <h2 className="text-sm font-medium uppercase tracking-wide text-violet-900">
              About this certification
            </h2>
            {profile.cert_meaning && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-violet-900">
                  What it means
                </h3>
                <p className="mt-1 whitespace-pre-wrap text-neutral-800">
                  {profile.cert_meaning}
                </p>
              </div>
            )}
            {profile.cert_audience && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-violet-900">
                  Who needs it
                </h3>
                <p className="mt-1 whitespace-pre-wrap text-neutral-800">
                  {profile.cert_audience}
                </p>
              </div>
            )}
            {profile.cert_requirements && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-violet-900">
                  How to get certified
                </h3>
                <p className="mt-1 whitespace-pre-wrap text-neutral-800">
                  {profile.cert_requirements}
                </p>
              </div>
            )}
          </section>
        )}

      {/* Employer handler certification status */}
      {profile.role === "employer" && linkedHandlers.length > 0 && (
        <div
          className={`mt-8 rounded-lg border px-4 py-3 ${
            allHandlersCertified
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">
              {allHandlersCertified ? "✓" : "!"}
            </span>
            <p
              className={`text-sm font-medium ${
                allHandlersCertified ? "text-emerald-800" : "text-amber-800"
              }`}
            >
              {allHandlersCertified
                ? `All ${linkedHandlers.length} listed handler${linkedHandlers.length === 1 ? "" : "s"} hold verified credentials`
                : `${uncertifiedHandlerCount} of ${linkedHandlers.length} listed handler${linkedHandlers.length === 1 ? "" : "s"} ${uncertifiedHandlerCount === 1 ? "has" : "have"} no verified credentials on file`}
            </p>
          </div>
          {!allHandlersCertified && (
            <p className="mt-1 text-xs text-amber-700">
              We recommend verifying qualifications directly before engaging uncertified handlers.
            </p>
          )}
        </div>
      )}

      {/* Employer's linked handlers */}
      {profile.role === "employer" && (
        <EmployerHandlersSection
          employerId={profile.id}
          handlers={linkedHandlers}
          certifiedHandlerIds={[...certifiedHandlerIds]}
          employerName={profile.full_name}
          employerAvatarUrl={profile.avatar_url}
          isOwner={isOwner}
        />
      )}

      {showDogsSection && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
              Dogs
            </h2>
            {isOwner && (
              <Link
                href="/dogs/new"
                className="rounded-md border border-neutral-300 bg-white px-3 py-1 text-xs hover:bg-neutral-50"
              >
                + Add a dog
              </Link>
            )}
          </div>
          <div className="mt-2">
            {dogList.length === 0 ? (
              <p className="text-sm text-neutral-500">
                {isOwner
                  ? "You haven't added any dogs yet."
                  : "No dogs listed."}
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {dogList.map((d) => (
                  <li key={d.id}>
                    <DogCard dog={d} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          {profile.role === "certification_agency"
            ? "Accreditation & documents"
            : "Documents"}
        </h2>
        <div className="mt-2">
          <CertificationsList certifications={certs ?? []} />
        </div>
      </section>

      {showReviewsSection && (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Reviews
          </h2>
          <div className="mt-2">
            <ReviewsSection
              revieweeId={profile.id}
              currentUserId={user?.id ?? null}
              initialReviews={reviewsWithReviewer}
            />
          </div>
        </section>
      )}

      {(profile.contact_email || profile.website) && (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Contact
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {profile.contact_email && (
              <li>
                <a
                  href={`mailto:${profile.contact_email}`}
                  className="text-neutral-900 underline"
                >
                  {profile.contact_email}
                </a>
              </li>
            )}
            {profile.website && (
              <li>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-900 underline"
                >
                  {profile.website}
                </a>
              </li>
            )}
          </ul>
        </section>
      )}
    </article>
  );
}
