# Terminal Basligi Guncelleme

**Oncelik:** P2
**Efor:** S
**Kullanici Degeri:** 5/10

## Tanim

Calan sarkinin adini terminal pencere basliginda gostermek.

## Kabul Kriterleri

- [ ] Sarki caldiginda terminal basligi guncellenir (format: "sarkiAdi - yt-music-cli")
- [ ] Sarki duruldugunda veya uygulamadan cikildiginda baslik sifirlanir

## Teknik Notlar

- ANSI escape: `\x1b]0;title\x07`
- Player state degistiginde baslik guncellenir
- Cleanup sirasinda baslik resetlenir
