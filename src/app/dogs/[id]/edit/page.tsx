import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  DOG_STATUSES,
  DOG_STATUS_LABELS,
  DOG_SEX_OPTIONS,
  DOG_SEX_LABELS,
} from "@/lib/dogs";
import type { Dog } from "@/types/database";
import { updateDog, deleteDog } from "./actions";
import DogAvatarUploader from "@/components/dog-avatar-uploader";
import DetectionCapabilitiesField from "@/components/detection-capabilities-field";

const inputCls =
  "mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900";

export default async function EditDogPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dogs/" + id + "/edit");

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .maybeSingle<Dog>();
  if (!dog) notFound();
  if (dog.owner_id !== user.id) {
    // Only owners can edit
    redirect(`/dogs/${id}`);
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href={`/dogs/${dog.id}`}
        className="text-sm text-neutral-600 hover:text-neutral-900"
      >
        ← Back to {dog.name}
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Edit {dog.name}
      </h1>

      {saved && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Saved.
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-5">
        <div className="text-sm font-medium">Photo</div>
        <div className="mt-3">
          <DogAvatarUploader
            ownerId={dog.owner_id}
            dogId={dog.id}
            currentUrl={dog.avatar_url}
          />
        </div>
      </div>

      <form action={updateDog} className="mt-6 space-y-4">
        <input type="hidden" name="id" value={dog.id} />
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Registered name <span className="text-red-700">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={dog.name}
            className={inputCls}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="call_name" className="block text-sm font-medium">
              Call name
            </label>
            <input
              id="call_name"
              name="call_name"
              type="text"
              defaultValue={dog.call_name ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="breed" className="block text-sm font-medium">
              Breed
            </label>
            <input
              id="breed"
              name="breed"
              type="text"
              defaultValue={dog.breed ?? ""}
              className={inputCls}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="sex" className="block text-sm font-medium">
              Sex
            </label>
            <select
              id="sex"
              name="sex"
              defaultValue={dog.sex ?? ""}
              className={inputCls}
            >
              <option value="">—</option>
              {DOG_SEX_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {DOG_SEX_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium">
              Date of birth
            </label>
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              defaultValue={dog.date_of_birth ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={dog.status}
              className={inputCls}
            >
              {DOG_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {DOG_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="color" className="block text-sm font-medium">
              Color
            </label>
            <input
              id="color"
              name="color"
              type="text"
              defaultValue={dog.color ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="registration" className="block text-sm font-medium">
              Registration #
            </label>
            <input
              id="registration"
              name="registration"
              type="text"
              defaultValue={dog.registration ?? ""}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={5}
            defaultValue={dog.bio ?? ""}
            className={inputCls}
          />
        </div>

        <div className="rounded-lg border border-pack-tan/40 bg-white p-5">
          <h3 className="text-sm font-semibold text-pack-mask">
            Detection capabilities
          </h3>
          <div className="mt-3">
            <DetectionCapabilitiesField
              defaultValues={dog.detection_capabilities ?? []}
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Save changes
        </button>
      </form>

      <section className="mt-10 rounded-md border border-red-200 bg-red-50 p-5">
        <h2 className="text-sm font-semibold text-red-900">Danger zone</h2>
        <p className="mt-1 text-sm text-red-800">
          Deleting this dog also removes all of its certifications, training
          entries, vet records, and documents. This can&apos;t be undone.
        </p>
        <form action={deleteDog} className="mt-3">
          <input type="hidden" name="id" value={dog.id} />
          <button
            type="submit"
            className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Delete {dog.name}
          </button>
        </form>
      </section>
    </div>
  );
}
