"use client";

import { useState } from "react";
import { coverGradient } from "@/lib/cover";

// Renders a real cover image when available, falling back to the
// signature TAARAA gradient (also used if the image fails to load).
export default function Cover({
  src,
  seed,
  alt = "",
  className = "",
  rounded = "rounded-xl",
}: {
  src?: string | null;
  seed: string;
  alt?: string;
  className?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${className} ${rounded} object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} ${rounded}`}
      style={{ background: coverGradient(seed) }}
      aria-hidden
    />
  );
}
