import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getPlaylist, getLikedSongIds } from "@/lib/data/library";
import PageHeader from "@/components/music/PageHeader";
import PlayAllButton from "@/components/music/PlayAllButton";
import SongRow from "@/components/music/SongRow";
import DeletePlaylistButton from "@/components/library/DeletePlaylistButton";

export default async function PlaylistPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const userId = session!.user.id;

  const [playlist, likedIds] = await Promise.all([
    getPlaylist(params.id, userId),
    getLikedSongIds(userId),
  ]);

  if (!playlist) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Playlist"
        title={playlist.name}
        seed={playlist.id}
        subtitle={
          playlist.description ?? `${playlist.tracks.length} songs`
        }
      />

      <div className="flex items-center gap-4">
        <PlayAllButton songs={playlist.tracks} />
        {playlist.isOwner && <DeletePlaylistButton playlistId={playlist.id} />}
      </div>

      {playlist.tracks.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-space-800/50 p-6 text-white/50">
          This playlist is empty. Open an album or artist, tap the{" "}
          <span className="text-white">＋</span> next to a song, and add it here.
        </p>
      ) : (
        <div className="space-y-1">
          {playlist.tracks.map((track, i) => (
            <SongRow
              key={track.id}
              index={i}
              song={track}
              queue={playlist.tracks}
              initiallyLiked={likedIds.has(track.id)}
              inPlaylistId={playlist.isOwner ? playlist.id : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
