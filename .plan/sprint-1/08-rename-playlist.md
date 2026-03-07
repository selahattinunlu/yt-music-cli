# Playlist Yeniden Adlandirma

**Oncelik:** P1
**Efor:** S
**Kullanici Degeri:** 5/10

## Tanim

Kullanicinin mevcut bir playlist'in ismini degistirebilmesi.

## Kabul Kriterleri

- [ ] Playlist listesinde bir tus ile yeniden adlandirma moduna girilebilir
- [ ] Mevcut isim gosterilir ve uzerine yazilabilir
- [ ] Enter ile yeni isim kaydedilir
- [ ] Esc ile isim degisikligi iptal edilir
- [ ] Degisiklik `playlists.json` dosyasina yansir

## Teknik Notlar

- Playlist listesi ekraninda `R` tusu kullanilabilir
- Yeni bir AppState (`rename-playlist`) gerekebilir veya mevcut `new-playlist` state'i yeniden kullanilabilir
- `config.ts`'e `renamePlaylist(playlists, id, newName)` fonksiyonu eklenecek
