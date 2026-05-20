import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  DOG_STATUSES,
  DOG_STATUS_LABELS,
  DOG_SEX_OPTIONS,
  DOG_SEX_LABELS,
  roleCanOwnDogs,
} from "@/lib/dogs";
import type { Profile } from "@/types/database";
import { createDog } from "./actions";
import DetectionCapabilitiesField from "@/components/detection-capabilities-field";

const inputCls =
  "mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900";

export default async function NewDogPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/dogs/new");
  }

  // Block users whose role doesn't own dogs (vets, certification agencies).
  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<Pick<Profile, "role">>();
  if (ownerProfile && !roleCanOwnDogs(ownerProfile.role)) {
    redirect("/profile/edit");
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/profile/edit"
        className="text-sm text-neutral-600 hover:text-neutral-900"
      >
        ← Back to my profile
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Add a dog</h1>
      <p className="mt-1 text-sm text-neutral-600">
        You can fill in just the name now and add more later.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createDog} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Registered name <span className="text-red-700">*</span>
          </label>
          <input id="name" name="name" type="text" required className={inputCls} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="call_name" className="block text-sm font-medium">
              Call name
            </label>
            <input id="call_name" name="call_name" type="text" className={inputCls} />
          </div>
          <div>
            <label htmlFor="breed" className="block text-sm font-medium">
              Breed
            </label>
            <input id="breed" name="breed" type="text" className={inputCls} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="sex" className="block text-sm font-medium">
              Sex
            </label>
            <select id="sex" name="sex" defaultValue="" className={inputCls}>
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
            <input id="date_of_birth" name="date_of_birth" type="date" className={inputCls} />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium">
              Status
            </label>
            <select id="status" name="status" defaultValue="active" className={inputCls}>
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
            <input id="color" name="color" type="text" className={inputCls} />
          </div>
          <div>
            <label htmlFor="registration" className="block text-sm font-medium">
              Registration #
            </label>
            <input id="registration" name="registration" type="text" placeholder="e.g., AKC, FCI" className={inputCls} />
          </div>
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            placeholder="Briefly describe this dog's background, drives, lineage, accomplishments…"
            className={inputCls}
          />
        </div>
        <div className="rounded-lg border border-pack-tan/40 bg-white p-5">
          <h3 className="text-sm font-semibold text-pack-mask">
            Detection capabilities
          </h3>
          <div className="mt-3">
            <DetectionCapabilitiesField defaultValues={[]} />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Add dog
        </button>
      </form>
    </div>
  );
}
