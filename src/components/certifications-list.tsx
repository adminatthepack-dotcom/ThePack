// Read-only public list of someone's certifications, used on profile detail.
import type { Certification } from "@/types/database";

export default function CertificationsList({
  certifications,
}: {
  certifications: Certification[];
}) {
  if (certifications.length === 0) {
    return <p className="text-sm text-neutral-500">No documents posted.</p>;
  }

  return (
    <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white">
      {certifications.map((c) => (
        <li key={c.id} className="px-4 py-3">
          <div className="font-medium">{c.title}</div>
          {(c.issuer || c.issued_date) && (
            <div className="mt-0.5 text-xs text-neutral-600">
              {[c.issuer, c.issued_date].filter(Boolean).join(" · ")}
            </div>
          )}
          <a
            href={c.file_url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-sm text-neutral-700 underline hover:text-neutral-900"
          >
            View document
          </a>
        </li>
      ))}
    </ul>
  );
}
