"use client";

// Bundles the role selector, tag checkboxes, and (conditionally) the three
// certification-agency description fields. Lives inside the main profile-edit
// <form>, so all of its inputs submit with the form action.
import { useState } from "react";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/roles";
import { TAGS_BY_ROLE } from "@/lib/tags";
import DetectionCapabilitiesField from "@/components/detection-capabilities-field";

const ROLES_WITH_DETECTION: Role[] = ["handler", "trainer"];

const inputCls =
  "mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900";

export default function RoleTagsCertFields({
  defaultRole,
  defaultTags,
  defaultDetectionCapabilities,
  defaultCertMeaning,
  defaultCertAudience,
  defaultCertRequirements,
}: {
  defaultRole: Role;
  defaultTags: string[];
  defaultDetectionCapabilities: string[];
  defaultCertMeaning: string | null;
  defaultCertAudience: string | null;
  defaultCertRequirements: string | null;
}) {
  const [role, setRole] = useState<Role>(defaultRole);
  const selected = new Set(defaultTags);

  return (
    <>
      <div>
        <label htmlFor="role" className="block text-sm font-medium">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className={inputCls}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-neutral-500">
          Changing your role swaps the available tags below. Tags you had
          selected for a different role won&apos;t be kept.
        </p>
      </div>

      <div>
        <div className="block text-sm font-medium">
          Tags / specializations
        </div>
        <p className="mt-0.5 text-xs text-neutral-500">
          Pick anything that applies. These help people find you in the
          directory.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {TAGS_BY_ROLE[role].map((t) => (
            <label
              key={t.value}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50 has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-900 has-[:checked]:text-white"
            >
              <input
                type="checkbox"
                name="tags"
                value={t.value}
                defaultChecked={selected.has(t.value)}
                className="accent-neutral-900"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {ROLES_WITH_DETECTION.includes(role) && (
        <div className="space-y-4 rounded-lg border border-pack-tan/40 bg-white p-4">
          <div>
            <h3 className="text-sm font-semibold text-pack-mask">
              Detection capabilities
            </h3>
            <p className="mt-1 text-xs text-pack-brown">
              Declare the specific substances you or your team are trained and
              certified to detect. Used for matching in the marketplace and
              directory search.
            </p>
          </div>
          <DetectionCapabilitiesField
            defaultValues={defaultDetectionCapabilities}
          />
        </div>
      )}

      {role === "certification_agency" && (
        <div className="space-y-4 rounded-lg border border-violet-200 bg-violet-50 p-5">
          <div>
            <h3 className="text-sm font-semibold text-violet-900">
              About your certification
            </h3>
            <p className="mt-1 text-xs text-violet-800">
              These appear prominently on your public profile.
            </p>
          </div>
          <div>
            <label
              htmlFor="cert_meaning"
              className="block text-sm font-medium"
            >
              What this certification means
            </label>
            <textarea
              id="cert_meaning"
              name="cert_meaning"
              rows={3}
              defaultValue={defaultCertMeaning ?? ""}
              placeholder="What does someone earn or demonstrate by holding this certification?"
              className={inputCls}
            />
          </div>
          <div>
            <label
              htmlFor="cert_audience"
              className="block text-sm font-medium"
            >
              Who needs to have it
            </label>
            <textarea
              id="cert_audience"
              name="cert_audience"
              rows={3}
              defaultValue={defaultCertAudience ?? ""}
              placeholder="Which handlers, dogs, trainers, or agencies should hold this?"
              className={inputCls}
            />
          </div>
          <div>
            <label
              htmlFor="cert_requirements"
              className="block text-sm font-medium"
            >
              What it takes to get certified
            </label>
            <textarea
              id="cert_requirements"
              name="cert_requirements"
              rows={4}
              defaultValue={defaultCertRequirements ?? ""}
              placeholder="Outline the testing process, prerequisites, cost, renewal requirements, etc."
              className={inputCls}
            />
          </div>
        </div>
      )}
    </>
  );
}
