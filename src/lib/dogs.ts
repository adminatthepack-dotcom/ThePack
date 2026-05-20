// Dog-related constants used in forms and display.
import type { Role } from "@/lib/roles";

export const DOG_STATUSES = ["active", "retired", "deceased", "sold"] as const;
export type DogStatus = (typeof DOG_STATUSES)[number];

export const DOG_STATUS_LABELS: Record<DogStatus, string> = {
  active: "Active",
  retired: "Retired",
  deceased: "Deceased",
  sold: "Sold / placed",
};

export const DOG_STATUS_BADGE: Record<DogStatus, string> = {
  active: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  retired: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  deceased: "bg-neutral-100 text-neutral-500 ring-neutral-200",
  sold: "bg-amber-100 text-amber-800 ring-amber-200",
};

export const DOG_SEX_OPTIONS = ["male", "female"] as const;
export type DogSex = (typeof DOG_SEX_OPTIONS)[number];

export const DOG_SEX_LABELS: Record<DogSex, string> = {
  male: "Male",
  female: "Female",
};

export const DOC_TYPES = ["ownership", "breeding", "other"] as const;
export type DocType = (typeof DOC_TYPES)[number];

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  ownership: "Proof of ownership",
  breeding: "Breeding record",
  other: "Other document",
};

export function isDogStatus(v: unknown): v is DogStatus {
  return typeof v === "string" && (DOG_STATUSES as readonly string[]).includes(v);
}
export function isDogSex(v: unknown): v is DogSex {
  return typeof v === "string" && (DOG_SEX_OPTIONS as readonly string[]).includes(v);
}
export function isDocType(v: unknown): v is DocType {
  return typeof v === "string" && (DOC_TYPES as readonly string[]).includes(v);
}

// Roles that own dogs in a meaningful way. Vets treat dogs and cert agencies
// certify them — they don't own them — so we hide the Dogs UI for those roles.
const ROLES_WITHOUT_DOGS: Role[] = ["veterinarian", "certification_agency"];

export function roleCanOwnDogs(role: Role): boolean {
  return !ROLES_WITHOUT_DOGS.includes(role);
}

// Approximate age in years from a YYYY-MM-DD string.
export function ageFromDOB(dob: string | null): string | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const years = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();
  const adjusted =
    monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())
      ? years - 1
      : years;
  if (adjusted < 1) {
    const months = Math.max(
      0,
      (now.getFullYear() - d.getFullYear()) * 12 + monthDiff
    );
    return `${months} mo`;
  }
  return `${adjusted} yr`;
}
