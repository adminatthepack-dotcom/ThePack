import Link from 'next/link';
import { APPLY_CONFIGS, PROVIDER_ROLES, type ProviderRole } from '@/lib/apply-config';

const DESCRIPTIONS: Record<ProviderRole, string> = {
  handler: 'I handle or care for working, sport, or service dogs.',
  breeder: 'I breed dogs and want to connect with buyers and partners.',
  trainer: 'I train dogs or teach handlers.',
  veterinarian: 'I provide veterinary care for working dogs.',
  transporter: 'I transport animals commercially.',
  employer: 'I hire handlers, trainers, or security teams.',
};

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-10">
      <div>
        <Link
          href="/"
          className="text-sm text-pack-brown hover:text-pack-mask"
        >
          ← Back
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-pack-mask">
          Apply to Join the Pack
        </h1>
        <p className="mt-2 text-pack-brown">
          Select the role that best describes you. All provider applications are
          reviewed for credential validity before approval.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PROVIDER_ROLES.map((role) => {
          const config = APPLY_CONFIGS[role];
          return (
            <div
              key={role}
              className="rounded-lg border border-pack-tan/40 bg-white p-5 shadow-sm transition hover:border-pack-tan hover:shadow"
            >
              <div className="font-semibold text-pack-mask">{config.label}</div>
              <p className="mt-2 text-sm text-pack-brown">
                {DESCRIPTIONS[role]}
              </p>
              <Link
                href={`/apply/${role}`}
                className="mt-4 inline-block text-sm font-medium text-pack-mask underline-offset-2 hover:underline"
              >
                Apply as {config.label} →
              </Link>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-neutral-500">
        Certifying agencies are invited to join by the platform administrator
        and are not listed here.
      </p>
    </div>
  );
}
