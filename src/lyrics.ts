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

// ─── Fetch + cache ─────────────────────────────────────────────────────────

const cache = new Map<string, LyricsData>();
const LRCLIB_BASE = 'https://lrclib.net/api/get';
const FETCH_TIMEOUT_MS = 10000;
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
