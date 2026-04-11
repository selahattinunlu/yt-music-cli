---
title: Lyrics View — Design
tags:
  - kb
  - spec
  - design
task_id: TASK-003
status: approved
date: 2026-04-11
---

# Lyrics View — Design Spec

## Amac

Calan sarkinin sozlerini terminal icinde, tercihen zamanli (karaoke tarzi) olarak gostermek. Kullanici `L` tusu ile player ekraninda lyrics alt-modunu acip kapatabilmeli.

## Kapsamin Disinda

- Disk cache (YAGNI — memory cache yeterli)
- Coklu lyrics kaynagi fallback (sadece LRCLIB)
- Genius/lyrics.ovh entegrasyonu
- Lyrics duzenleme / elle yuklenebilir lyrics
- Cevirmen / ceviri gosterimi

## Karar Ozeti

| Karar | Secim | Gerekce |
|---|---|---|
| Lyrics kaynagi | LRCLIB | Ucretsiz, API key yok, synced (LRC) destekli, iyi kapsam |
| Ekran duzeni | Sub-mode overlay (queue alani yerine lyrics) | Mevcut `renderPlayer` yapisina en temiz uyum, progress bar korunur, yeni state gerekmez |
| Lyrics tusu | `L` | Task notuyla uyumlu |
| Favoriler tusu | `H` (playing + search-command) | `L` artik lyrics; `H` mnemonic (Heart, ♥ ikonuyla uyumlu) |
| Cache | Memory (`Map<trackId, LyricsData>`) | Process omru boyunca, basit, ileride disk'e yukseltilebilir |
| Fetch stratejisi | Lazy — sadece `L` basilinca | Lyrics acmayan kullanici icin gereksiz istek yok |
| Scroll davranisi | Synced → auto-follow, ↑↓ no-op. Plain → manuel scroll, auto-follow yok | Basit, anlasilir, test edilmesi kolay |
| Unit test | Yok | Proje normu manuel checklist; pure fn'ler icin de ayri test dosyasi acmiyoruz |

## Mimari

Tek process, mevcut `src/index.ts` state machine icinde bir alt-mod. Yeni `AppState` **eklenmez** — lyrics gorunurlugu `playing` state icinde bir bayrak.

```
src/
├── lyrics.ts       (YENI) — LRCLIB client + LRC parser + title parser + memory cache
├── index.ts        (degisir) — lyricsOpen flag, L/H handlers, arrow scroll
├── ui.ts           (degisir) — renderPlayer lyrics parametresi alir
└── types.ts        (degismez) — lyrics tipleri lyrics.ts icinde tutulur
```

### Veri Akisi

1. Kullanici `L` basar → `index.ts` `lyricsOpen = true`, `loadLyricsForCurrent()` cagrilir
2. `lyrics.ts` once memory cache'e bakar; hit yoksa title'i artist/title'a parse eder, LRCLIB'e istek atar, yaniti `LyricsData`'ya normalize eder, cache'ler (`found`/`not-found` cache'lenir; `error` cache'lenmez)
3. `renderPlayer` aktif satiri `state.timePos`'a gore bulur, queue alani yerine lyrics blogunu cizer
4. Mevcut 1 saniyelik render timer aktif satiri otomatik gunceller — ekstra timer yok
5. `L` tekrar basilirsa `lyricsOpen = false`, queue gorunumu geri doner

**Neden sub-mode?** Player keybinding'leri (space, n, p, ←→, +/-, f, h, a, o, x, s, q) lyrics acikken de calismali. Ayri state yapmak tum handler'lari yeniden baglamayi gerektirirdi; flag yaklasimi ~20 satirla biter.

## Bilesenler

### `src/lyrics.ts` (YENI)

**Public API:**

```ts
export type LyricsLine = { time: number; text: string };  // time = seconds, 0 if unsynced

export type LyricsData =
  | { status: 'found'; lines: LyricsLine[]; synced: boolean }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

export function fetchLyrics(track: Track): Promise<LyricsData>;
export function findActiveLineIdx(lines: LyricsLine[], timePos: number): number;
```

**Memory cache:** `const cache = new Map<string, LyricsData>()`, anahtar `track.id`. `found` ve `not-found` cache'lenir; `error` cache'lenmez (retry'a izin verilmeli).

**Title parsing (`parseTitle(title, uploader)` — internal):**

1. `title` icinde ` - ` varsa → ilk split: `[artist, song]`
2. `song` icinden yaygin susleri temizle: `(Official Video)`, `[Lyrics]`, `(Official Music Video)`, `(Audio)`, `(Lyric Video)` vb. regex ile sok
3. ` - ` yoksa → `artist = uploader` (uploader'daki `VEVO`, `- Topic`, `Official` eklerini temizle), `song = title`
4. `uploader` da yoksa → `artist = ''`, LRCLIB'e sadece `track_name` gonder

Basit heuristic, kapsamin ~%80'ini tutar. Kenar durumlar (feat., remix, live) LRCLIB tarafindaki toleransa birakilir.

**HTTP istegi:**

```
GET https://lrclib.net/api/get?artist_name={encodeURIComponent(artist)}&track_name={encodeURIComponent(title)}[&duration={track.duration}]
```

- `duration` varsa eklenir — LRCLIB dogrulama icin kullanir, daha iyi eslesir
- `AbortController` ile 5 saniye timeout
- `User-Agent` header: `yt-music-cli/{version}` (LRCLIB talep ediyor)

**Yanit isleme:**

| Durum | Sonuc |
|---|---|
| `200` + `syncedLyrics` alani dolu | LRC parse → `{ status: 'found', lines, synced: true }` |
| `200` + sadece `plainLyrics` | Satir satir bol, tum `time: 0` → `{ status: 'found', lines, synced: false }` |
| `200` + ikisi de bos | `{ status: 'not-found' }` |
| `404` | `{ status: 'not-found' }` (cache'lenir) |
| Diger non-200 | `{ status: 'error', message: 'Sunucu hatasi' }` (cache'lenmez) |
| Network exception | `{ status: 'error', message: 'Ag hatasi' }` (cache'lenmez) |
| Timeout | `{ status: 'error', message: 'Zaman asimi' }` (cache'lenmez) |
| JSON parse fail | `{ status: 'error', message: 'Gecersiz yanit' }` (cache'lenmez) |

**LRC parser (`parseLRC(text)` — internal):**

LRC formati: `[mm:ss.xx] Satir metni`. Regex ile timestamp yakalanir, saniyeye cevrilir, metin ayiklanir. Timestamp'siz satirlar atlanir. Coklu timestamp ayni satirda (`[00:10.00][00:45.00] text`) → her timestamp icin ayri `LyricsLine`. Sonuc `time` alanina gore sortlanmis dondurulur.

**`findActiveLineIdx(lines, timePos)`:**

`lines`'i `time` ile sirali varsayar, `timePos`'tan kucuk olan son satirin indeksini doner. Hic yoksa (timePos tum satirlardan kucukse) `0` doner. Lineer arama — lyrics genelde <100 satir, binary search YAGNI.

Toplam ~120-150 satir, `src/search.ts` gibi pure + tek sorumluluk.

### `src/index.ts` degisiklikleri

**Yeni modul-scope degiskenler:**

```ts
let lyricsOpen = false;
let lyricsData: LyricsData | null = null;
let lyricsScrollOffset = 0;
let lyricsLoading = false;
```

**Track degisimi** (startPlaying + `end-file` handler + `n`/`p` key handlers): her yeni track yuklendiginde `lyricsData = null`, `lyricsLoading = false`, `lyricsScrollOffset = 0` sifirlanir. `lyricsOpen` **korunur** — kullanici lyrics acikken siradaki sarkiya gecerse lyrics acik kalsin, yeni sarkinin lyrics'i otomatik yuklensin. `lyricsOpen === true` ise `loadLyricsForCurrent()` tetiklenir.

Bu mantik `end-file`, `onPlayingKey` `n`, `onPlayingKey` `p` dallarinda inline eklenir (3 yerde ayni 4 satir). Helper'a cikarmaya gerek yok — mevcut kodda benzer helper yok.

**Yeni `onPlayingKey` dallari:**

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
  // Eski L davranisinin birebir kopyasi
  if (favorites.length > 0) {
    appState = 'favorites';
    favSelectedIdx = 0;
    if (renderTimer) { clearInterval(renderTimer); renderTimer = null; }
    renderFavorites(favorites, favSelectedIdx);
  }
  break;

case UP:
  if (lyricsOpen && lyricsData?.status === 'found' && !lyricsData.synced) {
    lyricsScrollOffset = Math.max(0, lyricsScrollOffset - 1);
    renderPlayer(...);
  }
  break;

case DOWN:
  if (lyricsOpen && lyricsData?.status === 'found' && !lyricsData.synced) {
    lyricsScrollOffset += 1;  // clamp render tarafinda
    renderPlayer(...);
  }
  break;
```

**`loadLyricsForCurrent()` helper:**

```ts
async function loadLyricsForCurrent() {
  if (!currentTrack) return;
  lyricsLoading = true;
  const trackForFetch = currentTrack;
  const data = await fetchLyrics(trackForFetch);
  if (currentTrack?.id !== trackForFetch.id) return;  // race guard
  lyricsData = data;
  lyricsLoading = false;
  if (appState === 'playing') {
    renderPlayer(player.state, queue, fetchingMix, isFavorite(favorites, currentTrack.id), shuffleMode, volume, lyricsRenderInput());
  }
}
```

**`lyricsRenderInput()` helper:** mevcut `lyricsOpen`, `lyricsLoading`, `lyricsData`, `lyricsScrollOffset`, `player.state.timePos` degerlerini `LyricsRenderInput` objesine toplar — call-site'larda tekrari azaltmak icin.

**`onSearchInput` command mode:** `l`/`L` → Favoriler kisayolu **yerine** `h`/`H` → Favoriler. Arama ekraninda lyrics anlamsiz — `l`/`L` orada no-op.

**Render timer:** `renderTimer` icinde `renderPlayer` cagrisi `lyricsRenderInput()` ile cagrilir. Synced lyrics'te timer zaten 1 sn'de bir aktif satiri gunceller — ekstra zaman kaynagi yok.

### `src/ui.ts` degisiklikleri

**`renderPlayer` imzasina yeni parametre:**

```ts
export function renderPlayer(
  state: PlayerState,
  queue: Track[],
  fetchingMix: boolean,
  favorite = false,
  shuffle = false,
  volume = 100,
  lyrics?: LyricsRenderInput,   // YENI, optional — undefined ise eski davranis
)

export type LyricsRenderInput = {
  open: boolean;
  loading: boolean;
  data: LyricsData | null;
  scrollOffset: number;
  timePos: number;
};
```

**Render dali:** `lyrics?.open` true ise queue blogu yerine lyrics blogu cizilir. Ust kisim (baslik, durum, progress bar) degismez.

**Sabit lyrics alan yuksekligi:** 10 satir gorunur + 1 satir baslik (`── Sarki Sozleri ──`) + 1 satir alt bosluk. Sabit yukseklik kritik — mevcut cursor-home + line-clear stratejisi flicker icin sabit geometri bekler.

**Durum bazli icerik:**

| Durum | Gosterim |
|---|---|
| `loading` | "Sozler yukleniyor..." (gri, ortalanmis), 10 satir alanin tamami bos bosluklarla doldurulur |
| `found && synced` | Aktif satir etrafinda 10 satirlik pencere (aktif cyan bold + `▶`, ±1 beyaz, diger gri); `findActiveLineIdx` ile belirlenir |
| `found && !synced` | `scrollOffset` baslangicli 10 satir; highlight yok; alt help'te `↑↓ Scroll` hatirlaticisi |
| `not-found` | "Bu sarki icin soz bulunamadi." (gri, ortalanmis), 10 satir alan bos kalir |
| `error` | "Sozler yuklenemedi: {message}" (sari) + "L ile tekrar dene" (gri) |

**Aktif satir penceresi algoritmasi (synced):**

```ts
const WINDOW = 10;
const activeIdx = findActiveLineIdx(lines, timePos);
let start = Math.max(0, activeIdx - 3);
const end = Math.min(lines.length, start + WINDOW);
start = Math.max(0, end - WINDOW);  // sonda eksik kalmasin, pencere kaydir
```

**Plain scroll (unsynced):**

```ts
const WINDOW = 10;
const maxOffset = Math.max(0, lines.length - WINDOW);
const offset = Math.min(scrollOffset, maxOffset);  // clamp
// render lines[offset..offset+WINDOW]
```

**Yardimci fonksiyon (`ui.ts` internal):** `renderLyricsBlock(lyrics: LyricsRenderInput): string[]` — pure, `renderPlayer` icinde `lines` array'ine push'lanan satirlari uretir.

**Clipping:** Her lyrics satiri `clip(line, 60)` ile terminal genisligine uyarlanir (queue satirlariyla ayni).

**Help satiri:** Statik, iki satir:

```
  Space Duraklat/Devam    P Onceki    N Sonraki    ←→ ±10s    F Favori    L Sozler    +/- Ses
  A Playlist'e Ekle    O Playlistler    X Karistir    H Favoriler    S Arama    Q Cikis
```

(Eski `L Liste` → kaldirildi; `H Favoriler` yeni; `L Sozler` yeni.)

**Search ekrani hint'i (`renderSearch`):** Command mode'da `L Favoriler` satiri `H Favoriler` olarak degisir. Somut olarak: `src/ui.ts` icinde `'  L  Favoriler'` olarak gecen hardcoded string `'  H  Favoriler'` olur.

## Hata Isleme ve Kenar Durumlari

**Network:**
- `fetch` throw → `error`, cache'lenmez, kullanici `L` ile retry edebilir
- `404` → `not-found`, cache'lenir
- `200` ama JSON parse fail → `error`, cache'lenmez
- Non-200/non-404 → `error`, cache'lenmez
- Timeout (5 sn, `AbortController`) → `error`, cache'lenmez

**Title parse:**
- ` - ` yok → `artist = uploader` (temizlenmis), `title = tum title`
- `uploader` yok (nadir) → `artist = ''`, sadece `track_name` gonder
- Bos title → erken `not-found`, istek atilmaz

**LRC parse:**
- Hic timestamp yok → `synced: false`, plain muamele
- Bazi satirlar timestamp'siz → o satirlar atlanir
- Coklu timestamp tek satirda → her biri icin ayri `LyricsLine`
- Bos `syncedLyrics` → plain varsa plain, yoksa `not-found`

**Race condition:** `loadLyricsForCurrent` icinde `currentTrack.id` yeniden kontrol edilir (section `Bilesenler > index.ts`). Eski fetch yeni track'e atanamaz.

**Paused:** Synced lyrics `state.timePos`'a bakar; paused iken `timePos` donar → aktif satir donar. Dogru davranis.

**Seek (← →):** Bir sonraki render tick'inde (max 1 sn) aktif satir gunceller. Ekstra is yok.

**Cache hit `not-found`:** Ayni sarki icin `L` yeniden basildiginda anida "Sozler bulunamadi" gosterilir, istek atilmaz.

**Ctrl+C cleanup:** Devam eden fetch abort edilmez; process olur. Zararsiz.

## Test Plani

Unit test yok (proje normu manuel checklist). `knowledge-base/Manual Test Checklist.md`'ye su 9 test case eklenir:

1. Bilinen populer sarki (ornek: "Adele - Hello") → `L` basinca synced lyrics aktif satir highlight ile gorunur
2. Seek (← →) sonrasi aktif satir 1 sn icinde guncellenir
3. `L` ile ac/kapa/ac/kapa — anida toggle, ikinci acilista network istegi YOK (cache dogrulamasi)
4. Enstrumantal/sozsuz sarki → "Bu sarki icin soz bulunamadi" mesaji
5. Wi-Fi kapali + `L` → "Sozler yuklenemedi: Ag hatasi", Wi-Fi acip tekrar `L` ile retry calisir
6. Track gecisi (`n`) lyrics acikken → yeni track'in sozleri otomatik yuklenir, lyrics acik kalir
7. Plain-only sarki (synced yok) → ↑↓ ile manuel scroll calisir; synced sarkida ↑↓ no-op
8. Playing state'te `H` → Favoriler acilir; `L` → Lyrics toggle eder (rol degisimi dogrulamasi)
9. Arama ekraninda Esc + `H` → Favoriler; Esc + `L` → no-op

## Implementation Order

1. `src/lyrics.ts` olustur — tipler, `parseTitle`, `parseLRC`, `findActiveLineIdx`, `fetchLyrics`, memory cache
2. `src/ui.ts` — `renderPlayer` imzasi + `renderLyricsBlock` helper + help satiri `L`/`H` guncellemesi + `renderSearch` hint guncellemesi
3. `src/index.ts` — lyrics state degiskenleri, `L`/`H` handler'lari (playing + search command), `loadLyricsForCurrent`, track degisimi entegrasyonu, arrow scroll, `renderPlayer` call-site'larinin guncellenmesi
4. `knowledge-base/Manual Test Checklist.md` — 9 test case ekle
5. `knowledge-base/Tasks/Lyrics View.md` — status `planned` → `in-progress`, acceptance criteria isaretleme
6. README keybinding tablosu (varsa) — `L` ve `H` yeni anlamlari
7. Manuel test — gercek sarkilarla tum 9 case

## Acik Sorular / Riskler

- **LRCLIB User-Agent politikasi:** LRCLIB `User-Agent` zorunlu; hangi versiyon string'inin kullanilacagi `package.json`'dan cekilmeli. Implementation sirasinda `package.json`'i okuyup `yt-music-cli/{version}` formatinda gondermek makul.
- **Title parsing dogrulugu:** Basit heuristic kapsamin ~%80'ini tutar; kalan %20 (cok dilli, feat., remix) icin LRCLIB tarafindaki toleransa bel baglariz. Kullanim sirasinda kenar durumlar cikarsa parser iyilestirilir.
- **Sabit 10 satir pencere:** Cok kucuk terminal pencerelerinde tasma olabilir. `process.stdout.rows` kontrolu eklemek bir sonraki iterasyon — su an skop disinda.
