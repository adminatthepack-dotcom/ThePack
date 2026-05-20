"use client";

// Checklist of detection capabilities for a dog, grouped into Explosives
// and Narcotics. Each group has a "Select standard set" master button.
// Renders inside a <form> — submits selected values as multiple
// `detection_capabilities` fields.
import { useState } from "react";
import { SUBSTANCE_GROUPS } from "@/lib/detection";
import InfoTooltip from "@/components/info-tooltip";

export default function DetectionCapabilitiesField({
  defaultValues,
}: {
  defaultValues: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(defaultValues)
  );

  function toggle(value: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function selectStandard(groupKey: string) {
    const group = SUBSTANCE_GROUPS.find((g) => g.groupKey === groupKey);
    if (!group) return;
    setSelected((prev) => {
      const next = new Set(prev);
      for (const s of group.standardSet) next.add(s);
      return next;
    });
  }

  function clearGroup(groupKey: string) {
    const group = SUBSTANCE_GROUPS.find((g) => g.groupKey === groupKey);
    if (!group) return;
    setSelected((prev) => {
      const next = new Set(prev);
      for (const s of group.substances) next.delete(s.value);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-pack-brown">
        Declare what this dog is certified or trained to find. People searching
        the directory and marketplace will be matched to handlers whose dogs
        cover the substances they need.
      </p>

      {SUBSTANCE_GROUPS.map((group) => {
        const allStandardSelected = group.standardSet.every((s) =>
          selected.has(s)
        );
        return (
          <div key={group.groupKey}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="flex items-center text-sm font-semibold text-pack-mask">
                {group.label}
                {group.info && <InfoTooltip>{group.info}</InfoTooltip>}
              </h4>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => selectStandard(group.groupKey)}
                  className="rounded-md border border-pack-tan/40 bg-white px-2 py-1 font-medium hover:bg-pack-sand/40"
                >
                  {allStandardSelected
                    ? "✓ Standard set selected"
                    : "Select standard set"}
                </button>
                <button
                  type="button"
                  onClick={() => clearGroup(group.groupKey)}
                  className="rounded-md border border-pack-tan/40 bg-white px-2 py-1 text-pack-brown hover:bg-pack-sand/40"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {group.substances.map((s) => (
                <label
                  key={s.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-pack-tan/40 bg-white px-3 py-2 text-sm hover:bg-pack-sand/40 has-[:checked]:border-pack-mask has-[:checked]:bg-pack-mask has-[:checked]:text-pack-cream"
                >
                  <input
                    type="checkbox"
                    name="detection_capabilities"
                    value={s.value}
                    checked={selected.has(s.value)}
                    onChange={() => toggle(s.value)}
                    className="accent-pack-mask"
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
