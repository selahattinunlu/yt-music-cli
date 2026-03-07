# Arama Ekranindan Geri Donme

**Oncelik:** P1
**Efor:** S
**Kullanici Degeri:** 8/10

## Tanim

Arama ekranina gidildikten sonra arama yapmaktan vazgecildiginde geri donulemiyor. Kullanici Esc veya baska bir tusla onceki ekrana (player) donebilmeli.

## Kabul Kriterleri

- [ ] Arama ekraninda Esc tusuna basildiginda onceki ekrana geri donulur
- [ ] Geri donuldugunde calan sarki etkilenmez
- [ ] Input'a yazi yazilmissa Esc ile temizlenmeden dogrudan geri donulur

## Teknik Notlar

- `search-input` state'inde Esc key handler'i eklenecek
- Eger sarki caliyorsa `player` state'ine, calmiyorsa `idle` state'ine donulmeli
