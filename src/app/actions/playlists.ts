"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPlaylist(
  name: string
): Promise<{ id: string } | { error: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Not signed in" };

  const clean = (name ?? "").trim() || "My Playlist";
  const playlist = await prisma.playlist.create({
    data: { name: clean, userId },
  });
  revalidatePath("/library");
  return { id: playlist.id };
}

export async function deletePlaylist(playlistId: string): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
    select: { userId: true },
  });
  if (!playlist || playlist.userId !== userId) return;

  await prisma.playlist.delete({ where: { id: playlistId } });
  revalidatePath("/library");
}

export async function addSongToPlaylist(
  playlistId: string,
  songId: string
): Promise<{ ok: boolean }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false };

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
    select: { userId: true },
  });
  if (!playlist || playlist.userId !== userId) return { ok: false };

  const order = await prisma.playlistSong.count({ where: { playlistId } });
  await prisma.playlistSong.upsert({
    where: { playlistId_songId: { playlistId, songId } },
    create: { playlistId, songId, order },
    update: {},
  });
  revalidatePath(`/playlist/${playlistId}`);
  return { ok: true };
}

export async function removeSongFromPlaylist(
  playlistId: string,
  songId: string
): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
    select: { userId: true },
  });
  if (!playlist || playlist.userId !== userId) return;

  await prisma.playlistSong.deleteMany({ where: { playlistId, songId } });
  revalidatePath(`/playlist/${playlistId}`);
}
