"use client";

import { useSession, signOut } from "next-auth/react";

export default function Topbar() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? session?.user?.email ?? "Listener";
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-gradient-to-b from-space-900/95 to-space-900/40 px-4 py-4 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-midnight-400 to-starlight text-sm font-bold text-space-900">
          {initial}
        </div>
        <span className="hidden text-sm font-medium text-white/80 sm:inline">
          {name}
        </span>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="rounded-full border border-white/15 bg-space-800/70 px-4 py-1.5 text-sm font-medium text-white/80 transition hover:bg-midnight-500/60 hover:text-white"
      >
        Log out
      </button>
    </header>
  );
}
