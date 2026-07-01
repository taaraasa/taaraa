"use client";

import { useEffect, useState, useTransition } from "react";
import { toggleLike, checkLiked } from "@/app/actions/likes";

export default function LikeButton({
  songId,
  initiallyLiked,
  size = 18,
  onToggled,
}: {
  songId: string;
  initiallyLiked?: boolean;
  size?: number;
  onToggled?: (liked: boolean) => void;
}) {
  const [liked, setLiked] = useState<boolean>(!!initiallyLiked);
  const [, startTransition] = useTransition();

  // Keep controlled instances in sync after a server refresh.
  useEffect(() => {
    if (initiallyLiked !== undefined) setLiked(initiallyLiked);
  }, [initiallyLiked]);

  // Self-fetch when no initial state was provided (e.g. the player bar).
  useEffect(() => {
    if (initiallyLiked === undefined) {
      checkLiked(songId)
        .then(setLiked)
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    const optimistic = !liked;
    setLiked(optimistic);
    startTransition(async () => {
      try {
        const res = await toggleLike(songId);
        setLiked(res.liked);
        onToggled?.(res.liked);
      } catch {
        setLiked(!optimistic);
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={liked ? "Remove from Liked Songs" : "Add to Liked Songs"}
      className={`transition hover:scale-110 ${liked ? "text-starlight-gold" : "text-white/40 hover:text-white"}`}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M12 21s-7.5-4.6-10-9.2C.4 8.4 2 5 5.3 5c2 0 3.3 1.1 4.2 2.4L12 10l2.5-2.6C15.4 6.1 16.7 5 18.7 5 22 5 23.6 8.4 22 11.8 19.5 16.4 12 21 12 21z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
