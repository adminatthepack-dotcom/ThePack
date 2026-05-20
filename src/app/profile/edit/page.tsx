import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Certification, Dog } from "@/types/database";
import {
  saveProfile,
  geocodeMyLocation,
  clearMyCoordinates,
  requestInstructorTag,
} from "./actions";
import AvatarUploader from "@/components/avatar-uploader";
import ProfileSharePanel from "@/components/profile-share-panel";
import RoleTagsCertFields from "@/components/role-tags-cert-fields";
import CertificationsSection from "@/components/certifications-section";
import DogCard from "@/components/dog-card";
import { roleCanOwnDogs } from "@/lib/dogs";

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; geo_warning?: string }>;
}) {
  const { saved, error, geo_warning } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <p className="mt-2 text-sm text-neutral-600">
          We couldn&apos;t find your profile row.{" "}
          <Link href="/signup" className="underline">
            Try signing up again
          </Link>
          .
        </p>
      </div>
    );
  }

  const { data: certs } = await supabase
    .from("certifications")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .returns<Certification[]>();

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false })
    .returns<Dog[]>();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
        <Link
          href={`/profile/${profile.id}`}
          className="text-sm text-neutral-700 underline hover:text-neutral-900"
        >
          View public page →
        </Link>
      </div>
      <p className="mt-2 text-sm text-neutral-600">
        This information is shown to anyone browsing the directory.
      </p>

      {saved && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Profile saved.
        </div>
      )}
      {geo_warning && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          ⚠️ {decodeURIComponent(geo_warning)}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-5">
        <div className="text-sm font-medium">Profile photo</div>
        <div className="mt-3">
          <AvatarUploader userId={profile.id} currentUrl={profile.avatar_url} />
        </div>
      </div>

      <form action={saveProfile} className="mt-6 space-y-5">
        <RoleTagsCertFields
          defaultRole={profile.role}
          defaultTags={profile.tags ?? []}
          defaultDetectionCapabilities={profile.detection_capabilities ?? []}
          defaultCertMeaning={profile.cert_meaning}
          defaultCertAudience={profile.cert_audience}
          defaultCertRequirements={profile.cert_requirements}
        />

        <div>
          <label htmlFor="full_name" className="block text-sm font-medium">
            Full name / organization name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            defaultValue={profile.full_name ?? ""}
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="City, State / Country"
            defaultValue={profile.location ?? ""}
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3 rounded-md border border-pack-tan/40 bg-pack-sand/30 px-3 py-2 text-xs">
            {typeof profile.latitude === "number" &&
            typeof profile.longitude === "number" ? (
              <>
                <span className="text-pack-brown">
                  📍 Map coords set ({profile.latitude.toFixed(3)},{" "}
                  {profile.longitude.toFixed(3)})
                </span>
              </>
            ) : (
              <span className="text-pack-brown">
                📍 Map coords not set — search results won&apos;t be
                distance-filtered.
              </span>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="search_radius_miles"
            className="block text-sm font-medium"
          >
            Search radius (miles)
          </label>
          <input
            id="search_radius_miles"
            name="search_radius_miles"
            type="number"
            min={10}
            max={500}
            step={10}
            defaultValue={profile.search_radius_miles ?? 120}
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 sm:w-32"
          />
          <p className="mt-1 text-xs text-neutral-500">
            How far you&apos;ll travel — used by the guided search results.
            Between 10 and 500.
          </p>
        </div>

        <fieldset className="rounded-lg border border-pack-tan/40 bg-white p-4">
          <legend className="px-1 text-sm font-medium">Notifications</legend>
          <div className="space-y-3">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="notify_on_bids"
                defaultChecked={profile.notify_on_bids ?? true}
                className="mt-1 accent-pack-mask"
              />
              <span>
                <span className="font-medium">Notify me about bids</span>
                <span className="block text-xs text-pack-brown">
                  Get a notification when someone bids on a job you posted.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="notify_on_matching_jobs"
                defaultChecked={profile.notify_on_matching_jobs ?? true}
                className="mt-1 accent-pack-mask"
              />
              <span>
                <span className="font-medium">
                  Notify me about matching jobs
                </span>
                <span className="block text-xs text-pack-brown">
                  When a new marketplace job&apos;s required capabilities
                  overlap with your profile tags (e.g., narcotics handler
                  alerted on a narcotics detection contract).
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="notify_on_messages"
                defaultChecked={profile.notify_on_messages ?? true}
                className="mt-1 accent-pack-mask"
              />
              <span>
                <span className="font-medium">Notify me about messages</span>
                <span className="block text-xs text-pack-brown">
                  Get a 🔔 alert when someone sends you a direct message.
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={5}
            defaultValue={profile.bio ?? ""}
            placeholder="Tell people about yourself, your dogs, your specialties…"
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contact_email"
              className="block text-sm font-medium"
            >
              Contact email
            </label>
            <input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={profile.contact_email ?? ""}
              className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium">
              Website
            </label>
            <input
              id="website"
              name="website"
              type="url"
              placeholder="https://"
              defaultValue={profile.website ?? ""}
              className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Save profile
        </button>
      </form>

      <section className="mt-8 rounded-lg border border-pack-tan/40 bg-white p-5">
        <h2 className="text-sm font-semibold text-pack-mask">
          Map coordinates
        </h2>
        {!profile.location ? (
          <p className="mt-1 text-xs text-pack-brown">
            Set your Location above and click <b>Save profile</b> — we&apos;ll
            look up your coordinates automatically.
          </p>
        ) : typeof profile.latitude !== "number" ? (
          <p className="mt-1 text-xs text-pack-brown">
            We couldn&apos;t resolve coordinates for{" "}
            <b>&ldquo;{profile.location}&rdquo;</b>. Try a more specific
            address (e.g., &ldquo;New Orleans, LA&rdquo;) and save again, or
            retry below.
          </p>
        ) : (
          <p className="mt-1 text-xs text-pack-brown">
            Used by the guided search to filter results within your{" "}
            {profile.search_radius_miles ?? 120}-mile radius.
          </p>
        )}
        {profile.location && (
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={geocodeMyLocation}>
              <button
                type="submit"
                className="rounded-md bg-pack-mask px-3 py-1.5 text-sm font-semibold text-pack-cream hover:bg-pack-brown"
              >
                {typeof profile.latitude === "number"
                  ? "Re-fetch coordinates"
                  : "Try again"}
              </button>
            </form>
            {typeof profile.latitude === "number" && (
              <form action={clearMyCoordinates}>
                <button
                  type="submit"
                  className="rounded-md border border-pack-tan/40 bg-white px-3 py-1.5 text-sm hover:bg-pack-sand/40"
                >
                  Clear coordinates
                </button>
              </form>
            )}
          </div>
        )}
      </section>

      {roleCanOwnDogs(profile.role) && (
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Your dogs</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Each dog gets its own page with a bio, certifications, training
              log, and (only visible to you) vet records and ownership
              documents.
            </p>
          </div>
          <Link
            href="/dogs/new"
            className="shrink-0 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            + Add a dog
          </Link>
        </div>
        {dogs && dogs.length > 0 ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {dogs.map((d) => (
              <li key={d.id}>
                <DogCard dog={d} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            No dogs added yet.
          </p>
        )}
      </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Documents</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Your resume, certifications, licenses, references — anything you
          want visible on your profile. Issuer and date are optional.
        </p>
        <div className="mt-4">
          <CertificationsSection userId={profile.id} initial={certs ?? []} />
        </div>
      </section>

      {/* Share panel — provider roles only */}
      {profile.role !== "customer" && (
        <ProfileSharePanel
          profileUrl={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/profile/${profile.id}`}
        />
      )}

      {/* Instructor credentials — handlers and employers only */}
      {(profile.role === "handler" || profile.role === "employer") && (
        <section className="mt-8 rounded-lg border border-pack-tan/40 bg-white p-5">
          <h2 className="text-sm font-semibold text-pack-mask">Instructor credentials</h2>
          <p className="mt-1 text-xs text-pack-brown">
            Handlers and employers who teach other handlers can apply for the
            Instructor tag. Once approved by The Pack, your profile will appear
            in &ldquo;Get training → For myself / For my team&rdquo; results.
          </p>

          {(profile as { instructor_status?: string }).instructor_status === "approved" ? (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
              ✓ Instructor tag approved
            </div>
          ) : (profile as { instructor_status?: string }).instructor_status === "pending" ? (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
              ⏳ Instructor request pending review
            </div>
          ) : (
            <form action={requestInstructorTag} className="mt-3">
              <button
                type="submit"
                className="rounded-md border border-pack-tan/40 bg-pack-sand/40 px-4 py-2 text-sm font-medium text-pack-mask hover:border-pack-tan hover:bg-pack-sand"
              >
                Request Instructor credentials
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
