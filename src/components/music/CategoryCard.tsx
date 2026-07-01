"use client";

import { usePlayer } from "@/store/player";
import type { ShelfCategory } from "@/types/music";

const FALLBACK = "#1c2e6b";

export default function CategoryCard({ category }: { category: ShelfCategory }) {
  const playQueue = usePlayer((s) => s.playQueue);
  const color = category.color ?? FALLBACK;

  function handlePlay() {
    if (category.songs.length) playQueue(category.songs, 0);
  }

  return (
    <button
      onClick={handlePlay}
      className="group relative h-28 overflow-hidden rounded-2xl p-4 text-left transition hover:scale-[1.02]"
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}22)`,
      }}
    >
      <span className="text-lg font-bold text-white drop-shadow">
        {category.name}
      </span>
      <span className="absolute -bottom-3 -right-2 rotate-12 text-6xl opacity-20 transition group-hover:opacity-30">
        ♪
      </span>
    </button>
  );
}
