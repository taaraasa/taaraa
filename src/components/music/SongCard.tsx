"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlayer } from "@/store/player";
import { coverGradient } from "@/lib/cover";
import { recordPlay } from "@/app/actions/plays";
import type { PlayerSong, TrackListItem } from "@/types/music";

export default function SongCard({
  song,
  queue,
}: {
  song: TrackListItem;
  queue: PlayerSong[];
}) {
  const playQueue = usePlayer((s) => s.playQueue);
  const currentQueue = usePlayer((s) => s.queue);
  const currentIndex = usePlayer((s) => s.currentIndex);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeSong = currentQueue[currentIndex];
  const isActive = activeSong?.id === song.id;
  const hasLinks = Boolean(song.artistId || song.albumId);

  function handlePlay() {
    const idx = queue.findIndex((s) => s.id === song.id);
    playQueue(queue, idx >= 0 ? idx : 0);
    void recordPlay(song.id);
  }

  return (
    <div className="group relative flex w-40 shrink-0 flex-col gap-3 rounded-2xl border border-white/5 bg-space-800/40 p-3 transition hover:border-white/10 hover:bg-space-700/60">
      {/* ••• menu */}
      {hasLinks && (
        <div className="absolute right-3 top-3 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            aria-label="More options"
            className="rounded-full bg-space-900/70 p-1 text-white/70 opacity-0 transition hover:text-white group-hover:opacity-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-8 z-30 w-44 overflow-hidden rounded-xl border border-white/10 bg-space-800 shadow-glow"
              onClick={(e) => e.stopPropagation()}
            >
              {song.artistId && (
                <Link
                  href={`/artist/${song.artistId}`}
                  className="block px-3 py-2 text-sm text-white/80 transition hover:bg-white/5"
                >
                  Go to artist
                </Link>
              )}
              {song.albumId && (
                <Link
                  href={`/album/${song.albumId}`}
                  className="block px-3 py-2 text-sm text-white/80 transition hover:bg-white/5"
                >
                  Go to album
                </Link>
              )}
              <Link
                href={`/song/${song.id}`}
                className="block px-3 py-2 text-sm text-white/80 transition hover:bg-white/5"
              >
                Song details
              </Link>
            </div>
          )}
        </div>
      )}

      <button onClick={handlePlay} className="text-left" aria-label={`Play ${song.title}`}>
        <div
          className="relative aspect-square w-full rounded-xl shadow-lg"
          style={{ background: coverGradient(song.id) }}
        >
          <span
            className={`absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-starlight-glow to-starlight text-space-900 shadow-glow transition ${
              isActive
                ? "opacity-100"
                : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            }`}
          >
            {isActive && isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </span>
        </div>
        <div className="mt-3 min-w-0">
          <p className={`truncate text-sm font-semibold ${isActive ? "text-starlight" : "text-white"}`}>
            {song.title}
          </p>
          <p className="truncate text-xs text-white/50">{song.artistName}</p>
        </div>
      </button>
    </div>
  );
}
