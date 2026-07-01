import { prisma } from "@/lib/prisma";
import type { PlayerSong } from "@/types/music";

type SongWithArtist = {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  artist: { name: string };
};

const songSelect = {
  id: true,
  title: true,
  audioUrl: true,
  duration: true,
  artist: { select: { name: true } },
} as const;

export function toPlayerSong(s: SongWithArtist): PlayerSong {
  return {
    id: s.id,
    title: s.title,
    artistName: s.artist.name,
    audioUrl: s.audioUrl,
    duration: s.duration,
  };
}

export async function getLikedSongIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.likedSong.findMany({
    where: { userId },
    select: { songId: true },
  });
  return new Set(rows.map((r: { songId: string }) => r.songId));
}

export async function getSong(id: string) {
  const song = await prisma.song.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      audioUrl: true,
      duration: true,
      plays: true,
      artist: { select: { id: true, name: true } },
      album: { select: { id: true, title: true } },
      categories: { select: { name: true } },
    },
  });
  return song;
}

export async function getAlbum(id: string) {
  const album = await prisma.album.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      releaseDate: true,
      artist: { select: { id: true, name: true } },
      songs: { select: songSelect, orderBy: { createdAt: "asc" } },
    },
  });
  return album;
}

export async function getArtist(id: string) {
  const artist = await prisma.artist.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      verified: true,
      songs: {
        select: songSelect,
        orderBy: { plays: "desc" },
        take: 20,
      },
      albums: {
        select: { id: true, title: true, releaseDate: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return artist;
}

export async function getPlaylist(id: string) {
  const playlist = await prisma.playlist.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      userId: true,
      songs: {
        orderBy: { order: "asc" },
        select: { song: { select: songSelect } },
      },
    },
  });
  return playlist;
}

// ---- Library page data ----
export async function getLikedSongs(userId: string): Promise<PlayerSong[]> {
  const rows = await prisma.likedSong.findMany({
    where: { userId },
    orderBy: { likedAt: "desc" },
    select: { song: { select: songSelect } },
  });
  return rows.map((r: { song: SongWithArtist }) => toPlayerSong(r.song));
}

export async function getUserPlaylists(userId: string) {
  const playlists = await prisma.playlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { songs: true } },
    },
  });
  return playlists;
}
