# yt-music-cli

YouTube Music player for your terminal. Search and stream music directly from YouTube — no browser, no ads, no distractions.

## Requirements

- [mpv](https://mpv.io) — media player
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) — YouTube stream extractor

**macOS**
```sh
brew install mpv yt-dlp
```

**Linux (Debian/Ubuntu)**
```sh
sudo apt install mpv yt-dlp
```

**Windows**
```sh
winget install mpv.mpv
winget install yt-dlp.yt-dlp
```

## Installation

```sh
npm install -g yt-music-cli
```

## Usage

```sh
yt-music
```

## Controls

### Player

| Key | Action |
|-----|--------|
| `Space` | Pause / Resume |
| `←` / `→` | Seek -10s / +10s |
| `N` | Next track |
| `P` | Previous track |
| `F` | Toggle favorite |
| `X` | Toggle shuffle |
| `A` | Add to playlist |
| `O` | Open playlists |
| `L` | Toggle lyrics |
| `↑` / `↓` | Scroll lyrics (when open, unsynced only) |
| `H` | Open favorites |
| `+` / `-` | Volume up / down |
| `S` | Back to search |
| `Q` / `Ctrl+C` | Quit |

### Search

| Key | Action |
|-----|--------|
| Type + `Enter` | Search |
| `↑` / `↓` | Navigate results |
| `Enter` | Play selected track |
| `Esc` | Toggle command mode |
| `H` | Open favorites (command mode) |
| `O` | Open playlists (command mode) |

### Playlists

| Key | Action |
|-----|--------|
| `Enter` | Open playlist / Play track |
| `C` | Create new playlist |
| `R` | Rename playlist |
| `D` | Delete playlist / Remove track |
| `Q` | Go back |

## Features

- **Search & Play** — Search YouTube and stream audio directly
- **Radio Mix** — Auto-queues related tracks when you start playing
- **Favorites** — Save tracks you love, persisted across sessions
- **Playlists** — Create, rename, and manage playlists with full queue support
- **Shuffle** — Shuffle the queue with a single keypress
- **History** — Navigate back to previously played tracks
- **Lyrics** — Show synced lyrics with the active line highlighted, fetched from [LRCLIB](https://lrclib.net)

## How it works

Plays audio directly from YouTube via `yt-dlp` + `mpv` — nothing is downloaded to disk. When you start a track, a radio mix is automatically queued in the background. Playing from a playlist queues the remaining playlist tracks first, then continues with the radio mix.

## License

MIT
