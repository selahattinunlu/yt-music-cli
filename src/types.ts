export interface Track {
  id: string;
  title: string;
  url: string;
  duration?: number;
  uploader?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: string;
}
