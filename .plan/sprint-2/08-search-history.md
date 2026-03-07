# Arama Gecmisi

**Oncelik:** P1
**Efor:** S
**Kullanici Degeri:** 7/10

## Tanim

Kullanicinin onceki aramalarini hatirlayip hizlica tekrar erisebilmesi.

## Kabul Kriterleri

- [ ] Son 20 arama kaydedilir
- [ ] Arama ekraninda yukari/asagi ok tuslariyla gecmis aramalar arasinda gezilebilir
- [ ] Secilen gecmis arama input'a yazilir ve Enter ile tekrar aranabilir
- [ ] Ayni arama tekrar yapildiginda duplicate eklenmez, en basa tasinir
- [ ] Gecmis `~/.config/yt-music-cli/history.json` dosyasina kaydedilir

## Teknik Notlar

- Arama gecmisi search-input state'inde yukari ok ile aktive olacak
- Gecmis navigasyonu icin ayri bir index tutulacak
- Input bossa yukari ok gecmisi gosterir, doluysa normal davranir
