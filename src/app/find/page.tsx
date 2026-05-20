// The guided "what do you want to accomplish?" wizard.
// State lives in URL query params so every step is bookmarkable.
//
// Step 1: pick an intent (no params)              → intent
// Step 2: pick a specialization (intent set)      → spec
// Step 3: pick specific finds (only for explosives/narcotics) → finds[], other_find
// Step 4: results — filtered profiles, distance-aware
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  FIND_INTENTS,
  FIND_DETAILS,
  getIntent,
  getSpec,
  getFindLabel,
  type IntentDef,
  type SpecOption,
} from "@/lib/find-wizard";
import { ROLE_LABELS } from "@/lib/roles";
import type { Profile } from "@/types/database";
import ProfileCard from "@/components/profile-card";
import { haversineMiles } from "@/lib/geo";
import InfoTooltip from "@/components/info-tooltip";
import { expandStandardFinds } from "@/lib/detection";

type SP = {
  intent?: string;
  who?: string;  // "myself" | "dog" | "team" — only for get-training
  spec?: string;
  finds?: string | string[];
  other_find?: string;
};

export default async function FindPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const intent = getIntent(sp.intent);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let currentRole: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    currentRole = profile?.role ?? null;
  }

  if (!intent) return <Step1 currentRole={currentRole} />;

  // get-training has an extra "who is the training for?" step before discipline
  if (intent.value === "get-training") {
    const who = sp.who;
    if (!who) return <StepWho intent={intent} />;
    if (who === "myself" || who === "team") {
      return <InstructorResults who={who} />;
    }
    // who === "dog" → fall through to normal trainer flow below
  }

  const spec = getSpec(intent, sp.spec);
  if (!spec) return <Step2 intent={intent} />;

  const findsRaw = Array.isArray(sp.finds)
    ? sp.finds
    : sp.finds
      ? [sp.finds]
      : [];
  const finds = findsRaw.filter((f) => f && f !== "skip");
  const otherFind = sp.other_find?.trim() || null;

  const needsFindsStep = !!FIND_DETAILS[spec.value];
  const answeredFinds = findsRaw.length > 0 || otherFind !== null;

  if (needsFindsStep && !answeredFinds) {
    return <Step3 intent={intent} spec={spec} />;
  }

  return (
    <Results
      intent={intent}
      spec={spec}
      finds={finds}
      otherFind={otherFind}
    />
  );
}

// ============================================================
// Shared header (progress + breadcrumbs + back link)
// ============================================================
function StepHeader({
  step,
  total,
  back,
  crumbs,
}: {
  step: number;
  total: number;
  back?: string;
  crumbs: { label: string; href?: string }[];
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 text-xs text-pack-brown/80">
        {back ? (
          <Link href={back} className="hover:text-pack-mask">
            ← Back
          </Link>
        ) : (
          <Link href="/" className="hover:text-pack-mask">
            ← Home
          </Link>
        )}
        <span className="text-pack-brown/50">
          Step {step} of {total}
        </span>
      </div>
      {crumbs.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {c.href ? (
                <Link href={c.href} className="text-pack-brown hover:text-pack-mask">
                  {c.label}
                </Link>
              ) : (
                <span className="font-medium text-pack-mask">{c.label}</span>
              )}
              {i < crumbs.length - 1 && (
                <span className="text-pack-brown/40">→</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Step 1 — pick your goal
// ============================================================
function Step1({ currentRole }: { currentRole: string | null }) {
  const visibleIntents = FIND_INTENTS.filter(
    (intent) => !currentRole || !(intent.hideForRoles as string[] | undefined)?.includes(currentRole)
  );

  const extraCards = [
    {
      key: "equipment",
      href: "/gear",
      title: "Find quality equipment",
      hint: "Browse Pack Approved gear and custom K9 equipment.",
    },
    {
      key: "marketplace",
      href: "/marketplace",
      title: "Find more contracts",
      hint: "Post or browse open K9 contracts and opportunities.",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <StepHeader step={1} total={4} crumbs={[]} />
      <h1 className="text-4xl font-bold tracking-tight text-pack-mask">
        What do you want to accomplish today?
      </h1>
      <p className="mt-2 text-base text-pack-brown">
        Pick one. We&apos;ll narrow it down from there.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {visibleIntents.map((intent) => (
          <Link
            key={intent.value}
            href={`/find?intent=${intent.value}`}
            className="group flex items-start justify-between gap-3 rounded-lg border border-pack-tan/40 bg-white p-5 transition hover:border-pack-tan hover:shadow-sm"
          >
            <div>
              <div className="font-semibold text-pack-mask">
                {intent.cardTitle}
              </div>
              <p className="mt-1 text-sm text-pack-brown">{intent.hint}</p>
            </div>
            <span className="mt-1 text-xl text-pack-mask/40 transition group-hover:translate-x-1 group-hover:text-pack-mask">
              →
            </span>
          </Link>
        ))}
        {extraCards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="group flex items-start justify-between gap-3 rounded-lg border border-pack-tan/40 bg-white p-5 transition hover:border-pack-tan hover:shadow-sm"
          >
            <div>
              <div className="font-semibold text-pack-mask">{card.title}</div>
              <p className="mt-1 text-sm text-pack-brown">{card.hint}</p>
            </div>
            <span className="mt-1 text-xl text-pack-mask/40 transition group-hover:translate-x-1 group-hover:text-pack-mask">
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
    </div>
  );
}

// ============================================================
// StepWho — "who is the training for?" (get-training only)
// ============================================================
function StepWho({ intent }: { intent: IntentDef }) {
  const options = [
    {
      value: "myself",
      label: "For myself",
      hint: "Find a certified instructor to train you as a handler.",
    },
    {
      value: "dog",
      label: "For my dog",
      hint: "Find a professional trainer for your dog's discipline.",
    },
    {
      value: "team",
      label: "For my team",
      hint: "Find an instructor who can train your whole team.",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <StepHeader
        step={2}
        total={4}
        back="/find"
        crumbs={[
          { label: "What you need", href: "/find" },
          { label: intent.cardTitle },
        ]}
      />
      <h1 className="text-3xl font-bold tracking-tight text-pack-mask">
        Who is the training for?
      </h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {options.map((opt) => (
          <Link
            key={opt.value}
            href={`/find?intent=get-training&who=${opt.value}`}
            className="group flex flex-col gap-2 rounded-lg border border-pack-tan/40 bg-white p-5 transition hover:border-pack-tan hover:shadow-sm"
          >
            <span className="font-semibold text-pack-mask">{opt.label}</span>
            <p className="text-sm text-pack-brown">{opt.hint}</p>
            <span className="mt-auto self-end text-xl text-pack-mask/40 transition group-hover:translate-x-1 group-hover:text-pack-mask">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// InstructorResults — profiles with instructor tag (myself/team)
// ============================================================
async function InstructorResults({ who }: { who: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: rawProfiles } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["handler", "employer"])
    .contains("tags", ["instructor"])
    .returns<Profile[]>();

  let viewerCoords: { lat: number; lng: number } | null = null;
  let viewerRadius = 120;
  if (user) {
    const { data: me } = await supabase
      .from("profiles")
      .select("latitude, longitude, search_radius_miles")
      .eq("id", user.id)
      .maybeSingle<{ latitude: number | null; longitude: number | null; search_radius_miles: number | null }>();
    if (me && typeof me.latitude === "number" && typeof me.longitude === "number") {
      viewerCoords = { lat: me.latitude, lng: me.longitude };
    }
    viewerRadius = me?.search_radius_miles ?? 120;
  }

  type WithDist = { profile: Profile; distance: number | null };
  const withDist: WithDist[] = (rawProfiles ?? []).map((p) => {
    let d: number | null = null;
    if (viewerCoords && typeof p.latitude === "number" && typeof p.longitude === "number") {
      d = haversineMiles(viewerCoords.lat, viewerCoords.lng, p.latitude, p.longitude);
    }
    return { profile: p, distance: d };
  });

  const filtered = viewerCoords
    ? withDist.filter((w) => w.distance === null || w.distance <= viewerRadius)
    : withDist;

  filtered.sort((a, b) => {
    if (a.distance === null && b.distance === null) return 0;
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });

  const label = who === "team" ? "for your team" : "for yourself";

  return (
    <div className="mx-auto max-w-3xl">
      <StepHeader
        step={3}
        total={3}
        back="/find?intent=get-training"
        crumbs={[
          { label: "What you need", href: "/find" },
          { label: "Get training", href: "/find?intent=get-training" },
          { label: who === "team" ? "For my team" : "For myself" },
        ]}
      />
      <h1 className="text-3xl font-bold tracking-tight text-pack-mask">
        {filtered.length} instructor{filtered.length === 1 ? "" : "s"} matched
      </h1>
      <p className="mt-1 text-sm text-pack-brown">
        Verified instructors available to train {label}.
      </p>

      {!user ? (
        <div className="mt-4 rounded-md border border-pack-tan/40 bg-pack-sand/30 p-3 text-sm text-pack-brown">
          <Link href="/login" className="font-medium text-pack-mask underline">Log in</Link>{" "}
          and add your location to filter by distance.
        </div>
      ) : !viewerCoords ? (
        <div className="mt-4 rounded-md border border-pack-tan/40 bg-pack-sand/30 p-3 text-sm text-pack-brown">
          Showing all matches.{" "}
          <Link href="/profile/edit" className="font-medium text-pack-mask underline">Set your coordinates</Link>{" "}
          to filter within {viewerRadius} miles.
        </div>
      ) : (
        <p className="mt-4 text-sm text-pack-brown">
          Within {viewerRadius} miles, nearest first.{" "}
          <Link href="/profile/edit" className="text-pack-mask underline">Change radius</Link>
        </p>
      )}

      <div className="mt-6">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-pack-tan/40 bg-white p-8 text-center text-sm text-pack-brown">
            No instructors found{viewerCoords ? ` within ${viewerRadius} miles` : ""}.{" "}
            <Link href="/directory" className="font-medium text-pack-mask underline">Browse the full directory</Link>.
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map(({ profile: p, distance: d }) => (
              <li key={p.id}>
                <ProfileCard profile={p} distanceMiles={d} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Step 2 — pick a specialization
// ============================================================
function Step2({ intent }: { intent: IntentDef }) {
  const willHaveStep3 = intent.specs.some((s) => FIND_DETAILS[s.value]);
  const isTraining = intent.value === "get-training";
  // For get-training the "dog" who-step comes before discipline
  const backHref = isTraining ? "/find?intent=get-training&who=dog" : "/find";
  const stepNum = isTraining ? 3 : 2;
  const totalSteps = isTraining ? 4 : (willHaveStep3 ? 4 : 3);

  return (
    <div className="mx-auto max-w-2xl">
      <StepHeader
        step={stepNum}
        total={totalSteps}
        back={backHref}
        crumbs={[
          { label: "What you need", href: "/find" },
          ...(isTraining
            ? [{ label: intent.cardTitle, href: "/find?intent=get-training" },
               { label: "For my dog", href: "/find?intent=get-training&who=dog" }]
            : [{ label: intent.cardTitle }]),
        ]}
      />
      <h1 className="text-3xl font-bold tracking-tight text-pack-mask">
        {intent.specsQuestion}
      </h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {intent.specs.map((spec) => (
          <Link
            key={spec.value}
            href={`/find?intent=${intent.value}${isTraining ? "&who=dog" : ""}&spec=${spec.value}`}
            className="group flex items-center justify-between gap-3 rounded-lg border border-pack-tan/40 bg-white p-4 transition hover:border-pack-tan hover:shadow-sm"
          >
            <span className="font-medium text-pack-mask">{spec.label}</span>
            <span className="text-xl text-pack-mask/40 transition group-hover:translate-x-1 group-hover:text-pack-mask">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Step 3 — pick specific finds (multi-select + write-in)
// ============================================================
function Step3({ intent, spec }: { intent: IntentDef; spec: SpecOption }) {
  const detail = FIND_DETAILS[spec.value]!;
  return (
    <div className="mx-auto max-w-2xl">
      <StepHeader
        step={3}
        total={4}
        back={`/find?intent=${intent.value}`}
        crumbs={[
          { label: "What you need", href: "/find" },
          { label: intent.cardTitle, href: `/find?intent=${intent.value}` },
          { label: spec.label },
        ]}
      />
      <h1 className="text-3xl font-bold tracking-tight text-pack-mask">
        {detail.question}
      </h1>
      <p className="mt-2 text-sm text-pack-brown">
        Pick any that apply, or write in something not listed.
      </p>

      <form method="GET" action="/find" className="mt-6">
        <input type="hidden" name="intent" value={intent.value} />
        <input type="hidden" name="spec" value={spec.value} />

        <div className="grid gap-2 sm:grid-cols-2">
          {detail.options.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-pack-tan/40 bg-white px-3 py-2 text-sm hover:bg-pack-sand/40 has-[:checked]:border-pack-mask has-[:checked]:bg-pack-mask has-[:checked]:text-pack-cream"
            >
              <input
                type="checkbox"
                name="finds"
                value={opt.value}
                className="accent-pack-mask"
              />
              <span className="flex-1">{opt.label}</span>
              {opt.info && <InfoTooltip>{opt.info}</InfoTooltip>}
            </label>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-pack-tan/40 bg-pack-sand/30 p-3">
          <label
            htmlFor="other_find"
            className="block text-xs font-medium text-pack-brown"
          >
            Not listed — describe what you need
          </label>
          <input
            id="other_find"
            name="other_find"
            type="text"
            placeholder="e.g., custom industrial precursor"
            className="mt-1 w-full rounded-md border border-pack-tan/40 bg-white px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-md bg-pack-mask px-5 py-2 text-sm font-semibold text-pack-cream hover:bg-pack-brown"
          >
            Show me results →
          </button>
          <Link
            href={`/find?intent=${intent.value}&spec=${spec.value}&finds=skip`}
            className="rounded-md border border-pack-tan/40 bg-white px-5 py-2 text-sm hover:bg-pack-sand/40"
          >
            Skip — show all
          </Link>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// Step 4 — Results, filtered + distance-aware
// ============================================================
async function Results({
  intent,
  spec,
  finds,
  otherFind,
}: {
  intent: IntentDef;
  spec: SpecOption;
  finds: string[];
  otherFind: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Profiles matching the role + (optional) tag. We embed each handler's
  // dogs so we can match on declared detection capabilities below.
  let query = supabase
    .from("profiles")
    .select("*, dogs(detection_capabilities)")
    .eq("role", intent.role);
  if (spec.tagFilter) {
    query = query.contains("tags", [spec.tagFilter]);
  }
  type ProfileWithDogs = Profile & {
    dogs: { detection_capabilities: string[] | null }[] | null;
  };
  const { data: rawProfiles, error } =
    await query.returns<ProfileWithDogs[]>();

  // Expand "standard-explosives" / "standard-narcotics" to constituent
  // substances. Filtering uses these to match against dog declarations.
  const expandedFinds = expandStandardFinds(finds);

  // If the user picked specific substances, filter by dog capabilities.
  // Lenient: handlers with NO dogs (or no declared capabilities on any dog)
  // are still included — they get the benefit of the doubt. Once a handler
  // declares any capabilities on a dog, we require overlap with the request.
  let filteredByCapability: ProfileWithDogs[] = rawProfiles ?? [];
  const usingSubstanceFilter =
    expandedFinds.length > 0 &&
    (spec.value === "explosives" || spec.value === "narcotics");
  if (usingSubstanceFilter) {
    const requested = new Set(expandedFinds);
    filteredByCapability = (rawProfiles ?? []).filter((p) => {
      const allDogCaps = (p.dogs ?? []).flatMap(
        (d) => d.detection_capabilities ?? []
      );
      if (allDogCaps.length === 0) return true;
      return allDogCaps.some((c) => requested.has(c));
    });
  }

  // Viewer's coordinates + radius.
  let viewerCoords: { lat: number; lng: number } | null = null;
  let viewerRadius = 120;
  if (user) {
    const { data: me } = await supabase
      .from("profiles")
      .select("latitude, longitude, search_radius_miles")
      .eq("id", user.id)
      .maybeSingle<{
        latitude: number | null;
        longitude: number | null;
        search_radius_miles: number | null;
      }>();
    if (
      me &&
      typeof me.latitude === "number" &&
      typeof me.longitude === "number"
    ) {
      viewerCoords = { lat: me.latitude, lng: me.longitude };
    }
    viewerRadius = me?.search_radius_miles ?? 120;
  }

  // Compute distances. Iterate the capability-filtered list.
  type WithDist = { profile: Profile; distance: number | null };
  const withDist: WithDist[] = filteredByCapability.map((p) => {
    let d: number | null = null;
    if (
      viewerCoords &&
      typeof p.latitude === "number" &&
      typeof p.longitude === "number"
    ) {
      d = haversineMiles(
        viewerCoords.lat,
        viewerCoords.lng,
        p.latitude,
        p.longitude
      );
    }
    return { profile: p, distance: d };
  });

  // Filter by radius if we have viewer coords. Profiles without coords are
  // included with no distance (shown at the bottom).
  const filtered: WithDist[] = viewerCoords
    ? withDist.filter((w) => w.distance === null || w.distance <= viewerRadius)
    : withDist;

  filtered.sort((a, b) => {
    if (a.distance === null && b.distance === null) return 0;
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });

  const isTrainingDog = intent.value === "get-training";
  const backHref = FIND_DETAILS[spec.value]
    ? `/find?intent=${intent.value}${isTrainingDog ? "&who=dog" : ""}&spec=${spec.value}`
    : `/find?intent=${intent.value}${isTrainingDog ? "&who=dog" : ""}`;

  return (
    <div className="mx-auto max-w-3xl">
      <StepHeader
        step={4}
        total={4}
        back={backHref}
        crumbs={[
          { label: "What you need", href: "/find" },
          { label: intent.cardTitle, href: `/find?intent=${intent.value}` },
          {
            label: spec.label,
            href: FIND_DETAILS[spec.value]
              ? `/find?intent=${intent.value}&spec=${spec.value}`
              : undefined,
          },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight text-pack-mask">
        {filtered.length} {ROLE_LABELS[intent.role].toLowerCase()}
        {filtered.length === 1 ? "" : "s"} matched
      </h1>

      {(finds.length > 0 || otherFind) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-pack-brown/70">
            Needs to find:
          </span>
          {finds.map((f) => (
            <span
              key={f}
              className="rounded-full bg-pack-sand/70 px-2.5 py-0.5 text-xs font-medium text-pack-brown ring-1 ring-inset ring-pack-tan/40"
            >
              {getFindLabel(spec.value, f)}
            </span>
          ))}
          {otherFind && (
            <span className="rounded-full bg-pack-cream px-2.5 py-0.5 text-xs font-medium text-pack-brown ring-1 ring-inset ring-pack-tan/40">
              {otherFind}
            </span>
          )}
        </div>
      )}

      {!user ? (
        <div className="mt-4 rounded-md border border-pack-tan/40 bg-pack-sand/30 p-3 text-sm text-pack-brown">
          <Link href="/login" className="font-medium text-pack-mask underline">
            Log in
          </Link>{" "}
          and add your location to filter results by distance.
        </div>
      ) : !viewerCoords ? (
        <div className="mt-4 rounded-md border border-pack-tan/40 bg-pack-sand/30 p-3 text-sm text-pack-brown">
          Showing all matches.{" "}
          <Link
            href="/profile/edit"
            className="font-medium text-pack-mask underline"
          >
            Set your map coordinates
          </Link>{" "}
          on your profile to filter within {viewerRadius} miles.
        </div>
      ) : (
        <p className="mt-4 text-sm text-pack-brown">
          Showing matches within {viewerRadius} miles of your location, nearest
          first.{" "}
          <Link href="/profile/edit" className="text-pack-mask underline">
            Change radius
          </Link>
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </div>
      )}

      <div className="mt-6">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-pack-tan/40 bg-white p-8 text-center text-sm text-pack-brown">
            No matches{" "}
            {viewerCoords ? `within ${viewerRadius} miles` : "found"}. Try{" "}
            {viewerCoords ? (
              <>
                <Link
                  href="/profile/edit"
                  className="font-medium text-pack-mask underline"
                >
                  widening your radius
                </Link>{" "}
                or{" "}
              </>
            ) : null}
            <Link
              href={backHref}
              className="font-medium text-pack-mask underline"
            >
              going back a step
            </Link>
            .
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {filtered.map(({ profile, distance }) => (
              <li key={profile.id} className="relative">
                <ProfileCard profile={profile} />
                {distance !== null && (
                  <span className="absolute right-3 top-3 rounded-full bg-pack-mask/90 px-2 py-0.5 text-[11px] font-semibold text-pack-cream">
                    {Math.round(distance)} mi
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
