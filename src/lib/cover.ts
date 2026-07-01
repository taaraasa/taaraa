// Deterministic gradient generated from a seed string (song id / title).
// Gives every track a stable, unique "album art" without loading any images.
export function coverGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) % 360;
  }
  const h2 = (h + 45) % 360;
  return `linear-gradient(135deg, hsl(${h} 68% 48%), hsl(${h2} 60% 26%))`;
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
