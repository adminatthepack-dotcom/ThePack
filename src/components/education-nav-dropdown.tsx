"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function EducationNavDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-pack-sand transition hover:text-pack-cream"
      >
        Education
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-lg border border-pack-tan/40 bg-pack-mask shadow-lg">
          <Link
            href="/education"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-pack-sand hover:bg-pack-brown/40 hover:text-pack-cream"
          >
            <span className="text-base">📖</span>
            Articles
          </Link>
          <Link
            href="/events"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-pack-sand hover:bg-pack-brown/40 hover:text-pack-cream"
          >
            <span className="text-base">📅</span>
            Events
          </Link>
        </div>
      )}
    </div>
  );
}
