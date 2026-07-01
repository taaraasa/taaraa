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

  // Assemble the shelves in order, then reveal them with a stagger.
  const shelves: React.ReactNode[] = [];
  if (recent.length) shelves.push(<ShelfRow key="recent" title="Recently Played" songs={recent} />);
  shelves.push(
    <ShelfRow
      key="rec"
      title="Recommended for You"
      subtitle="Fresh picks from across the TAARAA catalog"
      songs={recommended}
    />
  );
  shelves.push(
    <ShelfRow key="trend" title="Trending Now" subtitle="What listeners are playing most" songs={trending} />
  );
  for (const c of categories) {
    shelves.push(<ShelfRow key={c.id} title={c.name} songs={c.songs} />);
  }

  return (
    <div className="space-y-8">
      <div className="anim-rise">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          {greeting()}, <span className="text-starlight">{name}</span>
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Tap any track to start streaming across the stars.
        </p>
      </div>

      {categories.length > 0 && (
        <section
          className="anim-rise grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          style={{ animationDelay: "60ms" }}
        >
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </section>
      )}

      {shelves.map((shelf, i) => (
        <div key={i} className="anim-rise" style={{ animationDelay: `${120 + i * 70}ms` }}>
          {shelf}
        </div>
      ))}
    </div>
  );
}
