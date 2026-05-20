// Card used in the directory list and elsewhere.
import Link from "next/link";
import type { Profile } from "@/types/database";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/roles";
import TagList from "@/components/tag-list";

export default function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Link
      href={`/profile/${profile.id}`}
      className="block rounded-lg border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 hover:shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-neutral-200">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-neutral-500">
              {(profile.full_name ?? "?").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium">
              {profile.full_name ?? "Unnamed user"}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_BADGE_CLASSES[profile.role]}`}
            >
              {ROLE_LABELS[profile.role]}
            </span>
          </div>
          {profile.location && (
            <div className="mt-0.5 text-sm text-neutral-600">
              {profile.location}
            </div>
          )}
          {profile.bio && (
            <p className="mt-2 line-clamp-2 text-sm text-neutral-700">
              {profile.bio}
            </p>
          )}
          {profile.tags && profile.tags.length > 0 && (
            <div className="mt-2">
              <TagList tags={profile.tags} limit={4} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
