import { PrismaClient } from "@prisma/client";
import { readdirSync, statSync } from "fs";
import { join, basename, extname } from "path";

const prisma = new PrismaClient();

/* ============================================================
   TAARAA — Local library scanner  (personal use)
   ------------------------------------------------------------
   Walks public/audio/ (and every subfolder), turns each audio
   file into a catalogued song, and loads it into the database.

   - Title  = cleaned-up filename
   - Album  = the folder the file sits in (if any)
   - Artist = best guess from the top-level folder, else "My Library"
   - URL    = properly encoded /audio/... path

   ⚠  This catalog is for LOCAL / personal use. Do NOT push these
      files to the public site if they are copyrighted recordings.

   USAGE:  node prisma/seed-local.mjs
   ============================================================ */

const AUDIO_ROOT = "public/audio";
const AUDIO_EXTS = new Set([".mp3", ".m4a", ".wav", ".ogg"]);

// Recursively collect audio files as { abs, rel, parts }
function walk(dir, baseParts = []) {
  const out = [];
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name.startsWith(".")) continue; // skip hidden files
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      out.push(...walk(full, [...baseParts, name]));
    } else if (AUDIO_EXTS.has(extname(name).toLowerCase())) {
      out.push({ file: name, parts: baseParts });
    }
  }
  return out;
}

// Turn a filename into a clean song title.
function cleanTitle(filename) {
  let t = basename(filename, extname(filename));
  t = t.replace(/\.flac$/i, "");                 // handle ".flac.mp3"
  t = t.replace(/\(www\.[^)]*\)/gi, "");         // strip "(www.songs.pk)"
  t = t.replace(/^\s*V?\d+[-.\s]*\d*\.?\s*/i, ""); // strip leading "01.", "V3-02 "
  t = t.replace(/_/g, " ");                       // underscores -> spaces
  t = t.replace(/\s+/g, " ").trim();              // collapse spaces
  if (!t) t = basename(filename, extname(filename));
  return t;
}

// Build the public URL, encoding each path segment (handles spaces & unicode).
function toUrl(parts, file) {
  const segments = ["audio", ...parts, file].map((s) => encodeURIComponent(s));
  return "/" + segments.join("/");
}

async function main() {
  console.log(`Scanning ${AUDIO_ROOT}/ …`);
  const found = walk(AUDIO_ROOT);
  if (!found.length) {
    console.error(`\n❌ No audio files found in ${AUDIO_ROOT}/. Add files there first.\n`);
    process.exit(1);
  }
  console.log(`Found ${found.length} audio files.\n`);

  console.log("Clearing old catalog…");
  await prisma.recentlyPlayed.deleteMany();
  await prisma.playlistSong.deleteMany();
  await prisma.likedSong.deleteMany();
  await prisma.song.deleteMany();
  await prisma.album.deleteMany();
  await prisma.category.deleteMany();
  await prisma.artist.deleteMany();

  // Single category for the personal library.
  const category = await prisma.category.create({
    data: { name: "My Collection", slug: "collection", color: "#c9a24b" },
  });

  const artistByName = {};
  const albumByKey = {};

  async function getArtist(name) {
    const key = name.toLowerCase();
    if (!artistByName[key]) {
      artistByName[key] = await prisma.artist.create({
        data: { name, verified: false },
      });
    }
    return artistByName[key];
  }

  async function getAlbum(title, artistId) {
    if (!title) return null;
    const key = `${title.toLowerCase()}::${artistId}`;
    if (!albumByKey[key]) {
      albumByKey[key] = await prisma.album.create({
        data: { title, artistId, releaseDate: new Date() },
      });
    }
    return albumByKey[key];
  }

  let created = 0;
  let plays = found.length;

  for (const item of found) {
    const title = cleanTitle(item.file);
    const url = toUrl(item.parts, item.file);

    // Album = deepest folder; Artist = top-level folder (or "My Library")
    const albumName = item.parts.length ? item.parts[item.parts.length - 1] : null;
    const artistName = item.parts.length ? item.parts[0] : "My Library";

    const artist = await getArtist(artistName);
    const album = await getAlbum(albumName, artist.id);

    await prisma.song.create({
      data: {
        title,
        duration: 180, // nominal; the player reads the real length on play
        audioUrl: url,
        plays,
        artistId: artist.id,
        albumId: album ? album.id : null,
        categories: { connect: [{ id: category.id }] },
      },
    });
    created += 1;
    plays -= 1;
  }

  const count = await prisma.song.count();
  const artists = await prisma.artist.count();
  const albums = await prisma.album.count();
  console.log(`\n✅ Done. Catalogued ${count} songs by ${artists} artists across ${albums} albums.`);
  console.log("   (Local library — remember not to push copyrighted files to the public site.)");
}

main()
  .catch((e) => {
    console.error("\n❌ Scan failed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
