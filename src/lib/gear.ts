export const PACK_TAGS = [
  { value: "pack-approved", label: "Pack Approved" },
  { value: "custom", label: "Customize Your Equipment" },
] as const;

export type PackTag = (typeof PACK_TAGS)[number]["value"];

export function isPackTag(v: unknown): v is PackTag {
  return typeof v === "string" && PACK_TAGS.some((t) => t.value === v);
}

export const EQUIPMENT_CATEGORIES = [
  { value: "leashes", label: "Leashes & long lines" },
  { value: "collars", label: "Collars & harnesses" },
  { value: "kennels", label: "Kennels & crates" },
  { value: "vehicle", label: "Vehicle gear" },
  { value: "training-aids", label: "Training aids" },
  { value: "bite-equipment", label: "Bite equipment" },
  { value: "detection-aids", label: "Detection aids" },
  { value: "sport", label: "Sport equipment" },
  { value: "tactical", label: "Tactical / duty" },
  { value: "first-aid", label: "First aid & vet" },
  { value: "apparel", label: "Handler apparel" },
  { value: "other", label: "Other" },
] as const;

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number]["value"];

const VALID_EQUIPMENT_CATEGORIES = new Set<string>(
  EQUIPMENT_CATEGORIES.map((c) => c.value)
);

export function isEquipmentCategory(v: unknown): v is EquipmentCategory {
  return typeof v === "string" && VALID_EQUIPMENT_CATEGORIES.has(v);
}

export function getEquipmentCategoryLabel(value: string): string {
  return (
    EQUIPMENT_CATEGORIES.find((c) => c.value === value)?.label ?? value
  );
}

export const EQUIPMENT_CONDITIONS = [
  "new",
  "like-new",
  "used-excellent",
  "used-good",
  "used-fair",
] as const;
export type EquipmentCondition = (typeof EQUIPMENT_CONDITIONS)[number];

export const EQUIPMENT_CONDITION_LABELS: Record<EquipmentCondition, string> = {
  new: "New",
  "like-new": "Like new",
  "used-excellent": "Used — excellent",
  "used-good": "Used — good",
  "used-fair": "Used — fair",
};

export const EQUIPMENT_STATUS_BADGE: Record<
  "available" | "sold" | "removed",
  string
> = {
  available: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  sold: "bg-neutral-200 text-neutral-700 ring-neutral-300",
  removed: "bg-neutral-100 text-neutral-500 ring-neutral-200",
};
