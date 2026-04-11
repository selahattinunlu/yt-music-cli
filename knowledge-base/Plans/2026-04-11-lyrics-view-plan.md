# Lyrics View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a toggleable lyrics view inside the player screen that fetches synced (LRC) lyrics from LRCLIB and highlights the active line.

**Architecture:** A new `src/lyrics.ts` module owns the LRCLIB HTTP client, LRC parsing, title parsing, and an in-memory cache. The `playing` AppState gets a `lyricsOpen` sub-mode flag; when open, `renderPlayer` swaps the queue block for a lyrics block (fixed 10-line window with active-line highlight). The `L` key toggles lyrics (replacing its old Favorites binding); Favorites moves to `H`. No new AppState is introduced.

**Tech Stack:** TypeScript, Bun runtime, native `fetch` with `AbortController`, `chalk` for terminal styling.

**Spec:** `knowledge-base/Specs/2026-04-11-lyrics-view-design.md`

---

## Baseline

Before starting, confirm you are on branch `feature/lyrics-view`:

```bash
git branch --show-current
# Expected: feature/lyrics-view
```

The repo has **23 pre-existing TypeScript errors** in `src/index.ts` and `src/ui.ts` (all about `Track | undefined` / `'t' possibly undefined`). These are NOT in scope — do not fix them. The verification for each code task is: `bunx tsc --noEmit 2>&1 | grep -c error` should remain **≤ 23** plus any new errors you introduce must be surgically justified. Ideally, new code introduces **zero** additional errors.

Capture baseline count:

```bash
bunx tsc --noEmit 2>&1 | grep -c "error TS" || echo 0
```

Keep this number in mind. After each code task, re-run and confirm no increase beyond what the task deliberately adds.

---

## File Structure

| File | Action | Purpose |
|---|---|---|
| `src/lyrics.ts` | Create | LRCLIB client, LRC parser, title parser, `findActiveLineIdx`, memory cache, exported types |
| `src/ui.ts` | Modify | `renderPlayer` signature gains optional `lyrics` param; add internal `renderLyricsBlock` helper; update help line; update `renderSearch` command-mode hint |
| `src/index.ts` | Modify | Lyrics state vars, `loadLyricsForCurrent` helper, `lyricsRenderInput` helper, `L`/`H` handlers, arrow scroll, track-change resets, `onSearchInput` L→H swap, updated `renderPlayer` call sites |
| `src/types.ts` | Unchanged | Lyrics types live in `lyrics.ts` per the spec |
| `knowledge-base/Manual Test Checklist.md` | Modify | Replace existing `L → Favorites` entries with `H`; add new Lyrics section (9 cases) |
| `knowledge-base/Tasks/Lyrics View.md` | Modify | status `planned` → `in-progress`, then to `done` after manual test pass |
| `README.md` | Modify (if keybinding table exists) | Update `L` and `H` rows |

---

## Task 1: Create `src/lyrics.ts` — types and pure helpers

**Files:**
- Create: `src/lyrics.ts`

This task creates the module with types and the three pure helpers (`parseTitle`, `parseLRC`, `findActiveLineIdx`). No network code yet — that comes in Task 2. We split this way so the pure logic lands in one atomic commit, separate from HTTP concerns.

- [ ] **Step 1: Create `src/lyrics.ts` with types and pure helpers**

```ts
import type { Track } from './types';

// ─── Types ─────────────────────────────────────────────────────────────────

export type LyricsLine = { time: number; text: string };

export type LyricsData =
  | { status: 'found'; lines: LyricsLine[]; synced: boolean }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

// ─── Title parsing ─────────────────────────────────────────────────────────

const TITLE_NOISE_RE = /\s*[\(\[][^\)\]]*(official|lyric|video|audio|mv|hd|4k|music)[^\)\]]*[\)\]]/gi;
const UPLOADER_NOISE_RE = /\s*(-\s*topic|vevo|official|music|records)\s*$/gi;

export function parseTitle(title: string, uploader?: string): { artist: string; song: string } {
  const cleanedTitle = title.replace(TITLE_NOISE_RE, '').trim();
  const dashIdx = cleanedTitle.indexOf(' - ');
  if (dashIdx > 0) {
    return {
      artist: cleanedTitle.slice(0, dashIdx).trim(),
      song: cleanedTitle.slice(dashIdx + 3).trim(),
    };
  }
  const artist = (uploader || '').replace(UPLOADER_NOISE_RE, '').trim();
  return { artist, song: cleanedTitle };
}

// ─── LRC parsing ───────────────────────────────────────────────────────────

const LRC_TS_RE = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

export function parseLRC(text: string): LyricsLine[] {
  const out: LyricsLine[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const timestamps: number[] = [];
    let lastEnd = 0;
    LRC_TS_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = LRC_TS_RE.exec(line)) !== null) {
      if (m.index !== lastEnd) break; // timestamps must be contiguous at the start
      const min = Number(m[1]);
      const sec = Number(m[2]);
      const frac = m[3] ? Number(`0.${m[3]}`) : 0;
      timestamps.push(min * 60 + sec + frac);
      lastEnd = m.index + m[0].length;
    }
    if (timestamps.length === 0) continue;
    const textPart = line.slice(lastEnd).trim();
    if (!textPart) continue; // skip metadata like [ar:...]
    for (const time of timestamps) {
      out.push({ time, text: textPart });
    }
  }
  return out.sort((a, b) => a.time - b.time);
}

// ─── Active line lookup ────────────────────────────────────────────────────

export function findActiveLineIdx(lines: LyricsLine[], timePos: number): number {
  if (lines.length === 0) return 0;
  let idx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]!.time <= timePos) idx = i;
    else break;
  }
  return idx;
}
```

- [ ] **Step 2: Verify it type-checks**

Run:

```bash
bunx tsc --noEmit 2>&1 | grep "src/lyrics.ts"
```

Expected: empty (no errors in the new file). Pre-existing errors in other files are fine.

- [ ] **Step 3: Commit**

```bash
git add src/lyrics.ts
git commit -m "feat(lyrics): add types and pure helpers (parseTitle, parseLRC, findActiveLineIdx)"
```

---

## Task 2: Add `fetchLyrics` with LRCLIB HTTP client + memory cache

**Files:**
- Modify: `src/lyrics.ts`

- [ ] **Step 1: Append cache, fetch logic, and `fetchLyrics` to `src/lyrics.ts`**

Add at the end of the file:

```ts
// ─── Fetch + cache ─────────────────────────────────────────────────────────

const cache = new Map<string, LyricsData>();
const LRCLIB_BASE = 'https://lrclib.net/api/get';
const FETCH_TIMEOUT_MS = 5000;
const USER_AGENT = 'yt-music-cli (https://github.com/selahattinunlu/yt-music-cli)';

export async function fetchLyrics(track: Track): Promise<LyricsData> {
  const cached = cache.get(track.id);
  if (cached) return cached;

  const { artist, song } = parseTitle(track.title, track.uploader);
  if (!song) {
    const nf: LyricsData = { status: 'not-found' };
    cache.set(track.id, nf);
    return nf;
  }

  const params = new URLSearchParams();
  params.set('track_name', song);
  if (artist) params.set('artist_name', artist);
  if (track.duration) params.set('duration', String(Math.round(track.duration)));

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${LRCLIB_BASE}?${params.toString()}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (res.status === 404) {
      const nf: LyricsData = { status: 'not-found' };
      cache.set(track.id, nf);
      return nf;
    }
    if (!res.ok) {
      return { status: 'error', message: `Sunucu hatasi (${res.status})` };
    }

    let body: { syncedLyrics?: string | null; plainLyrics?: string | null };
    try {
      body = await res.json() as typeof body;
    } catch {
      return { status: 'error', message: 'Gecersiz yanit' };
    }

    if (body.syncedLyrics && body.syncedLyrics.trim()) {
      const lines = parseLRC(body.syncedLyrics);
      if (lines.length > 0) {
        const data: LyricsData = { status: 'found', lines, synced: true };
        cache.set(track.id, data);
        return data;
      }
    }
    if (body.plainLyrics && body.plainLyrics.trim()) {
      const lines = body.plainLyrics
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(Boolean)
        .map(text => ({ time: 0, text }));
      const data: LyricsData = { status: 'found', lines, synced: false };
      cache.set(track.id, data);
      return data;
    }

    const nf: LyricsData = { status: 'not-found' };
    cache.set(track.id, nf);
    return nf;
  } catch (err) {
    clearTimeout(timer);
    const message = (err as Error).name === 'AbortError' ? 'Zaman asimi' : 'Ag hatasi';
    return { status: 'error', message };
  }
}
```

**Cache semantics:** `found` and `not-found` are cached; `error` is not (to allow retry). This matches the spec's "Error Handling" section.

- [ ] **Step 2: Verify type-check**

```bash
bunx tsc --noEmit 2>&1 | grep "src/lyrics.ts"
```

Expected: empty.

- [ ] **Step 3: Smoke-test the HTTP call end-to-end**

Create a throwaway script — we will delete it in the next step:

```bash
cat > /tmp/lyrics-smoke.ts <<'EOF'
import { fetchLyrics } from './src/lyrics';
const track = {
  id: 'smoke1',
  title: 'Adele - Hello',
  url: 'https://example.com',
  duration: 295,
  uploader: 'AdeleVEVO',
};
console.log(await fetchLyrics(track));
EOF
cd /Users/sela/code/sela/yt-music-cli && bun /tmp/lyrics-smoke.ts
```

Expected: a `{ status: 'found', lines: [...], synced: true }` object with a non-empty `lines` array. If you get `not-found`, LRCLIB may not have that exact title — try `"Imagine Dragons - Believer"`. If you get `error`, check network connectivity.

Delete the smoke script:

```bash
rm /tmp/lyrics-smoke.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/lyrics.ts
git commit -m "feat(lyrics): add LRCLIB fetch client with memory cache"
```

---

## Task 3: Add lyrics rendering to `src/ui.ts`

**Files:**
- Modify: `src/ui.ts`

This task adds the `LyricsRenderInput` type, the internal `renderLyricsBlock` helper, and wires it into `renderPlayer` via a new optional parameter. Help line and `renderSearch` hint come in the next task.

- [ ] **Step 1: Add import at the top of `src/ui.ts`**

Below the existing imports (after `import type { Track, Playlist } from './types';`), add:

```ts
import type { LyricsData } from './lyrics';
import { findActiveLineIdx } from './lyrics';
```

- [ ] **Step 2: Add the `LyricsRenderInput` type and `renderLyricsBlock` helper**

Place this AFTER the existing `clip` function and BEFORE `export function clearScreen()`:

```ts
export type LyricsRenderInput = {
  open: boolean;
  loading: boolean;
  data: LyricsData | null;
  scrollOffset: number;
  timePos: number;
};

const LYRICS_WINDOW = 10;
const LYRICS_MAX_WIDTH = 60;

function centerLine(text: string, width = LYRICS_MAX_WIDTH): string {
  const visible = text.length > width ? text.slice(0, width - 1) + '…' : text;
  const pad = Math.max(0, Math.floor((width - visible.length) / 2));
  return ' '.repeat(pad) + visible;
}

function renderLyricsBlock(lyrics: LyricsRenderInput): string[] {
  const out: string[] = [];
  out.push(chalk.gray('  ── Şarkı Sözleri ─────────────────────'));

  const emptyLine = '  ' + ' '.repeat(LYRICS_MAX_WIDTH);
  const pushEmpty = (n: number) => { for (let i = 0; i < n; i++) out.push(emptyLine); };

  if (lyrics.loading) {
    pushEmpty(4);
    out.push('  ' + chalk.gray(centerLine('Sözler yükleniyor...')));
    pushEmpty(5);
    out.push('');
    return out;
  }

  if (!lyrics.data) {
    pushEmpty(LYRICS_WINDOW);
    out.push('');
    return out;
  }

  if (lyrics.data.status === 'not-found') {
    pushEmpty(4);
    out.push('  ' + chalk.gray(centerLine('Bu şarkı için söz bulunamadı.')));
    pushEmpty(5);
    out.push('');
    return out;
  }

  if (lyrics.data.status === 'error') {
    pushEmpty(3);
    out.push('  ' + chalk.yellow(centerLine(`Sözler yüklenemedi: ${lyrics.data.message}`)));
    out.push(emptyLine);
    out.push('  ' + chalk.gray(centerLine('L ile tekrar dene')));
    pushEmpty(5);
    out.push('');
    return out;
  }

  // found
  const lines = lyrics.data.lines;
  if (lines.length === 0) {
    pushEmpty(4);
    out.push('  ' + chalk.gray(centerLine('Bu şarkı için söz bulunamadı.')));
    pushEmpty(5);
    out.push('');
    return out;
  }

  if (lyrics.data.synced) {
    const activeIdx = findActiveLineIdx(lines, lyrics.timePos);
    let start = Math.max(0, activeIdx - 3);
    const end = Math.min(lines.length, start + LYRICS_WINDOW);
    start = Math.max(0, end - LYRICS_WINDOW);
    for (let i = start; i < start + LYRICS_WINDOW; i++) {
      if (i >= lines.length) {
        out.push(emptyLine);
        continue;
      }
      const text = clip(lines[i]!.text, LYRICS_MAX_WIDTH - 2);
      if (i === activeIdx) {
        out.push('  ' + chalk.cyan.bold(`▶ ${text}`));
      } else if (i === activeIdx - 1 || i === activeIdx + 1) {
        out.push('  ' + chalk.white(`  ${text}`));
      } else {
        out.push('  ' + chalk.gray(`  ${text}`));
      }
    }
  } else {
    // plain lyrics with manual scroll
    const maxOffset = Math.max(0, lines.length - LYRICS_WINDOW);
    const offset = Math.min(lyrics.scrollOffset, maxOffset);
    for (let i = 0; i < LYRICS_WINDOW; i++) {
      const srcIdx = offset + i;
      if (srcIdx >= lines.length) {
        out.push(emptyLine);
        continue;
      }
      const text = clip(lines[srcIdx]!.text, LYRICS_MAX_WIDTH - 2);
      out.push('  ' + chalk.white(`  ${text}`));
    }
  }
  out.push('');
  return out;
}
```

- [ ] **Step 3: Update `renderPlayer` signature and wire in lyrics**

Find the existing `renderPlayer` function. Change its signature and body. Replace:

```ts
export function renderPlayer(state: PlayerState, queue: Track[], fetchingMix: boolean, favorite = false, shuffle = false, volume = 100) {
```

with:

```ts
export function renderPlayer(state: PlayerState, queue: Track[], fetchingMix: boolean, favorite = false, shuffle = false, volume = 100, lyrics?: LyricsRenderInput) {
```

Then find the queue-rendering block (starts with `if (fetchingMix && queue.length === 0) {`). Wrap it in a lyrics check. Replace:

```ts
  if (fetchingMix && queue.length === 0) {
    lines.push(chalk.gray('  Mix yükleniyor...'), '');
  } else if (queue.length > 0) {
    lines.push(chalk.gray('  Sırada:'));
    for (let i = 0; i < Math.min(queue.length, 4); i++) {
      lines.push(chalk.gray(`    ${i + 1}. ${clip(queue[i].title, 52)}`));
    }
    if (queue.length > 4) {
      lines.push(chalk.gray(`    +${queue.length - 4} şarkı daha`));
    }
    lines.push('');
  }
```

with:

```ts
  if (lyrics?.open) {
    lines.push(...renderLyricsBlock(lyrics));
  } else if (fetchingMix && queue.length === 0) {
    lines.push(chalk.gray('  Mix yükleniyor...'), '');
  } else if (queue.length > 0) {
    lines.push(chalk.gray('  Sırada:'));
    for (let i = 0; i < Math.min(queue.length, 4); i++) {
      lines.push(chalk.gray(`    ${i + 1}. ${clip(queue[i]!.title, 52)}`));
    }
    if (queue.length > 4) {
      lines.push(chalk.gray(`    +${queue.length - 4} şarkı daha`));
    }
    lines.push('');
  }
```

(Note the `!` on `queue[i]` — this silences the pre-existing `'t' possibly undefined` error for the new surrounding code. Leave the original `queue[i]` unchanged if that introduces a new error; our rule is no NEW errors, but fixing this one line is fine since we are re-touching the block anyway. If unsure, keep exact original and accept the pre-existing error stays.)

- [ ] **Step 4: Verify type-check**

```bash
bunx tsc --noEmit 2>&1 | grep -c "error TS"
```

Expected: ≤ 23 (baseline). If it went up, investigate what new error you introduced.

- [ ] **Step 5: Commit**

```bash
git add src/ui.ts src/lyrics.ts
git commit -m "feat(lyrics): add lyrics render block and wire into renderPlayer"
```

(Including `src/lyrics.ts` in the add is a no-op if it didn't change — safe.)

---

## Task 4: Update help line and search hint in `src/ui.ts`

**Files:**
- Modify: `src/ui.ts`

- [ ] **Step 1: Update the player help line**

Find this line in `renderPlayer`:

```ts
  lines.push(chalk.gray('  Space Duraklat/Devam    P Önceki    N Sonraki    ←→ ±10s    F Favori    L Liste    +/- Ses'), '');
  lines.push(chalk.gray('  A Playlist\'e Ekle    O Playlistler    X Karıştır    S Arama    Q Çıkış'), '');
```

Replace with:

```ts
  lines.push(chalk.gray('  Space Duraklat/Devam    P Önceki    N Sonraki    ←→ ±10s    F Favori    L Sözler    +/- Ses'), '');
  lines.push(chalk.gray('  A Playlist\'e Ekle    O Playlistler    X Karıştır    H Favoriler    S Arama    Q Çıkış'), '');
```

Changes: `L Liste` → `L Sözler` in the first line; `H Favoriler` inserted after `X Karıştır` in the second line.

- [ ] **Step 2: Update the search command-mode hint**

Find this line in `renderSearch`:

```ts
      if (hasFavorites) out += chalk.gray('\n  L  Favoriler');
```

Replace with:

```ts
      if (hasFavorites) out += chalk.gray('\n  H  Favoriler');
```

- [ ] **Step 3: Verify type-check unchanged**

```bash
bunx tsc --noEmit 2>&1 | grep -c "error TS"
```

Expected: ≤ 23.

- [ ] **Step 4: Commit**

```bash
git add src/ui.ts
git commit -m "feat(lyrics): update help line and search hint for L/H rebind"
```

---

## Task 5: Add lyrics state and helpers to `src/index.ts`

**Files:**
- Modify: `src/index.ts`

This task only adds state, helpers, and updates existing `renderPlayer` call sites to pass `lyricsRenderInput()`. It does NOT yet add the `L`/`H` handlers — that is Task 6.

- [ ] **Step 1: Update imports**

Find the existing imports at the top. Add the lyrics imports after the existing `./config` import:

```ts
import { fetchLyrics, type LyricsData } from './lyrics';
import type { LyricsRenderInput } from './ui';
```

- [ ] **Step 2: Add module-scope state variables**

After the existing `let volume = 100;` line and before `let renderTimer: ...`, add:

```ts
let lyricsOpen = false;
let lyricsData: LyricsData | null = null;
let lyricsScrollOffset = 0;
let lyricsLoading = false;
```

- [ ] **Step 3: Add the two helpers**

After `shuffleArray` (before `const player = new Player();`), add:

```ts
function lyricsRenderInput(): LyricsRenderInput {
  return {
    open: lyricsOpen,
    loading: lyricsLoading,
    data: lyricsData,
    scrollOffset: lyricsScrollOffset,
    timePos: player.state.timePos ?? 0,
  };
}

async function loadLyricsForCurrent() {
  if (!currentTrack || lyricsLoading) return;
  lyricsLoading = true;
  const trackForFetch = currentTrack;
  try {
    const data = await fetchLyrics(trackForFetch);
    if (currentTrack?.id !== trackForFetch.id) return;
    lyricsData = data;
  } finally {
    lyricsLoading = false;
  }
  if (appState === 'playing' && currentTrack) {
    renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack.id), shuffleMode, volume, lyricsRenderInput());
  }
}
```

- [ ] **Step 4: Update every `renderPlayer(...)` call site to pass `lyricsRenderInput()`**

There are **8** call sites in `src/index.ts`. Find each and add `lyricsRenderInput()` as the final argument. Use grep to enumerate them:

```bash
grep -n "renderPlayer(" src/index.ts
```

Each currently ends with `..., shuffleMode, volume)`. Change each to `..., shuffleMode, volume, lyricsRenderInput())`.

Expected sites:
1. Inside the `setInterval` in `startPlaying`
2. The one-shot call at the end of `startPlaying`
3. Inside the `F` case in `onPlayingKey`
4. Inside the `X` case in `onPlayingKey`
5. Inside the `+`/`=` case in `onPlayingKey`
6. Inside the `-`/`_` case in `onPlayingKey`
7. Inside the `setInterval` in `returnToPlayer`
8. The one-shot call at the end of `returnToPlayer`

Verify your grep count matches — if fewer, you missed the helper you added in Task 5 Step 3 (`loadLyricsForCurrent`), which also contains a `renderPlayer` call but is correct as written (it already passes `lyricsRenderInput()`).

- [ ] **Step 5: Verify type-check**

```bash
bunx tsc --noEmit 2>&1 | grep -c "error TS"
```

Expected: ≤ 23.

- [ ] **Step 6: Verify the app still launches**

```bash
timeout 3 bun src/index.ts < /dev/null || true
```

Expected: App prints the search screen then exits (timeout or broken pipe). Confirms imports and top-level compilation are sound. Ignore exit code.

- [ ] **Step 7: Commit**

```bash
git add src/index.ts
git commit -m "feat(lyrics): add lyrics state and wire renderPlayer call sites"
```

---

## Task 6: Add `L`/`H` handlers in `onPlayingKey`

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Replace the existing `L` case and add `H` case**

Find in `onPlayingKey`:

```ts
    case 'l':
    case 'L':
      if (favorites.length > 0) {
        appState = 'favorites';
        favSelectedIdx = 0;
        if (renderTimer) { clearInterval(renderTimer); renderTimer = null; }
        renderFavorites(favorites, favSelectedIdx);
      }
      break;
```

Replace with:

```ts
    case 'l':
    case 'L':
      lyricsOpen = !lyricsOpen;
      if (lyricsOpen && !lyricsData && !lyricsLoading && currentTrack) {
        loadLyricsForCurrent();
      }
      renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack!.id), shuffleMode, volume, lyricsRenderInput());
      break;
    case 'h':
    case 'H':
      if (favorites.length > 0) {
        appState = 'favorites';
        favSelectedIdx = 0;
        if (renderTimer) { clearInterval(renderTimer); renderTimer = null; }
        renderFavorites(favorites, favSelectedIdx);
      }
      break;
```

- [ ] **Step 2: Add arrow scroll for plain (unsynced) lyrics**

Find in `onPlayingKey`:

```ts
    case LEFT:
      await player.seek(-10);
      break;
    case RIGHT:
      await player.seek(10);
      break;
```

There is no existing `UP`/`DOWN` case in `onPlayingKey`. Add one after the `RIGHT` case, before the next `case 'f':`:

```ts
    case UP:
      if (lyricsOpen && lyricsData?.status === 'found' && !lyricsData.synced) {
        lyricsScrollOffset = Math.max(0, lyricsScrollOffset - 1);
        renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack!.id), shuffleMode, volume, lyricsRenderInput());
      }
      break;
    case DOWN:
      if (lyricsOpen && lyricsData?.status === 'found' && !lyricsData.synced) {
        lyricsScrollOffset += 1;
        renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack!.id), shuffleMode, volume, lyricsRenderInput());
      }
      break;
```

(The render helper clamps scroll; we do not need to clamp here.)

- [ ] **Step 3: Verify type-check**

```bash
bunx tsc --noEmit 2>&1 | grep -c "error TS"
```

Expected: ≤ 23.

- [ ] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat(lyrics): add L toggle, H favorites rebind, and plain scroll"
```

---

## Task 7: Reset lyrics state on track change

**Files:**
- Modify: `src/index.ts`

Every time a new track starts playing, reset `lyricsData`, `lyricsScrollOffset`, and `lyricsLoading`. Keep `lyricsOpen` — if the user had lyrics open, they stay open and auto-load for the new track.

Three locations need this:
1. `startPlaying` — at the top (after `if (currentTrack) history.push(currentTrack);` and before `queue = [];`)
2. The `end-file` handler — right after `const next = queue.shift()!;` and before `currentTrack = next;` ... actually AFTER `currentTrack = next;` and BEFORE `await player.loadTrack(...)`
3. The `n`/`N` case in `onPlayingKey` — same position as #2

Plus one more: the `p`/`P` (previous) case. On going back, we also want to clear the previously-loaded lyrics so the newly-active track's lyrics reload.

- [ ] **Step 1: Add a small helper**

After `lyricsRenderInput()` / `loadLyricsForCurrent()`, add:

```ts
function resetLyricsForNewTrack() {
  lyricsData = null;
  lyricsScrollOffset = 0;
  lyricsLoading = false;
  if (lyricsOpen) loadLyricsForCurrent();
}
```

- [ ] **Step 2: Call it in `startPlaying`**

Find in `startPlaying`:

```ts
  if (currentTrack) history.push(currentTrack);
  queue = [];
  currentTrack = track;
```

Insert the reset between `currentTrack = track;` and `await player.loadTrack(track.url);`:

```ts
  if (currentTrack) history.push(currentTrack);
  queue = [];
  currentTrack = track;
  resetLyricsForNewTrack();
```

- [ ] **Step 3: Call it in the `end-file` handler**

Find:

```ts
  if (queue.length > 0) {
    if (currentTrack) history.push(currentTrack);
    const next = queue.shift()!;
    currentTrack = next;
    await player.loadTrack(next.url);
```

Insert:

```ts
  if (queue.length > 0) {
    if (currentTrack) history.push(currentTrack);
    const next = queue.shift()!;
    currentTrack = next;
    resetLyricsForNewTrack();
    await player.loadTrack(next.url);
```

- [ ] **Step 4: Call it in the `n`/`N` case**

Find in `onPlayingKey`:

```ts
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
```

Insert the reset:

```ts
    case 'n':
    case 'N':
      if (queue.length > 0) {
        if (currentTrack) history.push(currentTrack);
        const next = queue.shift()!;
        currentTrack = next;
        resetLyricsForNewTrack();
        await player.loadTrack(next.url);
        if (queue.length < 5) refillQueue(next.id);
      }
      break;
```

- [ ] **Step 5: Call it in the `p`/`P` case**

Find:

```ts
    case 'p':
    case 'P':
      if (history.length > 0) {
        if (currentTrack) queue.unshift(currentTrack);
        const prev = history.pop()!;
        currentTrack = prev;
        await player.loadTrack(prev.url);
      }
      break;
```

Insert the reset:

```ts
    case 'p':
    case 'P':
      if (history.length > 0) {
        if (currentTrack) queue.unshift(currentTrack);
        const prev = history.pop()!;
        currentTrack = prev;
        resetLyricsForNewTrack();
        await player.loadTrack(prev.url);
      }
      break;
```

- [ ] **Step 6: Verify type-check**

```bash
bunx tsc --noEmit 2>&1 | grep -c "error TS"
```

Expected: ≤ 23.

- [ ] **Step 7: Commit**

```bash
git add src/index.ts
git commit -m "feat(lyrics): reset lyrics state on track change, keep open flag"
```

---

## Task 8: Update `onSearchInput` command mode — `L` → `H`

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Change the favorites shortcut in command mode**

Find in `onSearchInput`:

```ts
    // Handle L (favorites) shortcut
    if ((key === 'l' || key === 'L') && !searchQuery) {
      if (favorites.length > 0) {
        appState = 'favorites';
        favSelectedIdx = 0;
        renderFavorites(favorites, favSelectedIdx);
      }
      return;
    }
```

Replace with:

```ts
    // Handle H (favorites) shortcut
    if ((key === 'h' || key === 'H') && !searchQuery) {
      if (favorites.length > 0) {
        appState = 'favorites';
        favSelectedIdx = 0;
        renderFavorites(favorites, favSelectedIdx);
      }
      return;
    }
```

`L` in command mode now falls through to the default character-in-command-mode branch and switches back to typing mode with `l` as the first character — which is the same behavior as any other letter. This is correct; lyrics are not meaningful on the search screen.

- [ ] **Step 2: Verify type-check**

```bash
bunx tsc --noEmit 2>&1 | grep -c "error TS"
```

Expected: ≤ 23.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat(lyrics): rebind search command mode L→H for favorites"
```

---

## Task 9: Update `knowledge-base/Manual Test Checklist.md`

**Files:**
- Modify: `knowledge-base/Manual Test Checklist.md`

This task has two parts: (a) update existing `L`-based Favorites entries to reference `H` instead, and (b) add a new `## Lyrics` section with the 9 spec test cases.

- [ ] **Step 1: Update the Favoriler section**

Find the existing `## Favoriler` section. Replace these three lines:

```
- [ ] L ile favori listesi ekranina gidilir
...
- [ ] Favori yokken L bir sey yapmaz
- [ ] Arama ekraninda (query bos iken) L ile favori listesine gidilir
- [ ] Arama ekraninda favori varsa "L  Favoriler" ipucu gosterilir
```

with:

```
- [ ] H ile favori listesi ekranina gidilir
...
- [ ] Favori yokken H bir sey yapmaz
- [ ] Arama ekraninda (query bos iken) H ile favori listesine gidilir
- [ ] Arama ekraninda favori varsa "H  Favoriler" ipucu gosterilir
```

(Use Edit with the full lines; preserve the rest of the section untouched.)

- [ ] **Step 2: Add a new `## Sozler` section**

Insert AFTER the `## Volume Control` section and BEFORE `## Windows`:

```
## Sozler

- [ ] Bilinen populer sarki calarken L basinca synced sozler aktif satir highlight ile gorunur
- [ ] Sol/sag ok ile seek yapilinca aktif satir 1 sn icinde guncellenir
- [ ] L ile ac/kapa/ac/kapa yapilinca anlik toggle olur, ikinci acilista network istegi atilmaz (cache)
- [ ] Enstrumantal/sozsuz sarki icin "Bu sarki icin soz bulunamadi" mesaji gosterilir
- [ ] Wi-Fi kapaliyken L basilinca "Sozler yuklenemedi: Ag hatasi" gosterilir; Wi-Fi acilip tekrar L ile retry calisir
- [ ] N ile sonraki sarkiya gecilirken sozler acikken yeni sarkinin sozleri otomatik yuklenir ve acik kalir
- [ ] Sadece plain (synced olmayan) sozlu sarkida UP/DOWN ile manuel scroll calisir; synced sarkida UP/DOWN no-op
- [ ] Player ekraninda H ile favoriler, L ile sozler acilir (rol degisimi dogrulamasi)
- [ ] Arama ekraninda Esc sonrasi H ile favoriler acilir; L hicbir sey yapmaz
```

- [ ] **Step 3: Commit**

```bash
git add "knowledge-base/Manual Test Checklist.md"
git commit -m "docs: add lyrics test cases and rebind favorites tests to H"
```

---

## Task 10: Update task note status

**Files:**
- Modify: `knowledge-base/Tasks/Lyrics View.md`

- [ ] **Step 1: Flip status to `in-progress` and check acceptance criteria**

Change the frontmatter `status: planned` to `status: in-progress`.

Check off the acceptance criteria that the code now satisfies:

```
- [x] `L` tusu sarki sozleri ekranini acar/kapatir
- [x] Sozler harici bir API'den cekilir
- [x] Sozler bulunamazsa kullaniciya bilgi verilir
- [x] Sozler scroll edilebilir
```

Leave a note near the bottom:

```
## Implementation Notes

Design spec: `knowledge-base/Specs/2026-04-11-lyrics-view-design.md`
Plan: `knowledge-base/Plans/2026-04-11-lyrics-view-plan.md`

Lyrics kaynagi LRCLIB. `L` tusu playing state'te lyrics toggle ediyor; Favoriler `H`'ye tasindi. Scroll sadece plain (synced olmayan) sozler icin calisir; synced sozler auto-follow ile ilerler.
```

- [ ] **Step 2: Commit**

```bash
git add "knowledge-base/Tasks/Lyrics View.md"
git commit -m "docs: mark lyrics view task as in-progress"
```

---

## Task 11: Update README keybinding docs (if present)

**Files:**
- Modify: `README.md` (only if it documents keybindings)

- [ ] **Step 1: Check the README for keybinding documentation**

```bash
grep -n -E "(^| )L( |$)|Favori|lyrics|sözler" README.md || echo "no matches"
```

If no matches or the README does not document the player keybindings, skip this task.

- [ ] **Step 2: If keybindings are documented, update them**

Wherever the README lists `L` as Favorites / Liste, change it to `L` = Sözler (Lyrics) and add or update `H` = Favoriler. Match existing README style (language, table format).

- [ ] **Step 3: Commit (only if README changed)**

```bash
git add README.md
git commit -m "docs: update README keybindings for lyrics L and favorites H"
```

If no change was needed, this task has no commit.

---

## Task 12: End-to-end manual test

**Files:**
- None (verification only)

Run through the `## Sozler` section of `knowledge-base/Manual Test Checklist.md` against real music. Also run the updated Favoriler entries to confirm the `L` → `H` rebind holds.

- [ ] **Step 1: Launch the app**

```bash
bun src/index.ts
```

- [ ] **Step 2: Execute the 9 lyrics test cases**

Go through each checkbox in `## Sozler`. Record any failures.

- [ ] **Step 3: Re-execute the updated Favoriler entries**

Confirm:
- `H` in playing state opens favorites
- `H` in search command mode opens favorites
- The hint panel shows `H  Favoriler`
- `L` in playing state opens lyrics (not favorites)

- [ ] **Step 4: If all cases pass, flip the task status to `done`**

Update `knowledge-base/Tasks/Lyrics View.md` frontmatter: `status: in-progress` → `status: done`.

```bash
git add "knowledge-base/Tasks/Lyrics View.md"
git commit -m "docs: mark lyrics view task as done"
```

- [ ] **Step 5: Push the branch and open a PR (if requested by the user)**

Do NOT push or open a PR automatically. Report back to the user with a summary of what was done and ask whether to push.

---

## Rollback

Every task is its own commit. To roll back a single task:

```bash
git log --oneline feature/lyrics-view
git revert <commit-sha>
```

To abandon the whole feature:

```bash
git checkout main
git branch -D feature/lyrics-view
```
