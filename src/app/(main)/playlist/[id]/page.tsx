import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getPlaylist, getLikedSongIds } from "@/lib/data/library";
import PageHeader from "@/components/music/PageHeader";
import PlaylistHeaderEditor from "@/components/library/PlaylistHeaderEditor";
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
      {playlist.isOwner ? (
        <PlaylistHeaderEditor
          playlistId={playlist.id}
          initialName={playlist.name}
          initialDescription={playlist.description}
          trackCount={playlist.tracks.length}
        />
      ) : (
        <PageHeader
          eyebrow="Playlist"
          title={playlist.name}
          seed={playlist.id}
          subtitle={playlist.description ?? `${playlist.tracks.length} songs`}
        />
      )}

      <div className="flex items-center gap-4">
        <PlayAllButton songs={playlist.tracks} />
        {playlist.isOwner && <DeletePlaylistButton playlistId={playlist.id} />}
      </div>

      {playlist.tracks.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-space-800/50 p-8 text-center">
          <p className="text-lg font-semibold text-white">This playlist is empty</p>
          <p className="mt-1 text-sm text-white/50">
            Open an album or artist, tap the{" "}
            <span className="text-white">＋</span> on any song, and add it here.
          </p>
        </div>
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
