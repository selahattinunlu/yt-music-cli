import { mkdirSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { Track } from './types';

const CONFIG_DIR = join(homedir(), '.config', 'yt-music-cli');
const FAVORITES_PATH = join(CONFIG_DIR, 'favorites.json');

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
