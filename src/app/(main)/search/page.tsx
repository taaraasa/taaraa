import { auth } from "@/auth";
import { getUserPlaylistsLite, getLikedSongIds } from "@/lib/data/library";
import SearchExperience from "@/components/search/SearchExperience";

export default async function SearchPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [playlists, likedIds] = await Promise.all([
    getUserPlaylistsLite(userId),
    getLikedSongIds(userId),
  ]);

  return (
    <SearchExperience playlists={playlists} likedIds={Array.from(likedIds)} />
  );
}
