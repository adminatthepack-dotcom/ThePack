// Substance vocabulary shared by:
//   - Dog profile edit page (where owners declare what each dog can find)
//   - The /find wizard step 3 (where searchers specify what they need)
// Both sides MUST use the same `value` strings for matching to work.

export type Substance = { value: string; label: string };

export type SubstanceGroup = {
  // Matches handler tag values like "explosives" / "narcotics".
  groupKey: "explosives" | "narcotics";
  label: string;
  info?: string;
  substances: Substance[];
  // Subset that "All standard X" expands to.
  standardSet: string[];
};

export const SUBSTANCE_GROUPS: SubstanceGroup[] = [
  {
    groupKey: "explosives",
    label: "Explosives",
    info: "The common operational set covers TNT, RDX (the binder in C-4 and most plastic explosives), PETN (det cord, Semtex), smokeless and black powders, and ammonium nitrate.",
    substances: [
      { value: "tnt", label: "TNT" },
      { value: "rdx", label: "RDX / Composition C-4" },
      { value: "petn", label: "PETN" },
      { value: "smokeless", label: "Smokeless powder" },
      { value: "black-powder", label: "Black powder" },
      { value: "ammonium-nitrate", label: "Ammonium nitrate" },
      { value: "ied", label: "Improvised explosive devices (IEDs)" },
      { value: "firearms-spent", label: "Firearms / spent ammo" },
    ],
    standardSet: [
      "tnt",
      "rdx",
      "petn",
      "smokeless",
      "black-powder",
      "ammonium-nitrate",
    ],
  },
  {
    groupKey: "narcotics",
    label: "Narcotics",
    info: "The common set is cocaine, heroin, methamphetamine, MDMA, and marijuana. Fentanyl is added in some programs but requires specialized safety protocols.",
    substances: [
      { value: "cocaine", label: "Cocaine" },
      { value: "heroin", label: "Heroin" },
      { value: "meth", label: "Methamphetamine" },
      { value: "marijuana", label: "Marijuana" },
      { value: "mdma", label: "MDMA / Ecstasy" },
      { value: "fentanyl", label: "Fentanyl" },
      { value: "pharmaceuticals", label: "Pharmaceuticals" },
    ],
    standardSet: ["cocaine", "heroin", "meth", "marijuana", "mdma"],
  },
];

// Flat lookup table for all valid substance values.
export const SUBSTANCE_VALUES = new Set<string>(
  SUBSTANCE_GROUPS.flatMap((g) => g.substances.map((s) => s.value))
);

export function getSubstanceLabel(value: string): string {
  for (const g of SUBSTANCE_GROUPS) {
    const hit = g.substances.find((s) => s.value === value);
    if (hit) return hit.label;
  }
  return value;
}

// Keep only known substance values. Used in server actions before saving.
export function filterSubstances(values: string[]): string[] {
  return values.filter((v) => SUBSTANCE_VALUES.has(v));
}

// Expand "standard-explosives" / "standard-narcotics" markers into their
// constituent substance values. Pass-through for regular substance values.
// "standard" (legacy, no suffix) is treated as standard-explosives since the
// FIND_DETAILS.explosives option used "standard" originally.
export function expandStandardFinds(finds: string[]): string[] {
  const out = new Set<string>();
  for (const f of finds) {
    if (f === "standard-explosives" || f === "standard") {
      for (const s of SUBSTANCE_GROUPS[0].standardSet) out.add(s);
    } else if (f === "standard-narcotics") {
      for (const s of SUBSTANCE_GROUPS[1].standardSet) out.add(s);
    } else {
      out.add(f);
    }
  }
  return Array.from(out);
}
