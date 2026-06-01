// Configuration for the /find guided wizard.
// Each intent maps to a directory role. Most intents have a list of
// specializations (which become a tag filter). A few specializations have
// a deeper "what should the dog find?" step (explosives, narcotics).
import type { Role } from "@/lib/roles";

export type SpecOption = {
  value: string;
  label: string;
  // Tag value that profiles must have for results. Omit for "any/all" options
  // that should skip the tag filter entirely.
  tagFilter?: string;
};

export type IntentDef = {
  value: string;
  cardTitle: string;
  hint: string;
  role: Role;
  specsQuestion: string;
  specs: SpecOption[];
  hideForRoles?: Role[];
};

export const FIND_INTENTS: IntentDef[] = [
  {
    value: "hire-handler",
    cardTitle: "Hire a K9 handler",
    hint: "Detection, protection, patrol, search & rescue.",
    role: "handler",
    hideForRoles: ["handler"],
    specsQuestion: "What kind of work do you need?",
    specs: [
      { value: "explosives", label: "Explosives detection", tagFilter: "explosives" },
      { value: "narcotics", label: "Narcotics detection", tagFilter: "narcotics" },
      { value: "firearms", label: "Firearms detection", tagFilter: "firearms" },
      { value: "tracking", label: "Tracking / suspect search", tagFilter: "tracking" },
      { value: "patrol", label: "Patrol / protection", tagFilter: "patrol" },
      { value: "sar-live", label: "Search & rescue (live find)", tagFilter: "sar-live" },
      { value: "cadaver", label: "Cadaver (HRD)", tagFilter: "cadaver" },
      { value: "currency", label: "Currency / contraband", tagFilter: "currency" },
      { value: "service", label: "Service dog work", tagFilter: "service" },
      { value: "dual-purpose", label: "Dual-purpose", tagFilter: "dual-purpose" },
      { value: "any", label: "I'm not sure yet — show all handlers" },
    ],
  },
  {
    value: "find-dog",
    cardTitle: "Find a working-line dog",
    hint: "Breeders, started prospects, fully trained dogs.",
    role: "breeder",
    hideForRoles: ["breeder"],
    specsQuestion: "What breed are you most interested in?",
    specs: [
      { value: "german-shepherd", label: "German Shepherd", tagFilter: "german-shepherd" },
      { value: "belgian-malinois", label: "Belgian Malinois", tagFilter: "belgian-malinois" },
      { value: "dutch-shepherd", label: "Dutch Shepherd", tagFilter: "dutch-shepherd" },
      { value: "labrador", label: "Labrador Retriever", tagFilter: "labrador" },
      { value: "any", label: "Open to any breed" },
    ],
  },
  {
    value: "get-training",
    cardTitle: "Get training",
    hint: "For you, your dog, or your team.",
    role: "trainer",
    hideForRoles: ["trainer"],
    specsQuestion: "What discipline?",
    specs: [
      { value: "protection", label: "Protection / patrol", tagFilter: "trainer-protection" },
      { value: "detection", label: "Detection", tagFilter: "trainer-detection" },
      { value: "obedience", label: "Obedience", tagFilter: "trainer-obedience" },
      { value: "puppy", label: "Puppy development", tagFilter: "trainer-puppy" },
      { value: "sport", label: "Sport (IGP / PSA / Mondio)", tagFilter: "trainer-sport" },
      { value: "sar", label: "Search & rescue", tagFilter: "trainer-sar" },
      { value: "service", label: "Service dog training", tagFilter: "trainer-service" },
      { value: "behavior", label: "Behavior modification", tagFilter: "trainer-behavior" },
      { value: "board-train", label: "Board & train program", tagFilter: "trainer-board-train" },
      { value: "any", label: "Not sure yet — show all trainers" },
    ],
  },
  {
    value: "find-vet",
    cardTitle: "Find a veterinarian",
    hint: "Working-dog medicine, sports med, rehab, reproduction.",
    role: "veterinarian",
    hideForRoles: ["veterinarian"],
    specsQuestion: "What kind of care?",
    specs: [
      { value: "working", label: "Working dog medicine", tagFilter: "vet-working-dog" },
      { value: "sports", label: "Sports medicine", tagFilter: "vet-sports-med" },
      { value: "emergency", label: "Emergency / critical care", tagFilter: "vet-emergency" },
      { value: "reproduction", label: "Reproduction & breeding", tagFilter: "vet-reproduction" },
      { value: "ortho", label: "Orthopedics", tagFilter: "vet-ortho" },
      { value: "rehab", label: "Rehab & physical therapy", tagFilter: "vet-rehab" },
      { value: "general", label: "General practice", tagFilter: "vet-general" },
      { value: "any", label: "Show all veterinarians" },
    ],
  },
  {
    value: "transport",
    cardTitle: "Transport a dog",
    hint: "Ground, air, or escort — local, cross-country, or international.",
    role: "transporter",
    hideForRoles: ["transporter"],
    specsQuestion: "What kind of transport do you need?",
    specs: [
      { value: "ground", label: "Ground transport", tagFilter: "trans-ground" },
      { value: "air-cargo", label: "Air cargo coordination", tagFilter: "trans-air-cargo" },
      { value: "nanny-flight", label: "Nanny / escort flight (flies with dog)", tagFilter: "trans-nanny-flight" },
      { value: "local", label: "Local / regional", tagFilter: "trans-local" },
      { value: "cross-country", label: "Cross-country", tagFilter: "trans-cross-country" },
      { value: "international", label: "International (import/export)", tagFilter: "trans-international" },
      { value: "puppy", label: "Puppy / litter transport", tagFilter: "trans-puppies" },
      { value: "any", label: "Show all transporters" },
    ],
  },
  {
    value: "board-dog",
    cardTitle: "Board a dog",
    hint: "Short-term holding, layover care, or board-and-train programs.",
    role: "transporter",
    hideForRoles: [],
    specsQuestion: "What kind of boarding do you need?",
    specs: [
      { value: "pre-transport", label: "Pre-transport holding", tagFilter: "trans-pre-transport" },
      { value: "post-transport", label: "Post-transport holding", tagFilter: "trans-post-transport" },
      { value: "layover", label: "Layover / overnight care", tagFilter: "trans-layover-care" },
      { value: "extended", label: "Extended boarding (days / weeks)", tagFilter: "trans-extended-boarding" },
      { value: "any", label: "Show all boarding options" },
    ],
  },
  {
    value: "certify",
    cardTitle: "Get certified",
    hint: "Find a certification agency for your discipline.",
    role: "certification_agency",
    hideForRoles: ["certification_agency"],
    specsQuestion: "What kind of certification?",
    specs: [
      { value: "detection", label: "Detection certifications", tagFilter: "cert-detection" },
      { value: "protection", label: "Protection certifications", tagFilter: "cert-protection" },
      { value: "sar", label: "Search & rescue certifications", tagFilter: "cert-sar" },
      { value: "service-dog", label: "Service dog certifications", tagFilter: "cert-service-dog" },
      { value: "obedience", label: "Obedience / temperament tests", tagFilter: "cert-obedience" },
      { value: "trainer", label: "Trainer credentials", tagFilter: "cert-trainer" },
      { value: "any", label: "Show all certification agencies" },
    ],
  },
  {
    value: "hire-employer",
    cardTitle: "Connect with an employer",
    hint: "Detection companies, agencies, academies, and organizations hiring K9 teams.",
    role: "employer",
    hideForRoles: ["employer"],
    specsQuestion: "What type of organization?",
    specs: [
      { value: "detection-company", label: "Detection company", tagFilter: "detection-company" },
      { value: "law-enforcement", label: "Law enforcement agency", tagFilter: "law-enforcement" },
      { value: "government-agency", label: "Government / federal agency", tagFilter: "government-agency" },
      { value: "training-academy", label: "Training academy", tagFilter: "training-academy" },
      { value: "sar-organization", label: "Search & rescue organization", tagFilter: "sar-organization" },
      { value: "sport-club", label: "Sporting / competition club", tagFilter: "sport-club" },
      { value: "private-security", label: "Private security firm", tagFilter: "private-security" },
      { value: "nonprofit", label: "Nonprofit / advocacy", tagFilter: "nonprofit" },
      { value: "any", label: "Show all employers" },
    ],
  },
];

// "What should the dog find?" sub-step — only applies to a few handler specs
// where this level of detail is meaningful.
export type FindOption = {
  value: string;
  label: string;
  // Optional hover-info shown via the InfoTooltip "?" button.
  info?: string;
};
export type FindDetail = { question: string; options: FindOption[] };

export const FIND_DETAILS: Record<string, FindDetail | undefined> = {
  explosives: {
    question: "What specifically should the dog be able to find?",
    options: [
      { value: "tnt", label: "TNT" },
      { value: "rdx", label: "RDX / Composition C-4" },
      { value: "petn", label: "PETN" },
      { value: "smokeless", label: "Smokeless powder" },
      { value: "black-powder", label: "Black powder" },
      { value: "ammonium-nitrate", label: "Ammonium nitrate" },
      { value: "ied", label: "Improvised explosive devices (IEDs)" },
      { value: "firearms", label: "Firearms / spent ammo" },
      {
        value: "standard-explosives",
        label: "All standard explosives (common operational set)",
        info: "Most operational programs train on a core set of 5–7 odors that covers the bulk of real-world threats: TNT, RDX (the binder in C-4 and most plastic explosives), PETN (det cord, Semtex), smokeless powder (firearms ammo), black powder (pipe bombs/pyrotechnics), and ammonium nitrate (improvised devices). Specific sets vary by agency — ask the handler what odors their dog is certified on.",
      },
    ],
  },
  narcotics: {
    question: "What specifically should the dog be able to find?",
    options: [
      { value: "marijuana", label: "Marijuana" },
      { value: "cocaine", label: "Cocaine" },
      { value: "heroin", label: "Heroin" },
      { value: "meth", label: "Methamphetamine" },
      { value: "mdma", label: "MDMA / Ecstasy" },
      { value: "fentanyl", label: "Fentanyl" },
      { value: "pharmaceuticals", label: "Pharmaceuticals" },
      {
        value: "standard-narcotics",
        label: "All standard controlled substances",
        info: "The common operational set is cocaine, heroin, methamphetamine, MDMA, and (in most modern programs) marijuana. Many agencies are also adding fentanyl, though that requires specialized safety protocols. Ask the handler what odors the dog is currently certified on.",
      },
    ],
  },
};

export function getIntent(value: string | undefined): IntentDef | undefined {
  if (!value) return undefined;
  return FIND_INTENTS.find((i) => i.value === value);
}

export function getSpec(
  intent: IntentDef,
  value: string | undefined
): SpecOption | undefined {
  if (!value) return undefined;
  return intent.specs.find((s) => s.value === value);
}

export function getFindLabel(specValue: string, value: string): string {
  const detail = FIND_DETAILS[specValue];
  if (!detail) return value;
  return detail.options.find((o) => o.value === value)?.label ?? value;
}
