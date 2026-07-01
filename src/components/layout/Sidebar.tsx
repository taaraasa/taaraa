"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import type { PlaylistLite } from "@/types/music";

const nav = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/library", label: "Your Library", icon: LibraryIcon },
];

export default function Sidebar({ playlists }: { playlists: PlaylistLite[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-2 border-r border-white/10 bg-space-900/60 p-5 md:flex">
      <div className="mb-6 px-1">
        <Link href="/dashboard">
          <Logo size={32} />
        </Link>
      </div>

      <nav className="flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-midnight-500/50 text-white shadow-glow"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex items-center justify-between px-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Playlists
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Link
          href="/library/liked"
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
            pathname === "/library/liked"
              ? "bg-midnight-500/40 text-white"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-midnight-500 to-starlight text-space-900">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21s-7.5-4.6-10-9.2C.4 8.4 2 5 5.3 5c2 0 3.3 1.1 4.2 2.4L12 10l2.5-2.6C15.4 6.1 16.7 5 18.7 5 22 5 23.6 8.4 22 11.8 19.5 16.4 12 21 12 21z" />
            </svg>
          </span>
          Liked Songs
        </Link>

        {playlists.length === 0 ? (
          <p className="px-3 py-2 text-xs text-white/30">
            Playlists you create appear here.
          </p>
        ) : (
          playlists.map((p) => {
            const active = pathname === `/playlist/${p.id}`;
            return (
              <Link
                key={p.id}
                href={`/playlist/${p.id}`}
                className={`block truncate rounded-xl px-3 py-2 text-sm transition ${
                  active
                    ? "bg-midnight-500/40 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {p.name}
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3l9 8h-3v9h-4v-6h-4v6H6v-9H3l9-8z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" strokeLinecap="round" />
    </svg>
  );
}
function LibraryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4h2v16H4zM8 4h2v16H8zM13 4l7 2-4 15-3-1 3-11-3-1z" />
    </svg>
  );
}
