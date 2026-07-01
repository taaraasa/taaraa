import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSong, getLikedSongIds } from "@/lib/data/library";
import PageHeader from "@/components/music/PageHeader";
import PlayAllButton from "@/components/music/PlayAllButton";
import LikeButton from "@/components/music/LikeButton";

export default async function SongPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const userId = session!.user.id;

  const [song, likedIds] = await Promise.all([
    getSong(params.id),
    getLikedSongIds(userId),
  ]);

  if (!song) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Song"
        title={song.title}
        seed={song.id}
        coverSrc={song.coverImage}
        subtitle={
          <span>
            {song.artistId ? (
              <Link href={`/artist/${song.artistId}`} className="font-semibold text-white hover:underline">
                {song.artistName}
              </Link>
            ) : (
              song.artistName
            )}
            {song.albumId && (
              <>
                {" · "}
                <Link href={`/album/${song.albumId}`} className="hover:underline">
                  {song.albumTitle}
                </Link>
              </>
            )}
          </span>
        }
      />

      <div className="flex items-center gap-5">
        <PlayAllButton songs={[song]} />
        <LikeButton songId={song.id} initiallyLiked={likedIds.has(song.id)} size={26} />
      </div>
    </div>
  );
}
