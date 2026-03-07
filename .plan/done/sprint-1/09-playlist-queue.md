# Playlist Kuyruk Yonetimi

**Oncelik:** P1
**Efor:** M
**Kullanici Degeri:** 8/10

## Tanim

Playlist'ten bir sarki baslatildiginda kuyruga playlist'in kalan sarkilari eklenmeli. Su an playlist'ten calinan sarki sonrasinda YouTube Mix onerileriyle devam ediyor, playlist sarkilari tamamen goz ardi ediliyor.

## Kabul Kriterleri

- [x] Playlist detayinda bir sarki secildiginde, o sarkidan sonraki playlist sarkilari kuyruga eklenir
- [x] Kuyrukta once playlist sarkilari calinir
- [x] Playlist sarkilari bitince YouTube Mix ile devam edilir
- [x] Shuffle modu aktifken playlist sarkilari da karistirilir
- [x] Player ekraninda siradaki sarkilar dogru gosterilir

## Teknik Notlar

- `startPlaying()` fonksiyonuna opsiyonel `remainingTracks?: Track[]` parametresi eklenecek
- `remainingTracks` varsa kuyruk bu sarkilarla doldurulacak, `fetchMix()` sadece playlist bittikten sonra cagrilacak
- `onPlaylistDetailKey` handler'inda secilen sarki sonrasindaki playlist sarkilari `startPlaying()`'e iletilecek
- `end-file` handler'inda kuyruk bosaldiginda ve playlist sarkilari bitmisse `refillQueue()` ile mix'e gecis yapilacak
