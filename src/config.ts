import { mkdirSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { Track, Playlist } from './types';

const CONFIG_DIR = join(homedir(), '.config', 'yt-music-cli');
const FAVORITES_PATH = join(CONFIG_DIR, 'favorites.json');
const PLAYLISTS_PATH = join(CONFIG_DIR, 'playlists.json');

function ensureConfigDir() {
  mkdirSync(CONFIG_DIR, { recursive: true });
}

export function loadFavorites(): Track[] {
  try {
    const text = readFileSync(FAVORITES_PATH, 'utf8');
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: Track[]) {
  ensureConfigDir();
  Bun.write(FAVORITES_PATH, JSON.stringify(favorites, null, 2));
}

export function isFavorite(favorites: Track[], id: string): boolean {
  return favorites.some(t => t.id === id);
}

export function toggleFavorite(favorites: Track[], track: Track): { favorites: Track[]; added: boolean } {
  const idx = favorites.findIndex(t => t.id === track.id);
  if (idx >= 0) {
    favorites.splice(idx, 1);
    saveFavorites(favorites);
    return { favorites, added: false };
  } else {
    favorites.push(track);
    saveFavorites(favorites);
    return { favorites, added: true };
  }
}

// ─── Playlists ──────────────────────────────────────────────────────────────

export function loadPlaylists(): Playlist[] {
  try {
    const text = readFileSync(PLAYLISTS_PATH, 'utf8');
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export function savePlaylists(playlists: Playlist[]) {
  ensureConfigDir();
  Bun.write(PLAYLISTS_PATH, JSON.stringify(playlists, null, 2));
}

export function createPlaylist(playlists: Playlist[], name: string): Playlist {
  const playlist: Playlist = {
    id: Date.now().toString(36),
    name,
    tracks: [],
    createdAt: new Date().toISOString(),
  };
  playlists.push(playlist);
  savePlaylists(playlists);
  return playlist;
}

export function deletePlaylist(playlists: Playlist[], id: string): Playlist[] {
  const filtered = playlists.filter(p => p.id !== id);
  savePlaylists(filtered);
  return filtered;
}

export function addTrackToPlaylist(playlists: Playlist[], playlistId: string, track: Track): boolean {
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return false;
  if (playlist.tracks.some(t => t.id === track.id)) return false;
  playlist.tracks.push(track);
  savePlaylists(playlists);
  return true;
}

export function removeTrackFromPlaylist(playlists: Playlist[], playlistId: string, trackIdx: number) {
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return;
  playlist.tracks.splice(trackIdx, 1);
  savePlaylists(playlists);
}
