import { prisma } from "@/lib/prisma";
import type { TrackListItem } from "@/types/music";

type SongFull = {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  coverImage: string | null;
  artist: { id: string; name: string };
  album: { id: string; title: string } | null;
};

const songSelectFull = {
  id: true,
  title: true,
  audioUrl: true,
  duration: true,
  coverImage: true,
  artist: { select: { id: true, name: true } },
  album: { select: { id: true, title: true } },
} as const;

function toTrack(s: SongFull): TrackListItem {
  return {
    id: s.id,
    title: s.title,
    audioUrl: s.audioUrl,
    duration: s.duration,
    coverImage: s.coverImage,
    artistName: s.artist.name,
    artistId: s.artist.id,
    albumId: s.album?.id ?? null,
    albumTitle: s.album?.title ?? null,
  };
}

export type SearchResults = {
  songs: TrackListItem[];
  artists: { id: string; name: string; verified: boolean; image: string | null }[];
  albums: { id: string; title: string; artistName: string; coverImage: string | null }[];
};

export async function search(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (!q) return { songs: [], artists: [], albums: [] };

  const [songs, artists, albums] = await Promise.all([
    prisma.song.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 20,
      orderBy: { plays: "desc" },
      select: songSelectFull,
    }),
    prisma.artist.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 10,
      select: { id: true, name: true, verified: true, image: true },
    }),
    prisma.album.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 10,
      select: {
        id: true,
        title: true,
        coverImage: true,
        artist: { select: { name: true } },
      },
    }),
  ]);

  return {
    songs: songs.map(toTrack),
    artists: artists.map(
      (a: { id: string; name: string; verified: boolean; image: string | null }) => a
    ),
    albums: albums.map(
      (al: {
        id: string;
        title: string;
        coverImage: string | null;
        artist: { name: string };
      }) => ({
        id: al.id,
        title: al.title,
        coverImage: al.coverImage,
        artistName: al.artist.name,
      })
    ),
  };
}
