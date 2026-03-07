# Playlist Olusturma ve Yonetimi

**Oncelik:** P1
**Efor:** L
**Kullanici Degeri:** 7/10

## Tanim

Kullanicinin kendi playlist'lerini olusturup yonetebilmesi.

## Kabul Kriterleri

- [ ] Yeni playlist olusturulabilir (isim verilebilir)
- [ ] Calan sarki bir playlist'e eklenebilir
- [ ] Playlist listesi gorutulenebilir
- [ ] Playlist icindeki sarkilar listelenebilir
- [ ] Playlist'ten sarki calinabilir
- [ ] Playlist'ten sarki silinebilir
- [ ] Playlist silinebilir
- [ ] Veriler `~/.config/yt-music-cli/playlists.json` dosyasina kaydedilir

## Teknik Notlar

- Playlist yapisi: `{ id, name, tracks: Track[], createdAt }`
- Yeni AppState'ler gerekebilir: `playlist-list`, `playlist-detail`
- Favori altyapisiyla ayni config dizinini paylasacak
