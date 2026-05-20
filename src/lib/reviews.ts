// Which roles can receive reviews. Reviews are most meaningful for
// service providers — people the community actually works with.
import type { Role } from "@/lib/roles";

const REVIEWABLE: Role[] = [
  "handler",
  "employer",
  "veterinarian",
  "transporter",
];

export function roleCanBeReviewed(role: Role): boolean {
  return REVIEWABLE.includes(role);
}
