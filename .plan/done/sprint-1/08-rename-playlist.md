# Playlist Yeniden Adlandirma

**Oncelik:** P1
**Efor:** S
**Kullanici Degeri:** 5/10

## Tanim

Kullanicinin mevcut bir playlist'in ismini degistirebilmesi.

## Kabul Kriterleri

- [x] Playlist listesinde bir tus ile yeniden adlandirma moduna girilebilir
- [x] Mevcut isim gosterilir ve uzerine yazilabilir
- [x] Enter ile yeni isim kaydedilir
- [x] Esc ile isim degisikligi iptal edilir
- [x] Degisiklik `playlists.json` dosyasina yansir

## Teknik Notlar

- Playlist listesi ekraninda `R` tusu kullanilabilir
- Yeni bir AppState (`rename-playlist`) gerekebilir veya mevcut `new-playlist` state'i yeniden kullanilabilir
- `config.ts`'e `renamePlaylist(playlists, id, newName)` fonksiyonu eklenecek
