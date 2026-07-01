import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PlayerBar from "@/components/player/PlayerBar";
import { getUserPlaylistsLite } from "@/lib/data/library";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const playlists = await getUserPlaylistsLite(session.user.id);

  return (
    <div className="starfield relative min-h-screen bg-space-900 bg-taaraa-radial">
      <div className="relative z-10 flex min-h-screen">
        <Sidebar playlists={playlists} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-4 pb-32 pt-2 sm:px-8">{children}</main>
        </div>
      </div>
      <PlayerBar />
    </div>
  );
}
