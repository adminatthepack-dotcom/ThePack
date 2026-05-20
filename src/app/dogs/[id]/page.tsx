import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type {
  Dog,
  DogCertification,
  DogTrainingEntry,
  DogVetRecord,
  DogDocument,
  DogVetRecordWithUrl,
  DogDocumentWithUrl,
  Profile,
} from "@/types/database";
import {
  DOG_STATUS_LABELS,
  DOG_STATUS_BADGE,
  DOG_SEX_LABELS,
  ageFromDOB,
} from "@/lib/dogs";
import { SUBSTANCE_GROUPS, getSubstanceLabel } from "@/lib/detection";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/roles";
import DogCertificationsSection from "@/components/dog-certifications-section";
import DogTrainingLogSection from "@/components/dog-training-log-section";
import DogVetRecordsSection from "@/components/dog-vet-records-section";
import DogDocumentsSection from "@/components/dog-documents-section";

export default async function DogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .maybeSingle<Dog>();
  if (!dog) notFound();

  const { data: owner } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", dog.owner_id)
    .maybeSingle<Profile>();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === dog.owner_id;

  // Public data
  const { data: certs } = await supabase
    .from("dog_certifications")
    .select("*")
    .eq("dog_id", dog.id)
    .order("issued_date", { ascending: false, nullsFirst: false })
    .returns<DogCertification[]>();

  const { data: training } = await supabase
    .from("dog_training_entries")
    .select("*")
    .eq("dog_id", dog.id)
    .order("entry_date", { ascending: false })
    .returns<DogTrainingEntry[]>();

  // Private data (only fetched + visible when owner)
  let vetRecords: DogVetRecordWithUrl[] = [];
  let documents: DogDocumentWithUrl[] = [];

  if (isOwner) {
    const { data: vetRaw } = await supabase
      .from("dog_vet_records")
      .select("*")
      .eq("dog_id", dog.id)
      .order("record_date", { ascending: false })
      .returns<DogVetRecord[]>();

    vetRecords = await Promise.all(
      (vetRaw ?? []).map(async (r) => {
        let signed_url: string | null = null;
        if (r.file_path) {
          const { data } = await supabase.storage
            .from("dog-private")
            .createSignedUrl(r.file_path, 3600);
          signed_url = data?.signedUrl ?? null;
        }
        return { ...r, signed_url };
      })
    );

    const { data: docsRaw } = await supabase
      .from("dog_documents")
      .select("*")
      .eq("dog_id", dog.id)
      .order("created_at", { ascending: false })
      .returns<DogDocument[]>();

    documents = await Promise.all(
      (docsRaw ?? []).map(async (d) => {
        let signed_url: string | null = null;
        if (d.file_path) {
          const { data } = await supabase.storage
            .from("dog-private")
            .createSignedUrl(d.file_path, 3600);
          signed_url = data?.signedUrl ?? null;
        }
        return { ...d, signed_url };
      })
    );
  }

  const age = ageFromDOB(dog.date_of_birth);
  const meta = [
    dog.breed,
    dog.sex ? DOG_SEX_LABELS[dog.sex] : null,
    age,
    dog.color,
  ].filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl">
      {owner && (
        <Link
          href={`/profile/${owner.id}`}
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          ← Back to {owner.full_name ?? "owner's profile"}
        </Link>
      )}

      <header className="mt-4 flex items-start gap-5">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-200">
          {dog.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dog.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">
              🐕
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold tracking-tight">{dog.name}</h1>
          {dog.call_name && (
            <div className="mt-0.5 text-sm italic text-neutral-600">
              &ldquo;{dog.call_name}&rdquo;
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${DOG_STATUS_BADGE[dog.status]}`}
            >
              {DOG_STATUS_LABELS[dog.status]}
            </span>
            {meta.map((m, i) => (
              <span key={i} className="text-sm text-neutral-600">
                {i > 0 && <span className="mx-1 text-neutral-300">·</span>}
                {m}
              </span>
            ))}
          </div>
          {dog.registration && (
            <div className="mt-1 text-xs text-neutral-500">
              Registration: {dog.registration}
            </div>
          )}
        </div>
        {isOwner && (
          <Link
            href={`/dogs/${dog.id}/edit`}
            className="shrink-0 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            Edit
          </Link>
        )}
      </header>

      {owner && (
        <section className="mt-6 flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-200">
            {owner.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={owner.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
                {(owner.full_name ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide text-neutral-500">
              Owner
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/profile/${owner.id}`}
                className="truncate font-medium hover:underline"
              >
                {owner.full_name ?? "Unknown owner"}
              </Link>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ROLE_BADGE_CLASSES[owner.role]}`}
              >
                {ROLE_LABELS[owner.role]}
              </span>
            </div>
          </div>
        </section>
      )}

      {dog.bio && (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Bio
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-neutral-800">
            {dog.bio}
          </p>
        </section>
      )}

      {dog.detection_capabilities &&
        dog.detection_capabilities.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
              Detection capabilities
            </h2>
            <div className="mt-3 space-y-3">
              {SUBSTANCE_GROUPS.map((group) => {
                const dogHasInGroup = group.substances
                  .map((s) => s.value)
                  .filter((v) => dog.detection_capabilities.includes(v));
                if (dogHasInGroup.length === 0) return null;
                const allStandard = group.standardSet.every((s) =>
                  dog.detection_capabilities.includes(s)
                );
                return (
                  <div key={group.groupKey}>
                    <div className="text-xs font-semibold uppercase tracking-wide text-pack-brown">
                      {group.label}
                      {allStandard && (
                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200">
                          Standard set
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {dogHasInGroup.map((v) => (
                        <span
                          key={v}
                          className="rounded-full bg-pack-sand/60 px-2.5 py-0.5 text-xs font-medium text-pack-brown ring-1 ring-inset ring-pack-tan/40"
                        >
                          {getSubstanceLabel(v)}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Certifications
        </h2>
        <div className="mt-2">
          <DogCertificationsSection
            ownerId={dog.owner_id}
            dogId={dog.id}
            isOwner={isOwner}
            initial={certs ?? []}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Training log
        </h2>
        <div className="mt-2">
          <DogTrainingLogSection
            dogId={dog.id}
            isOwner={isOwner}
            initial={training ?? []}
          />
        </div>
      </section>

      {isOwner && (
        <>
          <section className="mt-10 rounded-lg border border-teal-200 bg-teal-50/40 p-5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium uppercase tracking-wide text-teal-900">
                Vet records
              </h2>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-teal-800 ring-1 ring-inset ring-teal-200">
                Private — only you
              </span>
            </div>
            <p className="mt-1 text-xs text-teal-900/80">
              Files here are stored in a private bucket and only visible to
              you, the owner.
            </p>
            <div className="mt-4">
              <DogVetRecordsSection
                ownerId={dog.owner_id}
                dogId={dog.id}
                initial={vetRecords}
              />
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-violet-200 bg-violet-50/40 p-5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium uppercase tracking-wide text-violet-900">
                Documents
              </h2>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-violet-800 ring-1 ring-inset ring-violet-200">
                Private — only you
              </span>
            </div>
            <p className="mt-1 text-xs text-violet-900/80">
              Proof of ownership, breeding records, and other official
              documents. Private to you.
            </p>
            <div className="mt-4">
              <DogDocumentsSection
                ownerId={dog.owner_id}
                dogId={dog.id}
                initial={documents}
              />
            </div>
          </section>
        </>
      )}
    </article>
  );
}
