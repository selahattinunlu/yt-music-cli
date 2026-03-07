import { search, fetchMix } from './search';
import { Player } from './player';
import { renderSearch, renderResults, renderPlayer, renderFavorites, clearScreen } from './ui';
import { loadFavorites, isFavorite, toggleFavorite } from './config';
import type { Track } from './types';

// Arrow keys & special keys
const UP = '\x1B[A';
const DOWN = '\x1B[B';
const LEFT = '\x1B[D';
const RIGHT = '\x1B[C';

type AppState = 'search-input' | 'search-results' | 'playing' | 'favorites';

let appState: AppState = 'search-input';
let searchQuery = '';
let results: Track[] = [];
let selectedIdx = 0;
let queue: Track[] = [];
let history: Track[] = [];
let fetchingMix = false;
let currentTrack: Track | null = null;
let favorites: Track[] = [];
let favSelectedIdx = 0;
let renderTimer: ReturnType<typeof setInterval> | null = null;

const player = new Player();

// ─── Checks ────────────────────────────────────────────────────────────────

async function checkDep(cmd: string): Promise<boolean> {
  const proc = Bun.spawn(['which', cmd], { stderr: 'ignore', stdout: 'ignore' });
  const code = await proc.exited;
  return code === 0;
}

// ─── Player events ─────────────────────────────────────────────────────────

player.on('state', () => {
  if (appState === 'playing') renderPlayer(player.state, queue, fetchingMix, currentTrack ? isFavorite(favorites, currentTrack.id) : false);
});

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
  fetchMix(fromId, 20)
    .then(tracks => {
      const newTracks = tracks.filter(t => t.id !== fromId);
      queue.push(...newTracks);
    })
    .catch(() => {})
    .finally(() => { fetchingMix = false; });
}

// ─── State transitions ─────────────────────────────────────────────────────

function goToSearch() {
  appState = 'search-input';
  searchQuery = '';
  if (renderTimer) { clearInterval(renderTimer); renderTimer = null; }
  renderSearch('');
}

async function startPlaying(track: Track) {
  appState = 'playing';
  if (currentTrack) history.push(currentTrack);
  queue = [];
  fetchingMix = true;
  currentTrack = track;

  await player.loadTrack(track.url);

  // Refresh display every second for smooth progress bar
  if (renderTimer) clearInterval(renderTimer);
  renderTimer = setInterval(() => {
    if (appState === 'playing') renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, track.id));
  }, 1000);

  renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, track.id));

  // Fetch mix in background
  fetchMix(track.id, 25)
    .then(mixTracks => {
      queue = mixTracks.filter(t => t.id !== track.id).slice(0, 22);
    })
    .catch(() => {})
    .finally(() => { fetchingMix = false; });
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
}

async function onSearchInput(key: string) {
  if (key === '\r' || key === '\n') {
    if (!searchQuery.trim()) return;
    renderSearch('Aranıyor...', `"${searchQuery}"`);
    try {
      results = await search(searchQuery);
      if (results.length === 0) {
        renderSearch('', 'Sonuç bulunamadı. Tekrar dene.');
        return;
      }
      appState = 'search-results';
      selectedIdx = 0;
      renderResults(results, selectedIdx);
    } catch {
      renderSearch('', 'Hata oluştu. yt-dlp kurulu olduğundan emin ol.');
    }
  } else if (key === '\x7F' || key === '\b') {
    searchQuery = searchQuery.slice(0, -1);
    renderSearch(searchQuery);
  } else if (key.length === 1 && key >= ' ') {
    searchQuery += key;
    renderSearch(searchQuery);
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
        renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack.id));
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
    case 's':
    case 'S':
      goToSearch();
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
    // Return to player if playing, otherwise search
    if (currentTrack) {
      appState = 'playing';
      renderTimer = setInterval(() => {
        if (appState === 'playing') renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack!.id));
      }, 1000);
      renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack.id));
    } else {
      goToSearch();
    }
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
