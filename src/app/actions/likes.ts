"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function toggleLike(
  songId: string
): Promise<{ liked: boolean }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { liked: false };

  const existing = await prisma.likedSong.findUnique({
    where: { userId_songId: { userId, songId } },
  });

  if (existing) {
    await prisma.likedSong.delete({
      where: { userId_songId: { userId, songId } },
    });
    return { liked: false };
  }

  await prisma.likedSong.create({ data: { userId, songId } });
  return { liked: true };
}

export async function checkLiked(songId: string): Promise<boolean> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return false;

  const existing = await prisma.likedSong.findUnique({
    where: { userId_songId: { userId, songId } },
  });
  return !!existing;
}
