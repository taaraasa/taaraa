"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/store/player";
import { recordPlay } from "@/app/actions/plays";
import {
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "@/app/actions/playlists";
import LikeButton from "@/components/music/LikeButton";
import Cover from "@/components/music/Cover";
import { formatTime } from "@/lib/cover";
import type { PlayerSong, TrackListItem, PlaylistLite } from "@/types/music";

export default function SongRow({
  index,
  song,
  queue,
  initiallyLiked,
  playlists,
  inPlaylistId,
}: {
  index: number;
  song: TrackListItem;
  queue: PlayerSong[];
  initiallyLiked?: boolean;
  playlists?: PlaylistLite[];
  inPlaylistId?: string;
}) {
  const router = useRouter();
  const playQueue = usePlayer((s) => s.playQueue);
  const currentQueue = usePlayer((s) => s.queue);
  const currentIndex = usePlayer((s) => s.currentIndex);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const [menuOpen, setMenuOpen] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const activeSong = currentQueue[currentIndex];
  const isActive = activeSong?.id === song.id;

  function play() {
    const idx = queue.findIndex((s) => s.id === song.id);
    playQueue(queue, idx >= 0 ? idx : 0);
    void recordPlay(song.id);
  }

  function handleAdd(playlistId: string, name: string) {
    startTransition(async () => {
      await addSongToPlaylist(playlistId, song.id);
      setAdded(name);
      setTimeout(() => {
        setAdded(null);
        setMenuOpen(false);
      }, 1200);
      router.refresh();
    });
  }

  function handleRemove() {
    if (!inPlaylistId) return;
    startTransition(async () => {
      await removeSongFromPlaylist(inPlaylistId, song.id);
      router.refresh();
    });
  }

  return (
    <div className="group grid grid-cols-[1.5rem_2.5rem_1fr_auto] items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/5 sm:grid-cols-[1.5rem_2.5rem_1fr_10rem_auto]">
      {/* index / play */}
      <button
        onClick={play}
        className="flex h-6 w-6 items-center justify-center text-white/40"
        aria-label={`Play ${song.title}`}
      >
        <span className="group-hover:hidden">
          {isActive && isPlaying ? <span className="text-starlight">♪</span> : index + 1}
        </span>
        <span className="hidden text-white group-hover:inline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </span>
      </button>

      {/* thumbnail */}
      <button onClick={play} aria-label={`Play ${song.title}`} className="h-10 w-10">
        <Cover src={song.coverImage} seed={song.id} alt={song.title} className="h-10 w-10" rounded="rounded-md" />
      </button>

      {/* title + artist */}
      <div className="min-w-0" onClick={play} role="button">
        <p className={`truncate text-sm font-medium ${isActive ? "text-starlight" : "text-white"}`}>
          {song.title}
        </p>
        {song.artistId ? (
          <Link
            href={`/artist/${song.artistId}`}
            onClick={(e) => e.stopPropagation()}
            className="truncate text-xs text-white/50 hover:text-white hover:underline"
          >
            {song.artistName}
          </Link>
        ) : (
          <p className="truncate text-xs text-white/50">{song.artistName}</p>
        )}
      </div>

      {/* album (desktop) */}
      <div className="hidden min-w-0 sm:block">
        {song.albumId ? (
          <Link href={`/album/${song.albumId}`} className="truncate text-xs text-white/40 hover:text-white hover:underline">
            {song.albumTitle}
          </Link>
        ) : null}
      </div>

      {/* actions */}
      <div className="flex items-center gap-3">
        <LikeButton songId={song.id} initiallyLiked={initiallyLiked} />

        {inPlaylistId ? (
          <button onClick={handleRemove} aria-label="Remove from playlist" className="text-white/40 transition hover:text-red-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" strokeLinecap="round" /></svg>
          </button>
        ) : playlists && playlists.length > 0 ? (
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} aria-label="Add to playlist" className="text-white/40 transition hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 bottom-8 z-50 w-52 overflow-hidden rounded-xl border border-white/10 bg-space-800 shadow-glow">
                <p className="border-b border-white/5 px-3 py-2 text-xs font-semibold text-white/50">Add to playlist</p>
                <div className="max-h-48 overflow-y-auto">
                  {playlists.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAdd(p.id, p.name)}
                      className="block w-full truncate px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/5"
                    >
                      {added === p.name ? "✓ Added" : p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <span className="w-10 text-right text-xs tabular-nums text-white/40">{formatTime(song.duration)}</span>
      </div>
    </div>
  );
}
