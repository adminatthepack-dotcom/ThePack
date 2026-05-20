// Renders a list of tag values as small chips, using their human labels.
import { getTagLabel } from "@/lib/tags";

export default function TagList({
  tags,
  limit,
  size = "sm",
}: {
  tags: string[];
  limit?: number;
  size?: "sm" | "md";
}) {
  if (!tags || tags.length === 0) return null;
  const shown = limit ? tags.slice(0, limit) : tags;
  const overflow = limit ? Math.max(0, tags.length - limit) : 0;
  const cls =
    size === "md"
      ? "px-2.5 py-1 text-xs"
      : "px-2 py-0.5 text-[11px]";

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((t) => (
        <span
          key={t}
          className={`rounded-full bg-neutral-100 font-medium text-neutral-700 ring-1 ring-inset ring-neutral-200 ${cls}`}
        >
          {getTagLabel(t)}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={`rounded-full bg-neutral-50 text-neutral-500 ring-1 ring-inset ring-neutral-200 ${cls}`}
        >
          +{overflow} more
        </span>
      )}
    </div>
  );
}
