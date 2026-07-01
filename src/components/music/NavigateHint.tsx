"use client";
import Link from "next/link";

// Small "open detail" chevron used on cards/rows to reach the new pages.
export default function NavigateHint({ href }: { href: string }) {
  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      aria-label="Open details"
      className="text-white/40 transition hover:text-starlight"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
