# Changelog

## v0.3.0

### New Features

- **Volume Control** — Press `+`/`=` to increase, `-`/`_` to decrease volume by 5 units. Current volume is displayed on the player screen.

### Fixes

- Fix search input hotkey handling on search screen

## v0.2.1

### Fixes

- Fix platform package resolution in bin script (use scoped package names)

## v0.2.0

### New Features

- **Previous Track** — Press `P` to go back to previously played tracks
- **Favorites** — Press `F` to toggle favorite, `L` to open favorites list. Favorites are persisted across sessions
- **Playlists** — Full playlist management:
  - Create, rename, and delete playlists
  - Add and remove tracks
  - Press `O` to open playlists from player or search screen
  - Press `A` to add current track to a playlist
- **Playlist Queue** — Playing a track from a playlist queues all playlist tracks, then continues with YouTube radio mix
- **Shuffle** — Press `X` to toggle shuffle mode for the queue
- **Search Screen Shortcuts** — Access favorites (`L`) and playlists (`O`) directly from the search screen

### Fixes

- Fix screen flicker on player refresh by using cursor home with line-level clearing

## v0.1.1

- Initial release with search, play, pause, seek, next track, and radio mix
