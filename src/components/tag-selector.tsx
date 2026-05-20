// Checkbox grid for picking tags. Server-rendered, submits as multi-value
// formData with key "tags".
import { TAGS_BY_ROLE } from "@/lib/tags";
import type { Role } from "@/lib/roles";

export default function TagSelector({
  role,
  selected,
}: {
  role: Role;
  selected: string[];
}) {
  const tags = TAGS_BY_ROLE[role];
  const selectedSet = new Set(selected);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {tags.map((t) => (
        <label
          key={t.value}
          className="flex cursor-pointer items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50 has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-900 has-[:checked]:text-white"
        >
          <input
            type="checkbox"
            name="tags"
            value={t.value}
            defaultChecked={selectedSet.has(t.value)}
            className="accent-neutral-900"
          />
          {t.label}
        </label>
      ))}
    </div>
  );
}
