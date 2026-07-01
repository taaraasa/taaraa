import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArtist, getLikedSongIds, getUserPlaylistsLite } from "@/lib/data/library";
import { coverGradient } from "@/lib/cover";
import PageHeader from "@/components/music/PageHeader";
import PlayAllButton from "@/components/music/PlayAllButton";
import SongRow from "@/components/music/SongRow";

export default async function ArtistPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const userId = session!.user.id;

  const [artist, likedIds, playlists] = await Promise.all([
    getArtist(params.id),
    getLikedSongIds(userId),
    getUserPlaylistsLite(userId),
  ]);

  if (!artist) notFound();

  const topTracks = artist.tracks.slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={artist.verified ? "Verified Artist" : "Artist"}
        title={artist.name}
        seed={artist.id}
        round
        subtitle={artist.bio ?? `${artist.tracks.length} songs`}
      />

      <PlayAllButton songs={artist.tracks} />

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">Popular</h2>
        <div className="space-y-1">
          {topTracks.map((track, i) => (
            <SongRow
              key={track.id}
              index={i}
              song={track}
              queue={artist.tracks}
              initiallyLiked={likedIds.has(track.id)}
              playlists={playlists}
            />
          ))}
        </div>
      </section>

      {artist.albums.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Albums</h2>
          <div className="flex flex-wrap gap-4">
            {artist.albums.map((al) => (
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
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
