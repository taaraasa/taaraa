"use client";

import { usePlayer } from "@/store/player";
import { recordPlay } from "@/app/actions/plays";
import type { PlayerSong } from "@/types/music";

export default function PlayAllButton({
  songs,
  label = "Play",
}: {
  songs: PlayerSong[];
  label?: string;
}) {
  const playQueue = usePlayer((s) => s.playQueue);

  function handlePlay() {
    if (!songs.length) return;
    playQueue(songs, 0);
    void recordPlay(songs[0].id);
  }

  return (
    <button
      onClick={handlePlay}
      disabled={!songs.length}
      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-starlight-glow to-starlight px-6 py-3 font-semibold text-space-900 shadow-glow transition hover:scale-105 active:scale-95 disabled:opacity-40"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      {label}
    </button>
  );
}
