// Predefined tag catalog, one list per role.
// Add/remove entries here as your community evolves.
import type { Role } from "@/lib/roles";

export type TagDef = { value: string; label: string };

export const TAGS_BY_ROLE: Record<Role, TagDef[]> = {
  // NOTE: handler tag values are intentionally aligned with the marketplace
  // JOB_CAPABILITIES values (see lib/marketplace.ts). When a job is posted
  // with `required_capabilities` like ['explosives'], handlers whose tags
  // include 'explosives' get a notification (array-overlap check).
  handler: [
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
    { value: "service", label: "Service dog work" },
    { value: "sport-igp", label: "Sport (IGP / PSA / Mondio)" },
    { value: "dual-purpose", label: "Dual-purpose" },
  ],
  breeder: [
    { value: "german-shepherd", label: "German Shepherd" },
    { value: "belgian-malinois", label: "Belgian Malinois" },
    { value: "dutch-shepherd", label: "Dutch Shepherd" },
    { value: "labrador", label: "Labrador Retriever" },
    { value: "working-line", label: "Working line" },
    { value: "sport-line", label: "Sport line" },
    { value: "akc-registered", label: "AKC registered" },
    { value: "health-tested", label: "Health tested" },
    { value: "imported", label: "Imported bloodlines" },
  ],
  employer: [
    { value: "hiring-handlers", label: "Hiring handlers" },
    { value: "hiring-trainers", label: "Hiring trainers" },
    { value: "executive-protection", label: "Executive protection" },
    { value: "security", label: "Security services" },
    { value: "training-academy", label: "Training academy" },
    { value: "law-enforcement", label: "Law enforcement" },
    { value: "military", label: "Military" },
  ],
  customer: [
    { value: "want-protection-dog", label: "Looking: protection dog" },
    { value: "want-sport-dog", label: "Looking: sport dog" },
    { value: "want-family-companion", label: "Looking: family companion" },
    { value: "want-service-dog", label: "Looking: service dog" },
    { value: "want-puppy", label: "Looking: puppy" },
    { value: "want-started-dog", label: "Looking: started dog" },
    { value: "want-trained-dog", label: "Looking: fully trained" },
  ],
  trainer: [
    { value: "trainer-protection", label: "Protection / patrol" },
    { value: "trainer-detection", label: "Detection" },
    { value: "trainer-obedience", label: "Obedience" },
    { value: "trainer-puppy", label: "Puppy development" },
    { value: "trainer-sport", label: "Sport (IGP / PSA / Mondio)" },
    { value: "trainer-sar", label: "Search & rescue" },
    { value: "trainer-service", label: "Service dogs" },
    { value: "trainer-behavior", label: "Behavior modification" },
    { value: "trainer-private", label: "Private lessons" },
    { value: "trainer-group", label: "Group classes" },
  ],
  veterinarian: [
    { value: "vet-working-dog", label: "Working dog medicine" },
    { value: "vet-sports-med", label: "Sports medicine" },
    { value: "vet-emergency", label: "Emergency / critical care" },
    { value: "vet-reproduction", label: "Reproduction & breeding" },
    { value: "vet-ortho", label: "Orthopedics" },
    { value: "vet-rehab", label: "Rehab & physical therapy" },
    { value: "vet-nutrition", label: "Nutrition" },
    { value: "vet-general", label: "General practice" },
    { value: "vet-mobile", label: "Mobile / on-site" },
  ],
  certification_agency: [
    { value: "cert-detection", label: "Detection certifications" },
    { value: "cert-protection", label: "Protection certifications" },
    { value: "cert-sar", label: "Search & rescue certifications" },
    { value: "cert-service-dog", label: "Service dog certifications" },
    { value: "cert-obedience", label: "Obedience / temperament tests" },
    { value: "cert-trainer", label: "Trainer credentials" },
    { value: "cert-national", label: "Nationally recognized" },
    { value: "cert-international", label: "International scope" },
  ],
  transporter: [
    { value: "trans-ground", label: "Ground transport" },
    { value: "trans-air", label: "Air / pet cargo arrangements" },
    { value: "trans-climate", label: "Climate-controlled vehicle" },
    { value: "trans-international", label: "International transport" },
    { value: "trans-cross-country", label: "Cross-country routes" },
    { value: "trans-local", label: "Local / regional routes" },
    { value: "trans-overnight", label: "Overnight stays" },
    { value: "trans-litter", label: "Puppy / litter transport" },
    { value: "trans-working", label: "Working-dog specialty" },
    { value: "trans-insured", label: "Fully insured" },
  ],
};

// Flat set for quick "is this a valid tag at all?" checks.
export const ALL_TAG_VALUES: Set<string> = new Set(
  Object.values(TAGS_BY_ROLE).flatMap((list) => list.map((t) => t.value))
);

export function getTagLabel(value: string): string {
  for (const list of Object.values(TAGS_BY_ROLE)) {
    const hit = list.find((t) => t.value === value);
    if (hit) return hit.label;
  }
  return value;
}

// Keep only tags that are valid for the given role.
export function filterTagsForRole(tags: string[], role: Role): string[] {
  const allowed = new Set(TAGS_BY_ROLE[role].map((t) => t.value));
  return tags.filter((t) => allowed.has(t));
}
