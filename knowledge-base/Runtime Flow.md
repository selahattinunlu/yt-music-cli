---
title: Runtime Flow
tags:
  - kb
  - runtime
  - flows
---

# Runtime Flow

## Uygulama Baslangici

1. `main()` icinde `mpv` ve `yt-dlp` kontrol edilir.
2. `Player.start()` ile `mpv` IPC modunda ayaga kalkar.
3. Favoriler ve playlistler diskten yuklenir.
4. `stdin` raw mode'a alinir.
5. Arama ekrani render edilir.

## State'ler

- `search-input`
- `search-results`
- `playing`
- `favorites`
- `playlist-list`
- `playlist-detail`
- `playlist-picker`
- `new-playlist`
- `rename-playlist`

## Ana Kullanici Akisi

### Arama

- Kullanici query yazar
- `Enter` ile `search()` cagrilir
- Sonuclar `renderResults()` ile listelenir

### Oynatma

- Secilen track `startPlaying()` icinde baslatilir
- `player.loadTrack()` ile `mpv` yeni URL'i yukler
- Player ekrani ilk kez render edilir
- 1 saniyelik timer ile progress ekran guncellemesi yapilir

### Queue ve Mix

- Eger playlistten gelinmediyse `fetchMix()` arka planda calisir
- Ilk mix sonucu kuyruga yazilir
- Track bittiginde `end-file` eventi ile otomatik sonraki sarkiya gecilir
- Kuyruk 5'in altina dusunce `refillQueue()` ek sarki ceker

### History

- Her yeni oynatma onceki `currentTrack`'i history'ye iter
- `P` tusu history'den geri alir
- Geri donulen track mevcut kuyrugun basina geri itilir

## Arama Ekrani Modlari

- `typing`: kullanici query yazar
- `command`: `Esc` sonrasi favori/playlist kisayollari aktif olur

## Playlist Oynatma Farki

Playlist detayinda bir sarki secildiginde kuyruk once playlistteki kalan sarkilarla kurulur. Playlist biterse akisa mix devam eder.

## Render Stratejisi

> [!note]
> Player ekraninda flicker'i azaltmak icin tam ekran temizlemek yerine cursor home + satir bazli temizleme yaklasimi kullaniliyor.
