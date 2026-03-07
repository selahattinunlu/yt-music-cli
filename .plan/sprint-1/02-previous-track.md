# Onceki Sarkiya Donme

**Oncelik:** P1
**Efor:** S
**Kullanici Degeri:** 8/10

## Tanim

Kullanicinin `P` tusuyla bir onceki sarkiya donebilmesi.

## Kabul Kriterleri

- [ ] `P` tusu onceki sarkiyi calar
- [ ] Sarki gecmisi (history) tutulur
- [ ] Gecmis bossa `P` tusu bir sey yapmaz
- [ ] Onceki sarkiya donunce mevcut sarki gecmisin basina eklenir

## Teknik Notlar

- `history: Track[]` array'i tutulacak
- Her yeni sarki calmaya basladiginda mevcut sarki history'e push edilecek
- `P` tusuna basildiginda history'den pop edilip calinacak
