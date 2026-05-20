// Compact dog card used to list dogs on a profile.
import Link from "next/link";
import type { Dog } from "@/types/database";
import {
  DOG_STATUS_LABELS,
  DOG_STATUS_BADGE,
  DOG_SEX_LABELS,
  ageFromDOB,
} from "@/lib/dogs";

export default function DogCard({ dog }: { dog: Dog }) {
  const age = ageFromDOB(dog.date_of_birth);
  const meta = [
    dog.breed,
    dog.sex ? DOG_SEX_LABELS[dog.sex] : null,
    age,
  ].filter(Boolean);
  return (
    <Link
      href={`/dogs/${dog.id}`}
      className="block rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-200">
          {dog.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dog.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
              🐕
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium">{dog.name}</span>
            {dog.call_name && (
              <span className="truncate text-xs text-neutral-500">
                &ldquo;{dog.call_name}&rdquo;
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${DOG_STATUS_BADGE[dog.status]}`}
            >
              {DOG_STATUS_LABELS[dog.status]}
            </span>
          </div>
          {meta.length > 0 && (
            <div className="mt-0.5 text-xs text-neutral-600">
              {meta.join(" · ")}
            </div>
          )}
          {dog.bio && (
            <p className="mt-1 line-clamp-2 text-sm text-neutral-700">
              {dog.bio}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
