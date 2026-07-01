// A lightweight, serializable song shape used by the player + UI.
export type PlayerSong = {
  id: string;
  title: string;
  artistName: string;
  audioUrl: string;
  duration: number;
};

// Row-friendly track: everything the player needs, plus optional links.
export type TrackListItem = PlayerSong & {
  albumId?: string | null;
  albumTitle?: string | null;
  artistId?: string | null;
};

export type ShelfCategory = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  songs: TrackListItem[];
};

export type PlaylistLite = {
  id: string;
  name: string;
};
