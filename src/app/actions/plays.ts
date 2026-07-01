"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Records a play into RecentlyPlayed (one row per song, refreshed timestamp)
// and increments the song's play counter. Fire-and-forget from the client.
export async function recordPlay(songId: string): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  try {
    await prisma.$transaction([
      prisma.recentlyPlayed.deleteMany({ where: { userId, songId } }),
      prisma.recentlyPlayed.create({ data: { userId, songId } }),
      prisma.song.update({
        where: { id: songId },
        data: { plays: { increment: 1 } },
      }),
    ]);
  } catch {
    // Non-critical: never let play tracking break playback.
  }
}
