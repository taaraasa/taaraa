import { prisma } from "@/lib/prisma";
import type { TrackListItem, ShelfCategory } from "@/types/music";

type SongFull = {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  coverImage: string | null;
  artist: { id: string; name: string };
  album: { id: string; title: string } | null;
};

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

const songSelect = {
  id: true,
  title: true,
  audioUrl: true,
  duration: true,
  coverImage: true,
  artist: { select: { id: true, name: true } },
  album: { select: { id: true, title: true } },
} as const;

export async function getTrendingSongs(limit = 10): Promise<TrackListItem[]> {
  const songs = await prisma.song.findMany({
    orderBy: { plays: "desc" },
    take: limit,
    select: songSelect,
  });
  return songs.map(toTrack);
}

export async function getRecommended(limit = 10): Promise<TrackListItem[]> {
  const songs = await prisma.song.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: songSelect,
  });
  return songs.map(toTrack);
}

export async function getCategoriesWithSongs(): Promise<ShelfCategory[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      songs: { take: 10, select: songSelect },
    },
  });
  return categories.map(
    (c: {
      id: string;
      name: string;
      slug: string;
      color: string | null;
      songs: SongFull[];
    }) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      color: c.color,
      songs: c.songs.map(toTrack),
    })
  );
}

export async function getRecentlyPlayed(
  userId: string,
  limit = 10
): Promise<TrackListItem[]> {
  const rows = await prisma.recentlyPlayed.findMany({
    where: { userId },
    orderBy: { playedAt: "desc" },
    take: limit,
    select: { song: { select: songSelect } },
  });
  return rows.map((r: { song: SongFull }) => toTrack(r.song));
}
