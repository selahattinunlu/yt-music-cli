# Arama ile Sarki Secildiginde Otomatik Devam

**Oncelik:** P2
**Efor:** XS
**Kullanici Degeri:** 5/10

## Tanim

Sarki duraklatilmis durumdayken arama ekraninden yeni bir sarki secilirse, otomatik olarak play moduna gecip calmaya baslamali.

## Kabul Kriterleri

- [ ] Sarki duraklatilmis iken S ile arama ekranina gidilir
- [ ] Arama yapilip Enter ile yeni sarki secilir
- [ ] Yeni sarki otomatik olarak calmaya baslar (pause durumunda kalmaz)

## Teknik Notlar

- `startPlaying()` fonksiyonunda `player.loadTrack()` sonrasi pause durumunun sifirlandigini dogrulamak yeterli olabilir
- mpv yeni track yuklendiginde otomatik play'e gecer, mevcut davranisi test etmek lazim
