# Ekran Titremesi (Flicker) Duzeltme

**Oncelik:** P1
**Efor:** S
**Kullanici Degeri:** 8/10

## Tanim

Player ekrani her saniye yenilenirken ekranda titreme oluyor. Yazilar anlik kaybolup tekrar geliyor.

## Sebep

`clearScreen()` fonksiyonu `\x1Bc` kullanarak terminal'i tamamen resetliyor. Her saniye cagirilan `renderPlayer` bu reset ile yeniden cizim arasindaki milisaniyelerde bos ekran gosteriyor.

## Cozum

`\x1Bc` yerine:
- `\x1B[H` ile cursor'u ekranin basina tasi
- Icerik yazildiktan sonra `\x1B[J` ile kalan alani temizle

Boylece ekran sifirlanmadan mevcut icerik uzerine yazilir ve titreme olmaz.

## Kabul Kriterleri

- [x] Player ekrani titremeden guncellenir
- [x] Diger ekranlar (arama, sonuclar, favoriler) etkilenmez
- [x] Ekran gecisleri (ornegin player'dan arama'ya) duzgun calisir
