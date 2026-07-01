import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ============================================================
   TAARAA CATALOG
   ------------------------------------------------------------
   To add a song, add one line to the SONGS array below.

   Each song is an object:
   {
     title:    "Song name",
     artist:   "Artist name",          // reused across songs; created automatically
     category: "pop",                  // must match a slug in CATEGORIES
     url:      "/audio/my-song.mp3",   // file in public/audio  OR  a full https URL
     duration: 210,                    // length in seconds (a rough number is fine)
     album:    "Album name"            // optional; groups songs into an album
   }

   AUDIO URLS — two ways:
   1. Local file:  put the .mp3 in  public/audio/  and use  "/audio/name.mp3"
   2. External:    paste a full royalty-free URL, e.g. "https://.../track.mp3"
   ============================================================ */

const CATEGORIES = [
  { name: "Pop", slug: "pop", color: "#e0457b" },
  { name: "Lo-Fi", slug: "lofi", color: "#6a5acd" },
  { name: "Rock", slug: "rock", color: "#c0392b" },
  { name: "Electronic", slug: "electronic", color: "#1f9e8f" },
  { name: "Indie", slug: "indie", color: "#d98a29" },
];

const HELIX = (n) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

const SONGS = [
  // --- The starter catalog (SoundHelix demo tracks) ---
  { title: "Starlight Drive",   artist: "Nova Sterling",   category: "pop",        url: HELIX(1),  duration: 372, album: "Nova Sterling — Constellations" },
  { title: "Neon Orbit",        artist: "Nova Sterling",   category: "pop",        url: HELIX(2),  duration: 401, album: "Nova Sterling — Constellations" },
  { title: "Gravity of You",    artist: "Nova Sterling",   category: "pop",        url: HELIX(3),  duration: 348, album: "Nova Sterling — Constellations" },
  { title: "Thunder Halo",      artist: "The Meteor Kids", category: "rock",       url: HELIX(4),  duration: 289, album: "The Meteor Kids — Constellations" },
  { title: "Crash the Comet",   artist: "The Meteor Kids", category: "rock",       url: HELIX(5),  duration: 315, album: "The Meteor Kids — Constellations" },
  { title: "Redshift Riot",     artist: "The Meteor Kids", category: "rock",       url: HELIX(6),  duration: 366, album: "The Meteor Kids — Constellations" },
  { title: "Midnight Static",   artist: "Luna Vale",       category: "lofi",       url: HELIX(7),  duration: 254, album: "Luna Vale — Constellations" },
  { title: "Cassette Moon",     artist: "Luna Vale",       category: "lofi",       url: HELIX(8),  duration: 231, album: "Luna Vale — Constellations" },
  { title: "Slow Nebula",       artist: "Luna Vale",       category: "lofi",       url: HELIX(9),  duration: 278, album: "Luna Vale — Constellations" },
  { title: "Pulse Reactor",     artist: "Circuit Halo",    category: "electronic", url: HELIX(10), duration: 333, album: "Circuit Halo — Constellations" },
  { title: "Data Bloom",        artist: "Circuit Halo",    category: "electronic", url: HELIX(11), duration: 358, album: "Circuit Halo — Constellations" },
  { title: "Quantum Tide",      artist: "Circuit Halo",    category: "electronic", url: HELIX(12), duration: 297, album: "Circuit Halo — Constellations" },
  { title: "Paper Satellites",  artist: "Paper Comets",    category: "indie",      url: HELIX(13), duration: 264, album: "Paper Comets — Constellations" },
  { title: "Telescope Hearts",  artist: "Paper Comets",    category: "indie",      url: HELIX(14), duration: 302, album: "Paper Comets — Constellations" },
  { title: "Analog Sky",        artist: "Paper Comets",    category: "indie",      url: HELIX(15), duration: 319, album: "Paper Comets — Constellations" },

  // ============================================================
  // 👇 ADD YOUR OWN SONGS BELOW THIS LINE. Copy the pattern above.
  // Example (uncomment and edit after putting the file in public/audio/):
  //
  // { title: "My Track",  artist: "My Artist",  category: "pop",  url: "/audio/my-track.mp3",  duration: 200,  album: "My Album" },
  //
  // ============================================================
];

async function main() {
  console.log("Seeding TAARAA catalog…");

  // Clean slate so re-running gives a predictable catalog.
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
    catBySlug[c.slug] = await prisma.category.create({ data: c });
  }

  // Artists (created on demand, de-duplicated by name)
  const artistByName = {};
  async function getArtist(name) {
    if (!artistByName[name]) {
      artistByName[name] = await prisma.artist.create({
        data: { name, verified: true },
      });
    }
    return artistByName[name];
  }

  // Albums (created on demand, de-duplicated by title+artist)
  const albumByKey = {};
  async function getAlbum(title, artistId) {
    if (!title) return null;
    const key = `${title}::${artistId}`;
    if (!albumByKey[key]) {
      albumByKey[key] = await prisma.album.create({
        data: { title, artistId, releaseDate: new Date() },
      });
    }
    return albumByKey[key];
  }

  // Songs
  let plays = SONGS.length * 25; // descending, so "Trending" has a clear order
  for (const s of SONGS) {
    const category = catBySlug[s.category];
    if (!category) {
      console.warn(`⚠ Skipping "${s.title}" — unknown category "${s.category}".`);
      continue;
    }
    const artist = await getArtist(s.artist);
    const album = await getAlbum(s.album, artist.id);

    await prisma.song.create({
      data: {
        title: s.title,
        duration: s.duration,
        audioUrl: s.url,
        plays,
        artistId: artist.id,
        albumId: album ? album.id : null,
        categories: { connect: [{ id: category.id }] },
      },
    });
    plays -= 25;
  }

  const count = await prisma.song.count();
  console.log(`✅ Done. Seeded ${count} songs across ${CATEGORIES.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
