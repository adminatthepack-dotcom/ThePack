"use client";

import { useState } from "react";
import Link from "next/link";
import EducationNavDropdown from "@/components/education-nav-dropdown";

type NavBarProps = {
  user: boolean;
  unreadTotal: number;
  isAdmin: boolean;
};

export default function NavBar({ user, unreadTotal, isAdmin }: NavBarProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const primaryLinks = (
    <>
      <Link href="/directory" onClick={close} className="text-pack-sand transition hover:text-pack-cream">Directory</Link>
      <Link href="/marketplace" onClick={close} className="text-pack-sand transition hover:text-pack-cream">Marketplace</Link>
      <EducationNavDropdown />
      <Link href="/gear" onClick={close} className="text-pack-sand transition hover:text-pack-cream">Equipment</Link>
      <Link href="/donate" onClick={close} className="text-pack-sand transition hover:text-pack-cream">Donate</Link>
    </>
  );

  const authLinks = user ? (
    <>
      <Link
        href="/inbox"
        onClick={close}
        className="relative text-pack-sand transition hover:text-pack-cream"
        aria-label="Inbox"
      >
        <span aria-hidden>🔔</span>
        {unreadTotal > 0 && (
          <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pack-blue px-1.5 text-[11px] font-semibold text-white">
            {unreadTotal}
          </span>
        )}
      </Link>
      <Link href="/profile/edit" onClick={close} className="text-pack-sand transition hover:text-pack-cream">
        My profile
      </Link>
      {isAdmin && (
        <Link
          href="/admin/applications"
          onClick={close}
          className="rounded-md border border-pack-tan/40 px-3 py-1.5 text-pack-sand transition hover:border-pack-tan hover:text-pack-cream"
        >
          Admin
        </Link>
      )}
      <form action="/logout" method="post">
        <button
          type="submit"
          className="rounded-md border border-pack-tan/40 px-3 py-1.5 text-pack-sand transition hover:border-pack-tan hover:text-pack-cream"
        >
          Log out
        </button>
      </form>
    </>
  ) : (
    <>
      <Link href="/login" onClick={close} className="text-pack-sand transition hover:text-pack-cream">
        Log in
      </Link>
      <Link
        href="/signup"
        onClick={close}
        className="rounded-md bg-pack-tan px-3 py-1.5 font-semibold text-pack-mask transition hover:bg-pack-fawn hover:text-pack-cream"
      >
        Join the pack
      </Link>
    </>
  );

  return (
    <>
      {/* Desktop nav */}
      <div className="hidden items-center gap-x-4 text-sm md:flex">
        {primaryLinks}
        <span className="text-pack-tan/30">|</span>
        {authLinks}
      </div>

      {/* Mobile: bell (if logged in) + hamburger */}
      <div className="flex items-center gap-3 md:hidden">
        {user && (
          <Link href="/inbox" className="relative text-pack-sand" aria-label="Inbox">
            <span aria-hidden>🔔</span>
            {unreadTotal > 0 && (
              <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-pack-blue px-1 text-[10px] font-semibold text-white">
                {unreadTotal}
              </span>
            )}
          </Link>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="flex h-8 w-8 flex-col items-center justify-center gap-1.5"
        >
          <span className={`block h-0.5 w-5 bg-pack-sand transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-5 bg-pack-sand transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 bg-pack-sand transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-40 flex flex-col gap-1 border-t border-pack-tan/20 bg-pack-mask px-6 py-4 text-sm shadow-lg md:hidden">
          <Link href="/directory" onClick={close} className="py-2 text-pack-sand hover:text-pack-cream">Directory</Link>
          <Link href="/marketplace" onClick={close} className="py-2 text-pack-sand hover:text-pack-cream">Marketplace</Link>
          <Link href="/education" onClick={close} className="py-2 text-pack-sand hover:text-pack-cream">Education — Articles</Link>
          <Link href="/events" onClick={close} className="py-2 text-pack-sand hover:text-pack-cream">Education — Events</Link>
          <Link href="/gear" onClick={close} className="py-2 text-pack-sand hover:text-pack-cream">Equipment</Link>
          <Link href="/donate" onClick={close} className="py-2 text-pack-sand hover:text-pack-cream">Donate</Link>
          <div className="my-2 border-t border-pack-tan/20" />
          {user ? (
            <>
              <Link href="/profile/edit" onClick={close} className="py-2 text-pack-sand hover:text-pack-cream">My profile</Link>
              {isAdmin && (
                <Link href="/admin/applications" onClick={close} className="py-2 text-pack-sand hover:text-pack-cream">Admin</Link>
              )}
              <form action="/logout" method="post">
                <button type="submit" className="py-2 text-left text-pack-sand hover:text-pack-cream w-full">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" onClick={close} className="py-2 text-pack-sand hover:text-pack-cream">Log in</Link>
              <Link href="/signup" onClick={close} className="py-2 font-semibold text-pack-tan hover:text-pack-cream">Join the pack</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
