# Ses Seviyesi Kontrolu

**Oncelik:** P0
**Efor:** S
**Kullanici Degeri:** 9/10

## Tanim

Kullanicinin `+` ve `-` tuslariyla ses seviyesini artirip azaltabilmesi.

## Kabul Kriterleri

- [ ] `+` tusu ses seviyesini 5 birim arttirir
- [ ] `-` tusu ses seviyesini 5 birim azaltir
- [ ] Mevcut ses seviyesi player ekraninda gosterilir
- [ ] Ses seviyesi 0-100 araliginda sinirlandirilir

## Teknik Notlar

- mpv IPC uzerinden `set_property volume` komutu kullanilacak
- Player state'e `volume` property'si eklenecek
- `observe_property` ile volume degisiklikleri dinlenecek
