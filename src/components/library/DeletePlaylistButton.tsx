"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePlaylist } from "@/app/actions/playlists";

export default function DeletePlaylistButton({
  playlistId,
}: {
  playlistId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this playlist? This cannot be undone.")) return;
    startTransition(async () => {
      await deletePlaylist(playlistId);
      router.push("/library");
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/60 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete playlist"}
    </button>
  );
}
