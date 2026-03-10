import { search, fetchMix } from './search';
import { Player } from './player';
import { renderSearch, renderResults, renderPlayer, renderFavorites, clearScreen, renderPlaylistList, renderPlaylistDetail, renderPlaylistPicker, renderNewPlaylistInput, renderRenamePlaylistInput } from './ui';
import { loadFavorites, isFavorite, toggleFavorite, loadPlaylists, savePlaylists, createPlaylist, deletePlaylist, renamePlaylist, addTrackToPlaylist, removeTrackFromPlaylist } from './config';
import type { Playlist } from './types';
import type { Track } from './types';

// Arrow keys & special keys
const UP = '\x1B[A';
const DOWN = '\x1B[B';
const LEFT = '\x1B[D';
const RIGHT = '\x1B[C';
const VOLUME_STEP = 5;

type AppState = 'search-input' | 'search-results' | 'playing' | 'favorites' | 'playlist-list' | 'playlist-detail' | 'playlist-picker' | 'new-playlist' | 'rename-playlist';

let appState: AppState = 'search-input';
let searchMode: 'typing' | 'command' = 'typing';
let searchQuery = '';
let results: Track[] = [];
let selectedIdx = 0;
let queue: Track[] = [];
let history: Track[] = [];
let fetchingMix = false;
let currentTrack: Track | null = null;
let favorites: Track[] = [];
let favSelectedIdx = 0;
let playlists: Playlist[] = [];
let plSelectedIdx = 0;
let plDetailIdx = 0;
let currentPlaylist: Playlist | null = null;
let plPickerIdx = 0;
let newPlaylistName = '';
let renamePlaylistName = '';
let renamingPlaylistId = '';
let prePlaylistState: AppState = 'playing';
let shuffleMode = false;
let volume = 100;
let renderTimer: ReturnType<typeof setInterval> | null = null;

function shuffleArray(arr: Track[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

const player = new Player();

// ─── Checks ────────────────────────────────────────────────────────────────

async function checkDep(cmd: string): Promise<boolean> {
  const proc = Bun.spawn(['which', cmd], { stderr: 'ignore', stdout: 'ignore' });
  const code = await proc.exited;
  return code === 0;
}

// ─── Player events ─────────────────────────────────────────────────────────

// State updates are handled by player internally.
// Rendering is driven by the 1-second timer in startPlaying to avoid flicker.

player.on('end-file', async (event: { reason: string }) => {
  // Only auto-advance on natural end (eof), not on manual skip/replace
  if (event.reason !== 'eof' || appState !== 'playing') return;

  if (queue.length > 0) {
    if (currentTrack) history.push(currentTrack);
    const next = queue.shift()!;
    currentTrack = next;
    await player.loadTrack(next.url);

    // Refill mix when queue gets low
    if (queue.length < 5) {
      refillQueue(next.id);
    }
  }
});

// ─── Queue helpers ──────────────────────────────────────────────────────────

function refillQueue(fromId: string) {
  fetchingMix = true;
  const existingIds = new Set(queue.map(t => t.id));
  fetchMix(fromId, 20)
    .then(tracks => {
      const newTracks = tracks.filter(t => t.id !== fromId && !existingIds.has(t.id));
      if (shuffleMode) shuffleArray(newTracks);
      queue.push(...newTracks);
    })
    .catch(() => {})
    .finally(() => { fetchingMix = false; });
}

// ─── State transitions ─────────────────────────────────────────────────────

function goToSearch() {
  appState = 'search-input';
  searchQuery = '';
  searchMode = 'typing';
  if (renderTimer) { clearInterval(renderTimer); renderTimer = null; }
  renderSearch('', '', favorites.length > 0, playlists.length > 0, searchMode);
}

async function startPlaying(track: Track, remainingTracks?: Track[]) {
  appState = 'playing';
  if (currentTrack) history.push(currentTrack);
  queue = [];
  currentTrack = track;

  await player.loadTrack(track.url);

  // Refresh display every second for smooth progress bar
  if (renderTimer) clearInterval(renderTimer);
  renderTimer = setInterval(() => {
    if (appState === 'playing' && currentTrack) renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack.id), shuffleMode, volume);
  }, 1000);

  if (remainingTracks && remainingTracks.length > 0) {
    queue = [...remainingTracks];
    if (shuffleMode) shuffleArray(queue);
    fetchingMix = false;
  } else {
    // Fetch mix in background
    fetchingMix = true;
    fetchMix(track.id, 25)
      .then(mixTracks => {
        queue = mixTracks.filter(t => t.id !== track.id).slice(0, 22);
        if (shuffleMode) shuffleArray(queue);
      })
      .catch(() => {})
      .finally(() => { fetchingMix = false; });
  }

  renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack.id), shuffleMode, volume);
}

// ─── Key handlers ───────────────────────────────────────────────────────────

async function handleKey(key: string) {
  if (key === '\x03') {  // Ctrl+C
    await cleanup();
    process.exit(0);
  }

  if (appState === 'search-input') await onSearchInput(key);
  else if (appState === 'search-results') await onResultsKey(key);
  else if (appState === 'playing') await onPlayingKey(key);
  else if (appState === 'favorites') await onFavoritesKey(key);
  else if (appState === 'playlist-list') await onPlaylistListKey(key);
  else if (appState === 'playlist-detail') await onPlaylistDetailKey(key);
  else if (appState === 'playlist-picker') await onPlaylistPickerKey(key);
  else if (appState === 'new-playlist') onNewPlaylistKey(key);
  else if (appState === 'rename-playlist') onRenamePlaylistKey(key);
}

async function onSearchInput(key: string) {
  // Command mode: shortcuts active, any character key returns to typing mode
  if (searchMode === 'command') {
    if (key === '\x1B') {
      // Stay in command mode on Escape
      return;
    }
    // Handle L (favorites) shortcut
    if ((key === 'l' || key === 'L') && !searchQuery) {
      if (favorites.length > 0) {
        appState = 'favorites';
        favSelectedIdx = 0;
        renderFavorites(favorites, favSelectedIdx);
      }
      return;
    }
    // Handle O (playlist) shortcut
    if ((key === 'o' || key === 'O') && !searchQuery) {
      if (playlists.length > 0) {
        appState = 'playlist-list';
        plSelectedIdx = 0;
        renderPlaylistList(playlists, plSelectedIdx);
      }
      return;
    }
    // Any character key switches back to typing mode
    if (key.length === 1 && key >= ' ') {
      searchMode = 'typing';
      searchQuery += key;
      renderSearch(searchQuery, '', favorites.length > 0, playlists.length > 0, searchMode);
      return;
    }
    return;
  }

  // Typing mode: Escape switches to command mode
  if (key === '\x1B') {
    searchMode = 'command';
    searchQuery = '';
    renderSearch(searchQuery, '', favorites.length > 0, playlists.length > 0, searchMode);
    return;
  }
  if (key === '\r' || key === '\n') {
    if (!searchQuery.trim()) return;
    renderSearch('Aranıyor...', `"${searchQuery}"`, favorites.length > 0, playlists.length > 0, searchMode);
    try {
      results = await search(searchQuery);
      if (results.length === 0) {
        renderSearch('', 'Sonuç bulunamadı. Tekrar dene.', favorites.length > 0, playlists.length > 0, searchMode);
        return;
      }
      appState = 'search-results';
      selectedIdx = 0;
      renderResults(results, selectedIdx);
    } catch {
      renderSearch('', 'Hata oluştu. yt-dlp kurulu olduğundan emin ol.', favorites.length > 0, playlists.length > 0, searchMode);
    }
  } else if (key === '\x7F' || key === '\b') {
    searchQuery = searchQuery.slice(0, -1);
    renderSearch(searchQuery, '', favorites.length > 0, playlists.length > 0, searchMode);
  } else if (key.length === 1 && key >= ' ') {
    searchQuery += key;
    renderSearch(searchQuery, '', favorites.length > 0, playlists.length > 0, searchMode);
  }
}

async function onResultsKey(key: string) {
  if (key === UP) {
    selectedIdx = Math.max(0, selectedIdx - 1);
    renderResults(results, selectedIdx);
  } else if (key === DOWN) {
    selectedIdx = Math.min(results.length - 1, selectedIdx + 1);
    renderResults(results, selectedIdx);
  } else if (key === '\r' || key === '\n') {
    await startPlaying(results[selectedIdx]);
  } else if (key === 'q' || key === 'Q') {
    goToSearch();
  }
}

async function onPlayingKey(key: string) {
  switch (key) {
    case ' ':
      await player.togglePause();
      break;
    case 'n':
    case 'N':
      if (queue.length > 0) {
        if (currentTrack) history.push(currentTrack);
        const next = queue.shift()!;
        currentTrack = next;
        await player.loadTrack(next.url);
        if (queue.length < 5) refillQueue(next.id);
      }
      break;
    case 'p':
    case 'P':
      if (history.length > 0) {
        if (currentTrack) queue.unshift(currentTrack);
        const prev = history.pop()!;
        currentTrack = prev;
        await player.loadTrack(prev.url);
      }
      break;
    case LEFT:
      await player.seek(-10);
      break;
    case RIGHT:
      await player.seek(10);
      break;
    case 'f':
    case 'F':
      if (currentTrack) {
        const result = toggleFavorite(favorites, currentTrack);
        favorites = result.favorites;
        renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack.id), shuffleMode, volume);
      }
      break;
    case 'l':
    case 'L':
      if (favorites.length > 0) {
        appState = 'favorites';
        favSelectedIdx = 0;
        if (renderTimer) { clearInterval(renderTimer); renderTimer = null; }
        renderFavorites(favorites, favSelectedIdx);
      }
      break;
    case 'a':
    case 'A':
      if (currentTrack) {
        prePlaylistState = 'playing';
        appState = 'playlist-picker';
        plPickerIdx = 0;
        if (renderTimer) { clearInterval(renderTimer); renderTimer = null; }
        renderPlaylistPicker(playlists, plPickerIdx, currentTrack.title);
      }
      break;
    case 'o':
    case 'O':
      appState = 'playlist-list';
      plSelectedIdx = 0;
      if (renderTimer) { clearInterval(renderTimer); renderTimer = null; }
      renderPlaylistList(playlists, plSelectedIdx);
      break;
    case 'x':
    case 'X':
      shuffleMode = !shuffleMode;
      if (shuffleMode && queue.length > 0) shuffleArray(queue);
      renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack!.id), shuffleMode, volume);
      break;
    case 's':
    case 'S':
      goToSearch();
      break;
    case '+':
    case '=':
      volume = Math.min(100, volume + VOLUME_STEP);
      await player.setVolume(volume);
      renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack!.id), shuffleMode, volume);
      break;
    case '-':
    case '_':
      volume = Math.max(0, volume - VOLUME_STEP);
      await player.setVolume(volume);
      renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack!.id), shuffleMode, volume);
      break;
    case 'q':
    case 'Q':
      await cleanup();
      process.exit(0);
      break;
  }
}

async function onFavoritesKey(key: string) {
  if (key === UP) {
    favSelectedIdx = Math.max(0, favSelectedIdx - 1);
    renderFavorites(favorites, favSelectedIdx);
  } else if (key === DOWN) {
    favSelectedIdx = Math.min(favorites.length - 1, favSelectedIdx + 1);
    renderFavorites(favorites, favSelectedIdx);
  } else if (key === '\r' || key === '\n') {
    await startPlaying(favorites[favSelectedIdx]);
  } else if (key === 'q' || key === 'Q') {
    returnToPlayer();
  }
}

// ─── Playlist handlers ──────────────────────────────────────────────────────

function returnToPlayer() {
  if (currentTrack) {
    appState = 'playing';
    renderTimer = setInterval(() => {
      if (appState === 'playing') renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack!.id), shuffleMode, volume);
    }, 1000);
    renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack.id), shuffleMode, volume);
  } else {
    goToSearch();
  }
}

async function onPlaylistListKey(key: string) {
  if (key === UP) {
    plSelectedIdx = Math.max(0, plSelectedIdx - 1);
    renderPlaylistList(playlists, plSelectedIdx);
  } else if (key === DOWN) {
    plSelectedIdx = Math.min(playlists.length - 1, plSelectedIdx + 1);
    renderPlaylistList(playlists, plSelectedIdx);
  } else if ((key === '\r' || key === '\n') && playlists.length > 0) {
    currentPlaylist = playlists[plSelectedIdx]!;
    appState = 'playlist-detail';
    plDetailIdx = 0;
    renderPlaylistDetail(currentPlaylist!, plDetailIdx);
  } else if (key === 'c' || key === 'C') {
    prePlaylistState = 'playlist-list';
    appState = 'new-playlist';
    newPlaylistName = '';
    renderNewPlaylistInput(newPlaylistName);
  } else if ((key === 'r' || key === 'R') && playlists.length > 0) {
    const pl = playlists[plSelectedIdx]!;
    renamingPlaylistId = pl.id;
    renamePlaylistName = pl.name;
    appState = 'rename-playlist';
    renderRenamePlaylistInput(renamePlaylistName);
  } else if ((key === 'd' || key === 'D') && playlists.length > 0) {
    playlists = deletePlaylist(playlists, playlists[plSelectedIdx]!.id);
    plSelectedIdx = Math.min(plSelectedIdx, playlists.length - 1);
    renderPlaylistList(playlists, plSelectedIdx);
  } else if (key === 'q' || key === 'Q') {
    returnToPlayer();
  }
}

async function onPlaylistDetailKey(key: string) {
  if (!currentPlaylist) return;

  if (key === UP) {
    plDetailIdx = Math.max(0, plDetailIdx - 1);
    renderPlaylistDetail(currentPlaylist, plDetailIdx);
  } else if (key === DOWN) {
    plDetailIdx = Math.min(currentPlaylist.tracks.length - 1, plDetailIdx + 1);
    renderPlaylistDetail(currentPlaylist, plDetailIdx);
  } else if ((key === '\r' || key === '\n') && currentPlaylist.tracks.length > 0) {
    const after = currentPlaylist.tracks.slice(plDetailIdx + 1);
    const before = currentPlaylist.tracks.slice(0, plDetailIdx);
    await startPlaying(currentPlaylist.tracks[plDetailIdx], [...after, ...before]);
  } else if ((key === 'd' || key === 'D') && currentPlaylist.tracks.length > 0) {
    removeTrackFromPlaylist(playlists, currentPlaylist.id, plDetailIdx);
    plDetailIdx = Math.min(plDetailIdx, currentPlaylist.tracks.length - 1);
    renderPlaylistDetail(currentPlaylist, plDetailIdx);
  } else if (key === 'q' || key === 'Q') {
    appState = 'playlist-list';
    renderPlaylistList(playlists, plSelectedIdx);
  }
}

async function onPlaylistPickerKey(key: string) {
  if (key === UP) {
    plPickerIdx = Math.max(0, plPickerIdx - 1);
    renderPlaylistPicker(playlists, plPickerIdx, currentTrack?.title || '');
  } else if (key === DOWN) {
    plPickerIdx = Math.min(playlists.length - 1, plPickerIdx + 1);
    renderPlaylistPicker(playlists, plPickerIdx, currentTrack?.title || '');
  } else if ((key === '\r' || key === '\n') && playlists.length > 0 && currentTrack) {
    addTrackToPlaylist(playlists, playlists[plPickerIdx]!.id, currentTrack);
    returnToPlayer();
  } else if (key === 'c' || key === 'C') {
    prePlaylistState = 'playlist-picker';
    appState = 'new-playlist';
    newPlaylistName = '';
    renderNewPlaylistInput(newPlaylistName);
  } else if (key === 'q' || key === 'Q' || key === '\x1B') {
    returnToPlayer();
  }
}

function onNewPlaylistKey(key: string) {
  if (key === '\x1B') {
    // Esc - go back
    if (prePlaylistState === 'playlist-picker') {
      appState = 'playlist-picker';
      renderPlaylistPicker(playlists, plPickerIdx, currentTrack?.title || '');
    } else {
      appState = 'playlist-list';
      renderPlaylistList(playlists, plSelectedIdx);
    }
  } else if (key === '\r' || key === '\n') {
    if (!newPlaylistName.trim()) return;
    createPlaylist(playlists, newPlaylistName.trim());
    if (prePlaylistState === 'playlist-picker') {
      plPickerIdx = playlists.length - 1;
      appState = 'playlist-picker';
      renderPlaylistPicker(playlists, plPickerIdx, currentTrack?.title || '');
    } else {
      plSelectedIdx = playlists.length - 1;
      appState = 'playlist-list';
      renderPlaylistList(playlists, plSelectedIdx);
    }
  } else if (key === '\x7F' || key === '\b') {
    newPlaylistName = newPlaylistName.slice(0, -1);
    renderNewPlaylistInput(newPlaylistName);
  } else if (key.length === 1 && key >= ' ') {
    newPlaylistName += key;
    renderNewPlaylistInput(newPlaylistName);
  }
}

function onRenamePlaylistKey(key: string) {
  if (key === '\x1B') {
    appState = 'playlist-list';
    renderPlaylistList(playlists, plSelectedIdx);
  } else if (key === '\r' || key === '\n') {
    if (!renamePlaylistName.trim()) return;
    renamePlaylist(playlists, renamingPlaylistId, renamePlaylistName.trim());
    appState = 'playlist-list';
    renderPlaylistList(playlists, plSelectedIdx);
  } else if (key === '\x7F' || key === '\b') {
    renamePlaylistName = renamePlaylistName.slice(0, -1);
    renderRenamePlaylistInput(renamePlaylistName);
  } else if (key.length === 1 && key >= ' ') {
    renamePlaylistName += key;
    renderRenamePlaylistInput(renamePlaylistName);
  }
}

// ─── Cleanup & init ─────────────────────────────────────────────────────────

async function cleanup() {
  if (renderTimer) clearInterval(renderTimer);
  process.stdin.setRawMode(false);
  clearScreen();
  await player.quit();
  process.stdout.write(chalk_reset());
}

// Simple reset without importing chalk just for this
function chalk_reset() { return '\x1B[0m\n'; }

async function main() {
  const hasMpv = await checkDep('mpv');
  const hasYtdlp = await checkDep('yt-dlp');

  if (!hasMpv || !hasYtdlp) {
    console.error('\nEksik bağımlılıklar:');
    if (!hasMpv) console.error('  ✗ mpv  →  brew install mpv');
    if (!hasYtdlp) console.error('  ✗ yt-dlp  →  brew install yt-dlp');
    process.exit(1);
  }

  await player.start();
  favorites = loadFavorites();
  playlists = loadPlaylists();

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', handleKey);

  goToSearch();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
