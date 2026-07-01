import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ============================================================
   TAARAA — Jamendo catalog seeder
   ------------------------------------------------------------
   Pulls real, legally-streamable Creative Commons tracks from
   the Jamendo API and loads them into your database, complete
   with artists, albums, cover art, and genre categories.

   USAGE:
     JAMENDO_CLIENT_ID=your_id_here node prisma/seed-jamendo.mjs

   or add JAMENDO_CLIENT_ID to your .env and run:
     node prisma/seed-jamendo.mjs
   ============================================================ */

const CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

if (!CLIENT_ID) {
  console.error(
    "\n❌ Missing JAMENDO_CLIENT_ID.\n" +
      "   Get a free Client ID at https://devportal.jamendo.com\n" +
      "   Then run:  JAMENDO_CLIENT_ID=your_id node prisma/seed-jamendo.mjs\n"
  );
  process.exit(1);
}

// Map TAARAA categories -> Jamendo "fuzzytags" (their genre tagging).
const CATEGORIES = [
  { name: "Pop", slug: "pop", color: "#e0457b", tag: "pop" },
  { name: "Lo-Fi", slug: "lofi", color: "#6a5acd", tag: "lounge" },
  { name: "Rock", slug: "rock", color: "#c0392b", tag: "rock" },
  { name: "Electronic", slug: "electronic", color: "#1f9e8f", tag: "electronic" },
  { name: "Indie", slug: "indie", color: "#d98a29", tag: "indie" },
];

const PER_CATEGORY = 24; // ~24 x 5 = 120 tracks before de-duplication

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

  // Pull each genre, tagging every track with which TAARAA category it belongs to.
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

  // Categories
  const catBySlug = {};
  for (const c of CATEGORIES) {
    catBySlug[c.slug] = await prisma.category.create({
      data: { name: c.name, slug: c.slug, color: c.color },
    });
  }

  // De-dup caches
  const artistByName = {};
  const albumByKey = {};
  const seenTrackIds = new Set();

  async function getArtist(name, image) {
    const key = name.toLowerCase();
    if (!artistByName[key]) {
      artistByName[key] = await prisma.artist.create({
        data: { name, image: image || null, verified: true },
      });
    }
    return artistByName[key];
  }

  async function getAlbum(title, cover, artistId) {
    if (!title) return null;
    const key = `${title.toLowerCase()}::${artistId}`;
    if (!albumByKey[key]) {
      albumByKey[key] = await prisma.album.create({
        data: {
          title,
          coverImage: cover || null,
          artistId,
          releaseDate: new Date(),
        },
      });
    }
    return albumByKey[key];
  }

  let created = 0;
  let plays = 5000;

  for (const { cat, tracks } of buckets) {
    for (const t of tracks) {
      // Skip anything missing a streamable file, and skip duplicates
      // (the same track can appear under multiple genres).
      if (!t.audio || seenTrackIds.has(t.id)) continue;
      seenTrackIds.add(t.id);

      const artist = await getArtist(t.artist_name, t.artist_image);
      const album = await getAlbum(t.album_name, t.album_image || t.image, artist.id);

      await prisma.song.create({
        data: {
          title: t.name,
          duration: Math.round(Number(t.duration) || 180),
          audioUrl: t.audio, // direct, legal MP3 stream URL from Jamendo
          coverImage: t.album_image || t.image || null,
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
