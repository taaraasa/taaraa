import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAlbum, getLikedSongIds, getUserPlaylistsLite } from "@/lib/data/library";
import PageHeader from "@/components/music/PageHeader";
import PlayAllButton from "@/components/music/PlayAllButton";
import SongRow from "@/components/music/SongRow";

export default async function AlbumPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const userId = session!.user.id;

  const [album, likedIds, playlists] = await Promise.all([
    getAlbum(params.id),
    getLikedSongIds(userId),
    getUserPlaylistsLite(userId),
  ]);

  if (!album) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Album"
        title={album.title}
        seed={album.id}
        subtitle={
          <span>
            <Link href={`/artist/${album.artist.id}`} className="font-semibold text-white hover:underline">
              {album.artist.name}
            </Link>{" "}
            · {album.tracks.length} songs
          </span>
        }
      />

      <PlayAllButton songs={album.tracks} />

      <div className="space-y-1">
        {album.tracks.map((track, i) => (
          <SongRow
            key={track.id}
            index={i}
            song={track}
            queue={album.tracks}
            initiallyLiked={likedIds.has(track.id)}
            playlists={playlists}
          />
        ))}
      </div>
    </div>
  );
}
