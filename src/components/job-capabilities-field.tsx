"use client";

// Capabilities checkbox grid + an "Other" toggle that reveals a write-in
// text input. Used inside the New Job <form>; submits as multi-value
// `capabilities` and a single `other_capability` text field.
import { useState } from "react";
import { JOB_CAPABILITIES } from "@/lib/marketplace";

export default function JobCapabilitiesField() {
  const [otherChecked, setOtherChecked] = useState(false);
  const [otherText, setOtherText] = useState("");

  return (
    <fieldset>
      <legend className="block text-sm font-medium">
        What should the dog be able to do?
      </legend>
      <p className="mt-0.5 text-xs text-pack-brown/70">
        Pick all that apply. Use the &ldquo;Other&rdquo; box if your need
        isn&apos;t listed.
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {JOB_CAPABILITIES.map((c) => (
          <label
            key={c.value}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-pack-tan/40 bg-white px-3 py-2 text-sm hover:bg-pack-sand/40 has-[:checked]:border-pack-mask has-[:checked]:bg-pack-mask has-[:checked]:text-pack-cream"
          >
            <input
              type="checkbox"
              name="capabilities"
              value={c.value}
              className="accent-pack-mask"
            />
            {c.label}
          </label>
        ))}

        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-pack-tan/40 bg-white px-3 py-2 text-sm hover:bg-pack-sand/40 has-[:checked]:border-pack-mask has-[:checked]:bg-pack-mask has-[:checked]:text-pack-cream">
          <input
            type="checkbox"
            checked={otherChecked}
            onChange={(e) => setOtherChecked(e.target.checked)}
            className="accent-pack-mask"
          />
          Other (write in)
        </label>
      </div>

      {otherChecked && (
        <div className="mt-3 rounded-md border border-pack-tan/40 bg-pack-sand/30 p-3">
          <label
            htmlFor="other_capability"
            className="block text-xs font-medium text-pack-brown"
          >
            Describe what the dog needs to do
          </label>
          <input
            id="other_capability"
            name="other_capability"
            type="text"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="e.g., scent imprint on a custom target odor"
            className="mt-1 w-full rounded-md border border-pack-tan/40 bg-white px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
          />
        </div>
      )}
    </fieldset>
  );
}
