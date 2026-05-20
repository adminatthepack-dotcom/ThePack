'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { linkHandler, unlinkHandler } from '@/app/profile/[id]/actions';
import type { Profile } from '@/types/database';

type HandlerProfile = Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'location'>;

export default function EmployerHandlersSection({
  employerId,
  handlers,
  certifiedHandlerIds,
  employerName,
  employerAvatarUrl,
  isOwner,
}: {
  employerId: string;
  handlers: HandlerProfile[];
  certifiedHandlerIds: string[];
  employerName: string | null;
  employerAvatarUrl: string | null;
  isOwner: boolean;
}) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const certifiedSet = new Set(certifiedHandlerIds);

  function handleLink() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await linkHandler(employerId, email);
      if (result.error) {
        setError(result.error);
      } else {
        setEmail('');
        setShowForm(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  function handleUnlink(handlerId: string) {
    startTransition(async () => {
      await unlinkHandler(employerId, handlerId);
    });
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Handlers
        </h2>
        {isOwner && (
          <button
            type="button"
            onClick={() => { setShowForm((v) => !v); setError(null); }}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1 text-xs hover:bg-neutral-50"
          >
            {showForm ? 'Cancel' : '+ Link a Handler'}
          </button>
        )}
      </div>

      {showForm && isOwner && (
        <div className="mt-3 rounded-md border border-neutral-200 bg-neutral-50 p-4">
          <p className="mb-2 text-xs text-neutral-600">
            Enter the handler&apos;s account email address to link their profile to your organization.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="handler@example.com"
              className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
            />
            <button
              type="button"
              onClick={handleLink}
              disabled={isPending || !email.trim()}
              className="rounded-md bg-pack-mask px-4 py-1.5 text-sm font-medium text-pack-cream disabled:opacity-50 hover:bg-pack-brown"
            >
              {isPending ? 'Linking…' : 'Link'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}
        </div>
      )}

      {success && (
        <p className="mt-2 text-xs text-emerald-600">Handler linked successfully.</p>
      )}

      <div className="mt-3">
        {handlers.length === 0 ? (
          <p className="text-sm text-neutral-500">
            {isOwner ? 'No handlers linked yet.' : 'No handlers listed.'}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {handlers.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/profile/${h.id}`}
                  className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm transition hover:border-pack-tan hover:shadow-md"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                    {h.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={h.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-medium text-neutral-500">
                        {(h.full_name ?? '?').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-sm font-medium text-pack-mask">
                        {h.full_name ?? 'Unnamed handler'}
                      </p>
                      {certifiedSet.has(h.id) ? (
                        <span
                          title="Verified Handler — credentials reviewed and approved by The Pack"
                          className="group relative inline-flex h-4 w-4 shrink-0 cursor-default items-center justify-center rounded-full bg-pack-mask text-[9px] text-pack-cream"
                        >
                          ✓
                          <span className="pointer-events-none invisible absolute bottom-full left-1/2 z-20 mb-1.5 w-48 -translate-x-1/2 rounded-md bg-pack-mask px-2 py-1.5 text-center text-[10px] leading-relaxed text-pack-cream opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
                            Verified Handler — credentials reviewed by The Pack
                          </span>
                        </span>
                      ) : (
                        <span
                          title="No verified credentials on file"
                          className="group relative inline-flex h-4 w-4 shrink-0 cursor-default items-center justify-center rounded-full bg-amber-400 text-[9px] text-white"
                        >
                          !
                          <span className="pointer-events-none invisible absolute bottom-full left-1/2 z-20 mb-1.5 w-48 -translate-x-1/2 rounded-md bg-amber-700 px-2 py-1.5 text-center text-[10px] leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
                            No verified credentials on file
                          </span>
                        </span>
                      )}
                      {/* Employer badge */}
                      <span
                        title={`Employed by ${employerName ?? 'this organization'}`}
                        className="group relative inline-flex h-4 w-4 shrink-0 cursor-default overflow-hidden rounded-full border border-pack-tan bg-white shadow-sm"
                      >
                        {employerAvatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={employerAvatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[8px] font-bold text-pack-brown">
                            {(employerName ?? '?').slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <span className="pointer-events-none invisible absolute bottom-full left-1/2 z-20 mb-1.5 w-44 -translate-x-1/2 rounded-md bg-pack-mask px-2 py-1.5 text-center text-[10px] leading-relaxed text-pack-cream opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
                          Employed by {employerName ?? 'this organization'}
                        </span>
                      </span>
                    </div>
                    {h.location && (
                      <p className="truncate text-xs text-neutral-500">{h.location}</p>
                    )}
                  </div>
                </Link>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => handleUnlink(h.id)}
                    disabled={isPending}
                    className="mt-1 w-full text-center text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
