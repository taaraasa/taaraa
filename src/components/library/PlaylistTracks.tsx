"use client";

import { useState, useTransition } from "react";
import { removeSongFromPlaylist } from "@/app/actions/library";
import TrackList from "@/components/music/TrackList";
import type { PlayerSong } from "@/types/music";

export default function PlaylistTracks({
  playlistId,
  songs,
  likedIds,
  canEdit,
}: {
  playlistId: string;
  songs: PlayerSong[];
  likedIds: string[];
  canEdit: boolean;
}) {
  const [list, setList] = useState(songs);
  const [, startTransition] = useTransition();

  function handleRemove(songId: string) {
    setList((prev) => prev.filter((s) => s.id !== songId));
    startTransition(async () => {
      await removeSongFromPlaylist(playlistId, songId);
    });
  }

  return (
    <TrackList
      songs={list}
      likedIds={likedIds}
      onRemove={canEdit ? handleRemove : undefined}
    />
  );
}
