// Centralized definitions for the user roles.
export type Role =
  | "handler"
  | "breeder"
  | "employer"
  | "customer"
  | "trainer"
  | "veterinarian"
  | "certification_agency"
  | "transporter";

export const ROLES: Role[] = [
  "handler",
  "breeder",
  "trainer",
  "veterinarian",
  "transporter",
  "employer",
  "customer",
  "certification_agency",
];

export const ROLE_LABELS: Record<Role, string> = {
  handler: "K9 Handler",
  breeder: "Breeder",
  employer: "Employer",
  customer: "Customer",
  trainer: "Trainer",
  veterinarian: "Veterinarian",
  certification_agency: "Certification Agency",
  transporter: "Transporter",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  handler: "I train, handle, or care for working or sport dogs.",
  breeder: "I breed dogs and want to connect with buyers and partners.",
  employer: "I hire handlers, security teams, or trainers.",
  customer: "I'm looking for dogs, services, or trained partners.",
  trainer: "I train dogs or teach handlers, in any discipline.",
  veterinarian: "I provide veterinary care, especially for working dogs.",
  certification_agency:
    "We issue certifications for handlers, dogs, or trainers.",
  transporter:
    "I transport working dogs between owners, facilities, or events.",
};

// Small Tailwind classes for the role chip used in cards/headers.
export const ROLE_BADGE_CLASSES: Record<Role, string> = {
  handler: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  breeder: "bg-amber-100 text-amber-800 ring-amber-200",
  employer: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  customer: "bg-rose-100 text-rose-800 ring-rose-200",
  trainer: "bg-sky-100 text-sky-800 ring-sky-200",
  veterinarian: "bg-teal-100 text-teal-800 ring-teal-200",
  certification_agency: "bg-violet-100 text-violet-800 ring-violet-200",
  transporter: "bg-orange-100 text-orange-800 ring-orange-200",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}
