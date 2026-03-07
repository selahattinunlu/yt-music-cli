# Konfigurasyon Dosyasi

**Oncelik:** P2
**Efor:** M
**Kullanici Degeri:** 6/10

## Tanim

Kullanici tercihlerinin kalici olarak saklanmasi.

## Kabul Kriterleri

- [ ] `~/.config/yt-music-cli/config.json` dosyasi okunur
- [ ] Ayarlanabilir degerler: varsayilan ses seviyesi, arama limiti, kuyruk boyutu, dil
- [ ] Dosya yoksa varsayilan degerlerle olusturulur
- [ ] Gecersiz config durumunda varsayilanlara fallback yapilir

## Teknik Notlar

- Sprint-1'deki favori/gecmis ile ayni dizini paylasir
- Uygulama basinda bir kez okunup global state'e alinacak
