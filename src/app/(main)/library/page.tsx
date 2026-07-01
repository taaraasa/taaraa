import Link from "next/link";
import { auth } from "@/auth";
import { getUserPlaylists, getLikedCount } from "@/lib/data/library";
import { coverGradient } from "@/lib/cover";
import CreatePlaylist from "@/components/library/CreatePlaylist";

export default async function LibraryPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [playlists, likedCount] = await Promise.all([
    getUserPlaylists(userId),
    getLikedCount(userId),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Your Library</h1>
        <CreatePlaylist />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {/* Liked Songs pseudo-playlist */}
        <Link
          href="/library/liked"
          className="group rounded-2xl border border-white/5 bg-space-800/40 p-4 transition hover:bg-space-700/60"
        >
          <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-gradient-to-br from-midnight-500 to-starlight shadow-glow">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#06060d">
              <path d="M12 21s-7.5-4.6-10-9.2C.4 8.4 2 5 5.3 5c2 0 3.3 1.1 4.2 2.4L12 10l2.5-2.6C15.4 6.1 16.7 5 18.7 5 22 5 23.6 8.4 22 11.8 19.5 16.4 12 21 12 21z" />
            </svg>
          </div>
          <p className="mt-3 text-sm font-bold text-white">Liked Songs</p>
          <p className="text-xs text-white/50">{likedCount} songs</p>
        </Link>

        {playlists.map((p) => (
          <Link
            key={p.id}
            href={`/playlist/${p.id}`}
            className="group rounded-2xl border border-white/5 bg-space-800/40 p-4 transition hover:bg-space-700/60"
          >
            <div
              className="aspect-square w-full rounded-xl shadow-lg"
              style={{ background: coverGradient(p.id) }}
            />
            <p className="mt-3 truncate text-sm font-bold text-white">{p.name}</p>
            <p className="text-xs text-white/50">{p.songCount} songs</p>
          </Link>
        ))}
      </div>

      {playlists.length === 0 && (
        <p className="text-sm text-white/40">
          You haven&apos;t created any playlists yet. Hit{" "}
          <span className="text-white">Create playlist</span> to start one.
        </p>
      )}
    </div>
  );
}
