# Repeat / Tekrar Modu

**Oncelik:** P2
**Efor:** S
**Kullanici Degeri:** 6/10

## Tanim

Tek sarki veya tum kuyruk icin tekrar modu.

## Kabul Kriterleri

- [ ] `R` tusu tekrar modunu degistirir: off -> tek sarki -> kuyruk -> off
- [ ] Tek sarki modunda sarki bitince ayni sarki tekrar baslar
- [ ] Kuyruk modunda kuyruk bitince bastan baslar
- [ ] Player ekraninda tekrar modu gosterilir

## Teknik Notlar

- `repeatMode: 'off' | 'one' | 'all'` state'i eklenecek
- `end-file` event handler'inda repeat moduna gore davranis degisecek
