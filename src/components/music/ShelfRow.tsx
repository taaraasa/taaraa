import SongCard from "@/components/music/SongCard";
import type { TrackListItem } from "@/types/music";

export default function ShelfRow({
  title,
  subtitle,
  songs,
}: {
  title: string;
  subtitle?: string;
  songs: TrackListItem[];
}) {
  if (!songs.length) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {songs.map((song) => (
          <SongCard key={song.id} song={song} queue={songs} />
        ))}
      </div>
    </section>
  );
}
