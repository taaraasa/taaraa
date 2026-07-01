import { auth } from "@/auth";
import {
  getCategoriesWithSongs,
  getRecommended,
  getTrendingSongs,
  getRecentlyPlayed,
} from "@/lib/data/music";
import ShelfRow from "@/components/music/ShelfRow";
import CategoryCard from "@/components/music/CategoryCard";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [categories, trending, recommended, recent] = await Promise.all([
    getCategoriesWithSongs(),
    getTrendingSongs(),
    getRecommended(),
    getRecentlyPlayed(userId),
  ]);

  const name = session?.user?.name?.split(" ")[0] ?? "Stargazer";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {greeting()}, <span className="text-starlight">{name}</span>
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Tap any track to start streaming across the stars.
        </p>
      </div>

      {categories.length > 0 && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </section>
      )}

      {recent.length > 0 && (
        <ShelfRow title="Recently Played" songs={recent} />
      )}

      <ShelfRow
        title="Recommended for You"
        subtitle="Fresh picks based on the TAARAA catalog"
        songs={recommended}
      />

      <ShelfRow
        title="Trending Now"
        subtitle="What listeners are playing most"
        songs={trending}
      />

      {categories.map((c) => (
        <ShelfRow key={c.id} title={c.name} songs={c.songs} />
      ))}
    </div>
  );
}
