"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { searchAll } from "@/app/actions/search";
import { coverGradient } from "@/lib/cover";
import SongRow from "@/components/music/SongRow";
import type { SearchResults } from "@/lib/data/search";
import type { PlaylistLite } from "@/types/music";

const EMPTY: SearchResults = { songs: [], artists: [], albums: [] };

export default function SearchExperience({
  playlists,
  likedIds,
}: {
  playlists: PlaylistLite[];
  likedIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [isPending, startTransition] = useTransition();
  const [touched, setTouched] = useState(false);

  const likedSet = new Set(likedIds);

  // Debounced search as the user types.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(EMPTY);
      setTouched(false);
      return;
    }
    setTouched(true);
    const handle = setTimeout(() => {
      startTransition(async () => {
        const res = await searchAll(q);
        setResults(res);
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  const hasResults =
    results.songs.length || results.artists.length || results.albums.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Search</h1>
        <div className="relative mt-4 max-w-xl">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
          </span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Songs, artists, or albums…"
            className="w-full rounded-full border border-white/10 bg-space-700/70 py-3 pl-12 pr-4 text-white placeholder-white/30 outline-none transition focus:border-starlight focus:shadow-glow"
          />
        </div>
      </div>

      {isPending && (
        <p className="text-sm text-white/40">Searching the constellation…</p>
      )}

      {touched && !isPending && !hasResults && (
        <p className="text-sm text-white/50">
          No results for &quot;{query}&quot;. Try a different name.
        </p>
      )}

      {/* Artists */}
      {results.artists.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Artists</h2>
          <div className="flex flex-wrap gap-4">
            {results.artists.map((a) => (
              <Link
                key={a.id}
                href={`/artist/${a.id}`}
                className="w-36 rounded-2xl border border-white/5 bg-space-800/40 p-4 text-center transition hover:bg-space-700/60"
              >
                <div
                  className="mx-auto aspect-square w-full rounded-full shadow-lg"
                  style={{ background: coverGradient(a.id) }}
                />
                <p className="mt-3 truncate text-sm font-semibold text-white">
                  {a.name}
                </p>
                <p className="text-xs text-white/40">
                  {a.verified ? "Verified Artist" : "Artist"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {results.albums.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Albums</h2>
          <div className="flex flex-wrap gap-4">
            {results.albums.map((al) => (
              <Link
                key={al.id}
                href={`/album/${al.id}`}
                className="w-40 rounded-2xl border border-white/5 bg-space-800/40 p-3 transition hover:bg-space-700/60"
              >
                <div
                  className="aspect-square w-full rounded-xl shadow-lg"
                  style={{ background: coverGradient(al.id) }}
                />
                <p className="mt-2 truncate text-sm font-semibold text-white">
                  {al.title}
                </p>
                <p className="truncate text-xs text-white/40">{al.artistName}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Songs */}
      {results.songs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Songs</h2>
          <div className="space-y-1">
            {results.songs.map((track, i) => (
              <SongRow
                key={track.id}
                index={i}
                song={track}
                queue={results.songs}
                initiallyLiked={likedSet.has(track.id)}
                playlists={playlists}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
