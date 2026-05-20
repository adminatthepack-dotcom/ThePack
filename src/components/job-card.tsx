// Compact job posting card used in the marketplace list.
import Link from "next/link";
import type { JobPost } from "@/types/database";
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_BADGE,
  CATEGORY_BADGE,
  getCategoryLabel,
  getCapabilityLabel,
} from "@/lib/marketplace";

export default function JobCard({ job }: { job: JobPost }) {
  const allCaps = [
    ...job.required_capabilities,
    ...(job.other_capability ? [`__OTHER__:${job.other_capability}`] : []),
  ];

  return (
    <Link
      href={`/marketplace/${job.id}`}
      className="block rounded-lg border border-pack-tan/40 bg-white p-5 transition hover:border-pack-tan hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-pack-mask">{job.title}</h3>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${JOB_STATUS_BADGE[job.status]}`}
          >
            {JOB_STATUS_LABELS[job.status]}
          </span>
        </div>
      </div>

      <div className="mt-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${CATEGORY_BADGE[job.category]}`}
        >
          {getCategoryLabel(job.category)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-pack-brown">
        {job.location && <span>📍 {job.location}</span>}
        {job.pay && <span>💵 {job.pay}</span>}
        {job.duration && <span>⏱ {job.duration}</span>}
        {(job.start_date || job.end_date) && (
          <span>
            🗓 {job.start_date ?? "?"}
            {job.end_date ? ` → ${job.end_date}` : ""}
          </span>
        )}
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-pack-mask/80">
        {job.description}
      </p>

      {allCaps.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {allCaps.slice(0, 4).map((c) =>
            c.startsWith("__OTHER__:") ? (
              <span
                key={c}
                className="rounded-full bg-pack-cream px-2 py-0.5 text-[11px] font-medium text-pack-brown ring-1 ring-inset ring-pack-tan/40"
              >
                {c.replace("__OTHER__:", "")}
              </span>
            ) : (
              <span
                key={c}
                className="rounded-full bg-pack-sand/70 px-2 py-0.5 text-[11px] font-medium text-pack-brown ring-1 ring-inset ring-pack-tan/40"
              >
                {getCapabilityLabel(c)}
              </span>
            )
          )}
          {allCaps.length > 4 && (
            <span className="rounded-full bg-pack-cream px-2 py-0.5 text-[11px] text-pack-brown/70">
              +{allCaps.length - 4}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
