import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Freely-usable demo tracks (SoundHelix) — stream directly in the browser.
const AUDIO = (n) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

const categories = [
  { name: "Pop", slug: "pop", color: "#e0457b" },
  { name: "Lo-Fi", slug: "lofi", color: "#6a5acd" },
  { name: "Rock", slug: "rock", color: "#c0392b" },
  { name: "Electronic", slug: "electronic", color: "#1f9e8f" },
  { name: "Indie", slug: "indie", color: "#d98a29" },
];

const artists = [
  { name: "Nova Sterling", bio: "Synth-pop from the outer rim.", verified: true },
  { name: "The Meteor Kids", bio: "Loud, bright, unstoppable rock.", verified: true },
  { name: "Luna Vale", bio: "Lo-fi beats to drift among the stars.", verified: false },
  { name: "Circuit Halo", bio: "Electronic architect of sound.", verified: true },
  { name: "Paper Comets", bio: "Indie dreamers with a telescope.", verified: false },
];

// title, artistIndex, categorySlug, soundhelix number, duration(sec, nominal)
const songs = [
  ["Starlight Drive", 0, "pop", 1, 372],
  ["Neon Orbit", 0, "pop", 2, 401],
  ["Gravity of You", 0, "pop", 3, 348],
  ["Thunder Halo", 1, "rock", 4, 289],
  ["Crash the Comet", 1, "rock", 5, 315],
  ["Redshift Riot", 1, "rock", 6, 366],
  ["Midnight Static", 2, "lofi", 7, 254],
  ["Cassette Moon", 2, "lofi", 8, 231],
  ["Slow Nebula", 2, "lofi", 9, 278],
  ["Pulse Reactor", 3, "electronic", 10, 333],
  ["Data Bloom", 3, "electronic", 11, 358],
  ["Quantum Tide", 3, "electronic", 12, 297],
  ["Paper Satellites", 4, "indie", 13, 264],
  ["Telescope Hearts", 4, "indie", 14, 302],
  ["Analog Sky", 4, "indie", 15, 319],
];

async function main() {
  console.log("Seeding TAARAA catalog…");

  // Clean slate for repeatable seeds
  await prisma.recentlyPlayed.deleteMany();
  await prisma.playlistSong.deleteMany();
  await prisma.likedSong.deleteMany();
  await prisma.song.deleteMany();
  await prisma.album.deleteMany();
  await prisma.category.deleteMany();
  await prisma.artist.deleteMany();

  const catRecords = {};
  for (const c of categories) {
    const rec = await prisma.category.create({ data: c });
    catRecords[c.slug] = rec;
  }

  const artistRecords = [];
  for (const a of artists) {
    const rec = await prisma.artist.create({ data: a });
    artistRecords.push(rec);
  }

  // One album per artist
  const albumRecords = [];
  for (const artist of artistRecords) {
    const rec = await prisma.album.create({
      data: {
        title: `${artist.name} — Constellations`,
        artistId: artist.id,
        releaseDate: new Date(),
      },
    });
    albumRecords.push(rec);
  }

  let plays = 500;
  for (const [title, artistIdx, catSlug, helixNum, duration] of songs) {
    await prisma.song.create({
      data: {
        title,
        duration,
        audioUrl: AUDIO(helixNum),
        plays: plays,
        artistId: artistRecords[artistIdx].id,
        albumId: albumRecords[artistIdx].id,
        categories: { connect: [{ id: catRecords[catSlug].id }] },
      },
    });
    plays -= 25; // descending so "Trending" has a clear order
  }

  const count = await prisma.song.count();
  console.log(`Done. Seeded ${count} songs across ${categories.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
