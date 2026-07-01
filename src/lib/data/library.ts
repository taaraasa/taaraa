import { prisma } from "@/lib/prisma";
import type { TrackListItem, PlaylistLite } from "@/types/music";

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

export type AlbumDetail = {
  id: string;
  title: string;
  coverImage: string | null;
  releaseDate: Date | null;
  artist: { id: string; name: string };
  tracks: TrackListItem[];
};

export async function getAlbum(id: string): Promise<AlbumDetail | null> {
  const album = await prisma.album.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      coverImage: true,
      releaseDate: true,
      artist: { select: { id: true, name: true } },
      songs: { orderBy: { createdAt: "asc" }, select: songSelectFull },
    },
  });
  if (!album) return null;
  return {
    id: album.id,
    title: album.title,
    coverImage: album.coverImage,
    releaseDate: album.releaseDate,
    artist: album.artist,
    tracks: album.songs.map(toTrack),
  };
}

export type ArtistDetail = {
  id: string;
  name: string;
  bio: string | null;
  image: string | null;
  verified: boolean;
  tracks: TrackListItem[];
  albums: { id: string; title: string; coverImage: string | null }[];
};

export async function getArtist(id: string): Promise<ArtistDetail | null> {
  const artist = await prisma.artist.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      image: true,
      verified: true,
      songs: { orderBy: { plays: "desc" }, select: songSelectFull },
      albums: {
        select: { id: true, title: true, coverImage: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!artist) return null;
  return {
    id: artist.id,
    name: artist.name,
    bio: artist.bio,
    image: artist.image,
    verified: artist.verified,
    tracks: artist.songs.map(toTrack),
    albums: artist.albums,
  };
}

export async function getSong(id: string): Promise<TrackListItem | null> {
  const song = await prisma.song.findUnique({
    where: { id },
    select: songSelectFull,
  });
  return song ? toTrack(song) : null;
}

export type PlaylistDetail = {
  id: string;
  name: string;
  description: string | null;
  isOwner: boolean;
  tracks: TrackListItem[];
};

export async function getPlaylist(
  id: string,
  userId: string
): Promise<PlaylistDetail | null> {
  const playlist = await prisma.playlist.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      isPublic: true,
      userId: true,
      songs: {
        orderBy: { order: "asc" },
        select: { song: { select: songSelectFull } },
      },
    },
  });
  if (!playlist) return null;
  const isOwner = playlist.userId === userId;
  if (!playlist.isPublic && !isOwner) return null;

  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    isOwner,
    tracks: playlist.songs.map((ps: { song: SongFull }) => toTrack(ps.song)),
  };
}

export async function getUserPlaylists(userId: string): Promise<
  { id: string; name: string; description: string | null; songCount: number }[]
> {
  const playlists = await prisma.playlist.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { songs: true } },
    },
  });
  return playlists.map(
    (p: {
      id: string;
      name: string;
      description: string | null;
      _count: { songs: number };
    }) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      songCount: p._count.songs,
    })
  );
}

export async function getUserPlaylistsLite(
  userId: string
): Promise<PlaylistLite[]> {
  const playlists = await prisma.playlist.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true },
  });
  return playlists;
}

export async function getLikedSongs(userId: string): Promise<TrackListItem[]> {
  const rows = await prisma.likedSong.findMany({
    where: { userId },
    orderBy: { likedAt: "desc" },
    select: { song: { select: songSelectFull } },
  });
  return rows.map((r: { song: SongFull }) => toTrack(r.song));
}

export async function getLikedSongIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.likedSong.findMany({
    where: { userId },
    select: { songId: true },
  });
  return new Set(rows.map((r: { songId: string }) => r.songId));
}

export async function getLikedCount(userId: string): Promise<number> {
  return prisma.likedSong.count({ where: { userId } });
}
