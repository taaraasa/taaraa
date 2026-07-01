"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPlaylist } from "@/app/actions/playlists";

export default function CreatePlaylist() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      const res = await createPlaylist(name);
      if ("id" in res) {
        setName("");
        setOpen(false);
        router.push(`/playlist/${res.id}`);
        router.refresh(); // update the sidebar playlist list
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-space-800/70 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-midnight-500/60"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        Create playlist
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        placeholder="Playlist name"
        className="rounded-full border border-white/10 bg-space-700/70 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-starlight"
      />
      <button
        onClick={handleCreate}
        disabled={isPending}
        className="rounded-full bg-gradient-to-r from-midnight-400 to-starlight px-5 py-2.5 text-sm font-semibold text-space-900 disabled:opacity-60"
      >
        {isPending ? "Creating…" : "Create"}
      </button>
      <button
        onClick={() => setOpen(false)}
        className="rounded-full px-3 py-2.5 text-sm text-white/50 hover:text-white"
      >
        Cancel
      </button>
    </div>
  );
}
