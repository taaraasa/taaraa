"use client";

import { create } from "zustand";
import type { PlayerSong } from "@/types/music";

type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  queue: PlayerSong[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number; // 0..1
  isMuted: boolean;
  progress: number; // current time in seconds (mirrored from <audio>)
  duration: number; // total seconds (mirrored from <audio>)
  isShuffled: boolean;
  repeatMode: RepeatMode;

  // actions
  playQueue: (songs: PlayerSong[], startIndex?: number) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  next: () => void;
  previous: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setProgress: (p: number) => void;
  setDuration: (d: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  progress: 0,
  duration: 0,
  isShuffled: false,
  repeatMode: "off",

  playQueue: (songs, startIndex = 0) => {
    if (!songs.length) return;
    set({
      queue: songs,
      currentIndex: Math.min(Math.max(startIndex, 0), songs.length - 1),
      isPlaying: true,
      progress: 0,
    });
  },

  togglePlay: () => {
    if (!get().queue.length) return;
    set((s) => ({ isPlaying: !s.isPlaying }));
  },

  setPlaying: (playing) => set({ isPlaying: playing }),

  next: () => {
    const { queue, currentIndex, repeatMode, isShuffled } = get();
    if (!queue.length) return;

    let nextIndex: number;
    if (isShuffled) {
      // pick a different random track when possible
      if (queue.length === 1) {
        nextIndex = 0;
      } else {
        do {
          nextIndex = Math.floor(Math.random() * queue.length);
        } while (nextIndex === currentIndex);
      }
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === "all") {
          nextIndex = 0;
        } else {
          set({ isPlaying: false, progress: 0 });
          return;
        }
      }
    }
    set({ currentIndex: nextIndex, isPlaying: true, progress: 0 });
  },

  previous: () => {
    const { currentIndex } = get();
    const prevIndex = Math.max(currentIndex - 1, 0);
    set({ currentIndex: prevIndex, isPlaying: true, progress: 0 });
  },

  setVolume: (v) => set({ volume: Math.min(Math.max(v, 0), 1), isMuted: false }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  toggleShuffle: () => set((s) => ({ isShuffled: !s.isShuffled })),
  cycleRepeat: () =>
    set((s) => ({
      repeatMode:
        s.repeatMode === "off" ? "all" : s.repeatMode === "all" ? "one" : "off",
    })),
}));
