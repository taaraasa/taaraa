"use client";

import { useState, useTransition } from "react";
import { addSongToPlaylist } from "@/app/actions/library";

type PlaylistOption = { id: string; name: string };

export default function AddToPlaylist({
  songId,
  playlists,
}: {
  songId: string;
  playlists: PlaylistOption[];
}) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(playlistId: string, name: string, e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      await addSongToPlaylist(playlistId, songId);
      setAdded(name);
      setTimeout(() => {
        setOpen(false);
        setAdded(null);
      }, 1200);
    });
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label="Add to playlist"
        className="text-white/40 transition hover:scale-110 hover:text-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full right-0 z-50 mb-2 w-52 rounded-xl border border-white/10 bg-space-700 p-2 shadow-glow"
        >
          {added ? (
            <p className="px-3 py-2 text-sm text-starlight">Added to {added} ✓</p>
          ) : playlists.length === 0 ? (
            <p className="px-3 py-2 text-xs text-white/50">
              Create a playlist first in Your Library.
            </p>
          ) : (
            <>
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/40">
                Add to playlist
              </p>
              <div className="max-h-48 overflow-y-auto">
                {playlists.map((p) => (
                  <button
                    key={p.id}
                    disabled={isPending}
                    onClick={(e) => handleAdd(p.id, p.name, e)}
                    className="block w-full truncate rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/10"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
