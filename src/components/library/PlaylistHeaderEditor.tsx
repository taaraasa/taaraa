"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Cover from "@/components/music/Cover";
import { updatePlaylist } from "@/app/actions/playlists";

export default function PlaylistHeaderEditor({
  playlistId,
  initialName,
  initialDescription,
  trackCount,
}: {
  playlistId: string;
  initialName: string;
  initialDescription: string | null;
  trackCount: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await updatePlaylist(playlistId, name, description);
      setEditing(false);
      router.refresh();
    });
  }

  function cancel() {
    setName(initialName);
    setDescription(initialDescription ?? "");
    setEditing(false);
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
      <div className="relative h-40 w-40 shrink-0 shadow-glow sm:h-52 sm:w-52">
        <Cover src={null} seed={playlistId} alt={name} className="absolute inset-0 h-full w-full" rounded="rounded-2xl" />
      </div>

      <div className="w-full text-center sm:text-left">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-starlight">
          Playlist
        </p>

        {editing ? (
          <div className="mt-3 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Playlist name"
              className="w-full rounded-xl border border-white/10 bg-space-700/70 px-4 py-2 text-2xl font-black text-white outline-none focus:border-starlight sm:text-4xl"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add an optional description"
              rows={2}
              className="w-full resize-none rounded-xl border border-white/10 bg-space-700/70 px-4 py-2 text-sm text-white/80 outline-none focus:border-starlight"
            />
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <button
                onClick={save}
                disabled={isPending}
                className="rounded-full bg-gradient-to-r from-midnight-400 to-starlight px-5 py-2 text-sm font-semibold text-space-900 disabled:opacity-60"
              >
                {isPending ? "Saving…" : "Save"}
              </button>
              <button onClick={cancel} className="rounded-full px-4 py-2 text-sm text-white/50 hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <button
              onClick={() => setEditing(true)}
              className="group inline-flex items-center gap-2 text-left"
              aria-label="Edit playlist details"
            >
              <h1 className="text-4xl font-black text-white sm:text-6xl">{initialName}</h1>
              <span className="text-white/30 transition group-hover:text-starlight">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            <p className="mt-3 text-sm text-white/60">
              {initialDescription ? initialDescription : `${trackCount} songs`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
