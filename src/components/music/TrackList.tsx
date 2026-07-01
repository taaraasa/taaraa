"use client";

import { usePlayer } from "@/store/player";
import { recordPlay } from "@/app/actions/plays";
import { formatTime, coverGradient } from "@/lib/cover";
import LikeButton from "@/components/music/LikeButton";
import AddToPlaylist from "@/components/music/AddToPlaylist";
import type { PlayerSong } from "@/types/music";

type PlaylistOption = { id: string; name: string };

export default function TrackList({
  songs,
  likedIds,
  playlists = [],
  showCover = true,
  onRemove,
}: {
  songs: PlayerSong[];
  likedIds: string[];
  playlists?: PlaylistOption[];
  showCover?: boolean;
  onRemove?: (songId: string) => void;
}) {
  const playQueue = usePlayer((s) => s.playQueue);
  const queue = usePlayer((s) => s.queue);
  const currentIndex = usePlayer((s) => s.currentIndex);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const togglePlay = usePlayer((s) => s.togglePlay);

  const activeId = queue[currentIndex]?.id;
  const likedSet = new Set(likedIds);

  function handleRow(index: number) {
    const song = songs[index];
    if (song.id === activeId) {
      togglePlay();
      return;
    }
    playQueue(songs, index);
    void recordPlay(song.id);
  }

  if (!songs.length) {
    return (
      <p className="rounded-xl border border-white/10 bg-space-800/40 px-4 py-6 text-sm text-white/50">
        No songs here yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[24px_1fr_auto] items-center gap-4 border-b border-white/10 px-3 py-2 text-xs uppercase tracking-wide text-white/40 sm:grid-cols-[24px_1fr_100px_auto]">
        <span>#</span>
        <span>Title</span>
        <span className="hidden sm:block">Time</span>
        <span></span>
      </div>

      {songs.map((song, i) => {
        const active = song.id === activeId;
        return (
          <div
            key={song.id}
            onClick={() => handleRow(i)}
            className="group grid cursor-pointer grid-cols-[24px_1fr_auto] items-center gap-4 rounded-lg px-3 py-2 transition hover:bg-white/5 sm:grid-cols-[24px_1fr_100px_auto]"
          >
            <span className="text-sm text-white/40">
              {active && isPlaying ? (
                <span className="text-starlight">♪</span>
              ) : (
                <span className="group-hover:hidden">{i + 1}</span>
              )}
              {!active && (
                <span className="hidden group-hover:inline text-starlight">▶</span>
              )}
            </span>

            <div className="flex min-w-0 items-center gap-3">
              {showCover && (
                <div
                  className="h-10 w-10 shrink-0 rounded-md"
                  style={{ background: coverGradient(song.id) }}
                />
              )}
              <div className="min-w-0">
                <p className={`truncate text-sm font-medium ${active ? "text-starlight" : "text-white"}`}>
                  {song.title}
                </p>
                <p className="truncate text-xs text-white/50">{song.artistName}</p>
              </div>
            </div>

            <span className="hidden text-sm tabular-nums text-white/40 sm:block">
              {formatTime(song.duration)}
            </span>

            <div className="flex items-center gap-3">
              {playlists.length > 0 && (
                <AddToPlaylist songId={song.id} playlists={playlists} />
              )}
              <LikeButton songId={song.id} initialLiked={likedSet.has(song.id)} />
              {onRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(song.id);
                  }}
                  aria-label="Remove"
                  className="text-white/40 transition hover:text-red-300"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 7h12l-1 13H7L6 7zm3-3h6l1 2H8l1-2z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
