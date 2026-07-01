import { auth } from "@/auth";
import { getLikedSongs, getUserPlaylistsLite } from "@/lib/data/library";
import PageHeader from "@/components/music/PageHeader";
import PlayAllButton from "@/components/music/PlayAllButton";
import SongRow from "@/components/music/SongRow";

export default async function LikedSongsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [tracks, playlists] = await Promise.all([
    getLikedSongs(userId),
    getUserPlaylistsLite(userId),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Playlist"
        title="Liked Songs"
        seed="liked-songs-taaraa"
        subtitle={`${tracks.length} songs you love`}
      />

      {tracks.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-space-800/50 p-6 text-white/50">
          You haven&apos;t liked any songs yet. Tap the heart on any track and it
          will appear here.
        </p>
      ) : (
        <>
          <PlayAllButton songs={tracks} />
          <div className="space-y-1">
            {tracks.map((track, i) => (
              <SongRow
                key={track.id}
                index={i}
                song={track}
                queue={tracks}
                initiallyLiked={true}
                playlists={playlists}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
