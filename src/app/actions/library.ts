"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireUser(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

// ---- Liking songs ----
export async function toggleLike(songId: string): Promise<{ liked: boolean }> {
  const userId = await requireUser();
  if (!userId) return { liked: false };

  const existing = await prisma.likedSong.findUnique({
    where: { userId_songId: { userId, songId } },
  });

  if (existing) {
    await prisma.likedSong.delete({
      where: { userId_songId: { userId, songId } },
    });
    revalidatePath("/library");
    return { liked: false };
  }

  await prisma.likedSong.create({ data: { userId, songId } });
  revalidatePath("/library");
  return { liked: true };
}

// ---- Creating playlists ----
export async function createPlaylist(
  name: string,
  description?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const userId = await requireUser();
  if (!userId) return { success: false, error: "Not signed in." };

  const clean = name.trim();
  if (!clean) return { success: false, error: "Playlist name is required." };

  const playlist = await prisma.playlist.create({
    data: { name: clean, description: description?.trim() || null, userId },
  });

  revalidatePath("/library");
  return { success: true, id: playlist.id };
}

export async function deletePlaylist(
  playlistId: string
): Promise<{ success: boolean }> {
  const userId = await requireUser();
  if (!userId) return { success: false };

  await prisma.playlist.deleteMany({ where: { id: playlistId, userId } });
  revalidatePath("/library");
  return { success: true };
}

// ---- Adding / removing songs from a playlist ----
export async function addSongToPlaylist(
  playlistId: string,
  songId: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await requireUser();
  if (!userId) return { success: false, error: "Not signed in." };

  // Ownership check
  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId, userId },
    select: { id: true },
  });
  if (!playlist) return { success: false, error: "Playlist not found." };

  const existing = await prisma.playlistSong.findUnique({
    where: { playlistId_songId: { playlistId, songId } },
  });
  if (existing) return { success: true }; // already there

  const count = await prisma.playlistSong.count({ where: { playlistId } });
  await prisma.playlistSong.create({
    data: { playlistId, songId, order: count },
  });

  revalidatePath(`/playlist/${playlistId}`);
  revalidatePath("/library");
  return { success: true };
}

export async function removeSongFromPlaylist(
  playlistId: string,
  songId: string
): Promise<{ success: boolean }> {
  const userId = await requireUser();
  if (!userId) return { success: false };

  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId, userId },
    select: { id: true },
  });
  if (!playlist) return { success: false };

  await prisma.playlistSong.deleteMany({ where: { playlistId, songId } });
  revalidatePath(`/playlist/${playlistId}`);
  return { success: true };
}
