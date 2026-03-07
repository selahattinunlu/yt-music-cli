# Playlist Olusturma ve Yonetimi

**Oncelik:** P1
**Efor:** L
**Kullanici Degeri:** 7/10

## Tanim

Kullanicinin kendi playlist'lerini olusturup yonetebilmesi.

## Kabul Kriterleri

- [x] Yeni playlist olusturulabilir (isim verilebilir)
- [x] Calan sarki bir playlist'e eklenebilir
- [x] Playlist listesi gorutulenebilir
- [x] Playlist icindeki sarkilar listelenebilir
- [x] Playlist'ten sarki calinabilir
- [x] Playlist'ten sarki silinebilir
- [x] Playlist silinebilir
- [x] Veriler `~/.config/yt-music-cli/playlists.json` dosyasina kaydedilir

## Teknik Notlar

- Playlist yapisi: `{ id, name, tracks: Track[], createdAt }`
- Yeni AppState'ler gerekebilir: `playlist-list`, `playlist-detail`
- Favori altyapisiyla ayni config dizinini paylasacak
