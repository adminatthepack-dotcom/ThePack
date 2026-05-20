// Marketplace constants: categories, capabilities, and status helpers.

export const JOB_CATEGORIES = [
  { value: "detection", label: "Detection" },
  { value: "security", label: "Security & Patrol" },
  { value: "sar", label: "Search & Rescue" },
  { value: "training", label: "Training" },
  { value: "transport", label: "Transport" },
  { value: "events", label: "Events" },
  { value: "breeding", label: "Breeding" },
  { value: "other", label: "Other" },
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number]["value"];

const VALID_CATEGORIES = new Set<string>(
  JOB_CATEGORIES.map((c) => c.value)
);

export function isJobCategory(v: unknown): v is JobCategory {
  return typeof v === "string" && VALID_CATEGORIES.has(v);
}

export function getCategoryLabel(value: string): string {
  return JOB_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export const CATEGORY_BADGE: Record<JobCategory, string> = {
  detection: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  security: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  sar: "bg-rose-100 text-rose-800 ring-rose-200",
  training: "bg-sky-100 text-sky-800 ring-sky-200",
  transport: "bg-amber-100 text-amber-800 ring-amber-200",
  events: "bg-violet-100 text-violet-800 ring-violet-200",
  breeding: "bg-teal-100 text-teal-800 ring-teal-200",
  other: "bg-neutral-100 text-neutral-700 ring-neutral-200",
};

export const JOB_CAPABILITIES = [
  { value: "explosives", label: "Explosives detection" },
  { value: "narcotics", label: "Narcotics detection" },
  { value: "firearms", label: "Firearms detection" },
  { value: "tracking", label: "Tracking / suspect search" },
  { value: "patrol", label: "Patrol / protection" },
  { value: "sar-live", label: "Search & rescue (live find)" },
  { value: "cadaver", label: "Cadaver (HRD)" },
  { value: "currency", label: "Currency / contraband" },
  { value: "wildlife", label: "Wildlife / invasive species" },
  { value: "medical", label: "Medical alert (bedbugs, mold, etc.)" },
  { value: "general", label: "General handling — no specialty required" },
] as const;

export type JobCapability = (typeof JOB_CAPABILITIES)[number]["value"];

const VALID_CAPABILITIES = new Set<string>(
  JOB_CAPABILITIES.map((c) => c.value)
);

export function getCapabilityLabel(value: string): string {
  return JOB_CAPABILITIES.find((c) => c.value === value)?.label ?? value;
}

export function filterJobCapabilities(values: string[]): string[] {
  return values.filter((v) => VALID_CAPABILITIES.has(v));
}

export const JOB_STATUSES = ["open", "closed", "awarded"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  open: "Open for bids",
  closed: "Closed",
  awarded: "Awarded",
};

export const JOB_STATUS_BADGE: Record<JobStatus, string> = {
  open: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  closed: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  awarded: "bg-amber-100 text-amber-800 ring-amber-200",
};

export function isJobStatus(v: unknown): v is JobStatus {
  return typeof v === "string" && (JOB_STATUSES as readonly string[]).includes(v);
}

export const BID_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
] as const;
export type BidStatus = (typeof BID_STATUSES)[number];

export const BID_STATUS_LABELS: Record<BidStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Not selected",
  withdrawn: "Withdrawn",
};

export const BID_STATUS_BADGE: Record<BidStatus, string> = {
  pending: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  accepted: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  rejected: "bg-rose-100 text-rose-800 ring-rose-200",
  withdrawn: "bg-neutral-100 text-neutral-500 ring-neutral-200",
};

export function isBidStatus(v: unknown): v is BidStatus {
  return typeof v === "string" && (BID_STATUSES as readonly string[]).includes(v);
}
