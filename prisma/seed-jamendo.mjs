import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ============================================================
   TAARAA — Jamendo catalog seeder (with Hindi / Indian genre)
   ------------------------------------------------------------
   Pulls real, legally-streamable Creative Commons tracks from
   the Jamendo API, including independent Hindi/Indian artists.

   USAGE:
     node prisma/seed-jamendo.mjs
   (reads JAMENDO_CLIENT_ID from your .env)
   ============================================================ */

const CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

if (!CLIENT_ID) {
  console.error(
    "\n❌ Missing JAMENDO_CLIENT_ID.\n" +
      "   Get a free Client ID at https://devportal.jamendo.com\n" +
      "   Add it to your .env:  JAMENDO_CLIENT_ID=\"your_id\"\n"
  );
  process.exit(1);
}

// Each category maps to one or more Jamendo tags (fuzzytags accepts several).
const CATEGORIES = [
  { name: "Hindi & Indian", slug: "indian", color: "#ff7a1a", tag: "indian+bollywood+hindi" },
  { name: "Pop", slug: "pop", color: "#e0457b", tag: "pop" },
  { name: "Lo-Fi", slug: "lofi", color: "#6a5acd", tag: "lounge" },
  { name: "Rock", slug: "rock", color: "#c0392b", tag: "rock" },
  { name: "Electronic", slug: "electronic", color: "#1f9e8f", tag: "electronic" },
  { name: "Indie", slug: "indie", color: "#d98a29", tag: "indie" },
];

const PER_CATEGORY = 20; // 20 x 6 = up to 120 tracks before de-duplication

async function fetchTracks(tag) {
  const url =
    `https://api.jamendo.com/v3.0/tracks/?client_id=${CLIENT_ID}` +
    `&format=json&limit=${PER_CATEGORY}` +
    `&fuzzytags=${encodeURIComponent(tag)}` +
    `&include=musicinfo&audioformat=mp32` +
    `&order=popularity_total`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Jamendo API error for "${tag}": ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (data.headers && data.headers.status !== "success") {
    throw new Error(`Jamendo API said: ${data.headers.error_message || "unknown error"}`);
  }
  return data.results || [];
}

async function main() {
  console.log("Fetching tracks from Jamendo…");

  const buckets = [];
  for (const cat of CATEGORIES) {
    const tracks = await fetchTracks(cat.tag);
    console.log(`  ${cat.name}: ${tracks.length} tracks`);
    buckets.push({ cat, tracks });
  }

  console.log("\nClearing old catalog…");
  await prisma.recentlyPlayed.deleteMany();
  await prisma.playlistSong.deleteMany();
  await prisma.likedSong.deleteMany();
  await prisma.song.deleteMany();
  await prisma.album.deleteMany();
  await prisma.category.deleteMany();
  await prisma.artist.deleteMany();

  const catBySlug = {};
  for (const c of CATEGORIES) {
    catBySlug[c.slug] = await prisma.category.create({
      data: { name: c.name, slug: c.slug, color: c.color },
    });
  }

  const artistByName = {};
  const albumByKey = {};
  const seenTrackIds = new Set();

  async function getArtist(name, image) {
    const key = (name || "Unknown Artist").toLowerCase();
    if (!artistByName[key]) {
      artistByName[key] = await prisma.artist.create({
        data: { name: name || "Unknown Artist", image: image || null, verified: true },
      });
    }
    return artistByName[key];
  }

  async function getAlbum(title, cover, artistId) {
    if (!title) return null;
    const key = `${title.toLowerCase()}::${artistId}`;
    if (!albumByKey[key]) {
      albumByKey[key] = await prisma.album.create({
        data: { title, coverImage: cover || null, artistId, releaseDate: new Date() },
      });
    }
    return albumByKey[key];
  }

  let created = 0;
  let plays = 5000;

  for (const { cat, tracks } of buckets) {
    for (const t of tracks) {
      if (!t.audio || seenTrackIds.has(t.id)) continue;
      seenTrackIds.add(t.id);

      const artist = await getArtist(t.artist_name, t.artist_image);
      const cover = t.album_image || t.image || null;
      const album = await getAlbum(t.album_name, cover, artist.id);

      await prisma.song.create({
        data: {
          title: t.name,
          duration: Math.round(Number(t.duration) || 180),
          audioUrl: t.audio,
          coverImage: cover,
          plays,
          artistId: artist.id,
          albumId: album ? album.id : null,
          categories: { connect: [{ id: catBySlug[cat.slug].id }] },
        },
      });
      created += 1;
      plays -= 5;
    }
  }

  const count = await prisma.song.count();
  const artists = await prisma.artist.count();
  const albums = await prisma.album.count();
  console.log(
    `\n✅ Done. Seeded ${count} songs by ${artists} artists across ${albums} albums.`
  );
}

main()
  .catch((e) => {
    console.error("\n❌ Seeding failed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
