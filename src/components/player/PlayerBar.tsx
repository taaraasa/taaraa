"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePlayer } from "@/store/player";
import { formatTime } from "@/lib/cover";
import Cover from "@/components/music/Cover";
import LikeButton from "@/components/music/LikeButton";

export default function PlayerBar() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const queue = usePlayer((s) => s.queue);
  const currentIndex = usePlayer((s) => s.currentIndex);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const volume = usePlayer((s) => s.volume);
  const isMuted = usePlayer((s) => s.isMuted);
  const progress = usePlayer((s) => s.progress);
  const duration = usePlayer((s) => s.duration);
  const isShuffled = usePlayer((s) => s.isShuffled);
  const repeatMode = usePlayer((s) => s.repeatMode);

  const togglePlay = usePlayer((s) => s.togglePlay);
  const next = usePlayer((s) => s.next);
  const previous = usePlayer((s) => s.previous);
  const setVolume = usePlayer((s) => s.setVolume);
  const toggleMute = usePlayer((s) => s.toggleMute);
  const setProgress = usePlayer((s) => s.setProgress);
  const setDuration = usePlayer((s) => s.setDuration);
  const toggleShuffle = usePlayer((s) => s.toggleShuffle);
  const cycleRepeat = usePlayer((s) => s.cycleRepeat);

  const currentSong = queue[currentIndex] ?? null;

  // Load a new source when the track changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    audio.src = currentSong.audioUrl;
    audio.load();
    if (isPlaying) audio.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id]);

  // Play / pause.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying, currentSong]);

  // Volume / mute.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  function handleEnded() {
    const audio = audioRef.current;
    if (repeatMode === "one" && audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      return;
    }
    next();
  }

  function handlePrevious() {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setProgress(0);
      return;
    }
    previous();
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    const t = Number(e.target.value);
    if (audio) audio.currentTime = t;
    setProgress(t);
  }

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const volPct = (isMuted ? 0 : volume) * 100;

  return (
    <footer className="fixed bottom-16 left-0 right-0 z-40 border-t border-white/10 bg-space-800/95 backdrop-blur-xl md:bottom-0">
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={handleEnded}
      />

      <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-3 py-3 sm:px-6">
        {/* Track info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {currentSong ? (
            <>
              <Cover
                src={currentSong.coverImage}
                seed={currentSong.id}
                alt={currentSong.title}
                className="h-14 w-14 shrink-0 shadow-glow"
                rounded="rounded-lg"
              />
              <div className="min-w-0">
                <Link
                  href={`/song/${currentSong.id}`}
                  className="block truncate text-sm font-semibold text-white hover:underline"
                >
                  {currentSong.title}
                </Link>
                <p className="truncate text-xs text-white/50">
                  {currentSong.artistName}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-white/40">Pick a song to start listening</p>
          )}
          {currentSong && (
            <div className="ml-1 hidden sm:block">
              <LikeButton songId={currentSong.id} size={18} />
            </div>
          )}
        </div>

        {/* Center: controls + progress */}
        <div className="flex flex-[1.4] flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              aria-label="Shuffle"
              className={`transition ${isShuffled ? "text-starlight" : "text-white/50 hover:text-white"}`}
            >
              <ShuffleIcon />
            </button>

            <button
              onClick={handlePrevious}
              aria-label="Previous"
              className="text-white/70 transition hover:text-white"
            >
              <PrevIcon />
            </button>

            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-starlight-glow to-starlight text-space-900 shadow-glow transition hover:scale-105 active:scale-95"
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            <button
              onClick={next}
              aria-label="Next"
              className="text-white/70 transition hover:text-white"
            >
              <NextIcon />
            </button>

            <button
              onClick={cycleRepeat}
              aria-label="Repeat"
              className={`relative transition ${repeatMode !== "off" ? "text-starlight" : "text-white/50 hover:text-white"}`}
            >
              <RepeatIcon />
              {repeatMode === "one" && (
                <span className="absolute -right-1 -top-1 text-[9px] font-bold text-starlight">
                  1
                </span>
              )}
            </button>
          </div>

          <div className="flex w-full max-w-xl items-center gap-2">
            <span className="w-10 text-right text-[11px] tabular-nums text-white/40">
              {formatTime(progress)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={progress}
              onChange={handleSeek}
              aria-label="Seek"
              className="taaraa-range h-1 flex-1"
              style={{
                background: `linear-gradient(to right, #8ab4ff ${pct}%, rgba(255,255,255,0.15) ${pct}%)`,
              }}
            />
            <span className="w-10 text-[11px] tabular-nums text-white/40">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden flex-1 items-center justify-end gap-2 sm:flex">
          <button
            onClick={toggleMute}
            aria-label="Mute"
            className="text-white/60 transition hover:text-white"
          >
            {isMuted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="taaraa-range h-1 w-24"
            style={{
              background: `linear-gradient(to right, #8ab4ff ${volPct}%, rgba(255,255,255,0.15) ${volPct}%)`,
            }}
          />
        </div>
      </div>
    </footer>
  );
}

/* --- Inline SVG icons (no icon library needed) --- */
function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
function NextIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z" />
    </svg>
  );
}
function PrevIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 6l-8.5 6L18 18V6zM6 6h2v12H6z" />
    </svg>
  );
}
function ShuffleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 3l4 4-4 4v-3h-2.2l-2.5 3-1.6-1.9L13.4 8H17V3zM3 6h4l2.5 3-1.3 1.6L6 8H3V6zm14 9v-3l4 4-4 4v-3h-3.4l-9-11H3v-2h3.6l9 11H17z" />
    </svg>
  );
}
function RepeatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
    </svg>
  );
}
function VolumeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4z" />
    </svg>
  );
}
function MuteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm18.3 3l1.4-1.4-1.4-1.4-1.9 2-1.9-2L16.1 10l1.9 2-1.9 2 1.4 1.4 1.9-2 1.9 2 1.4-1.4-1.9-2z" />
    </svg>
  );
}
