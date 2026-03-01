# yt-music-cli

YouTube Music player for your terminal. Search and stream music directly from YouTube — no browser, no ads, no distractions.

## Requirements

- [mpv](https://mpv.io) — media player
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) — YouTube stream extractor

```sh
brew install mpv yt-dlp
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

| Key | Action |
|-----|--------|
| Type + `Enter` | Search |
| `↑` / `↓` | Navigate results |
| `Enter` | Play selected track |
| `Space` | Pause / Resume |
| `←` / `→` | Seek -10s / +10s |
| `N` | Next track |
| `S` | Back to search |
| `Q` / `Ctrl+C` | Quit |

## How it works

Plays audio directly from YouTube via `yt-dlp` + `mpv` — nothing is downloaded to disk. When you start a track, a radio mix is automatically queued in the background.

## License

MIT
