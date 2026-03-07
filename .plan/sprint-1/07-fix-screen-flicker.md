# Ekran Titremesi (Flicker) Duzeltme

**Oncelik:** P1
**Efor:** S
**Kullanici Degeri:** 8/10

## Tanim

Player ekrani her saniye yenilenirken ekranda titreme oluyor. Yazilar anlik kaybolup tekrar geliyor.

## Sebep

`clearScreen()` fonksiyonu `\x1Bc` kullanarak terminal'i tamamen resetliyor. Her saniye cagirilan `renderPlayer` bu reset ile yeniden cizim arasindaki milisaniyelerde bos ekran gosteriyor.

## Cozum

1. Tum render fonksiyonlari tek bir `process.stdout.write()` cagrisina donusturuldu (atomic write)
2. `renderPlayer` icin `\x1B[H` (cursor home) + satir bazli `\x1B[K` (clear to EOL) + `\x1B[J` (clear below) kullanildi
3. `player.on('state')` event'inden render cagrisi kaldirildi — render sadece 1sn timer ile yapiliyor

## Kabul Kriterleri

- [x] Player ekrani titremeden guncellenir
- [x] Diger ekranlar (arama, sonuclar, favoriler) etkilenmez
- [x] Ekran gecisleri (ornegin player'dan arama'ya) duzgun calisir
