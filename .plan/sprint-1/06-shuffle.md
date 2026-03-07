# Shuffle (Karistirma) Modu

**Oncelik:** P1
**Efor:** S
**Kullanici Degeri:** 6/10

## Tanim

Kuyruktaki sarkilarin sirasini karistirabilme.

## Kabul Kriterleri

- [ ] `X` tusu shuffle modunu toggle eder
- [ ] Shuffle aktifken kuyruk karistirilir
- [ ] Yeni sarkilar kuyruya eklendikce de karistirma uygulanir
- [ ] Player ekraninda shuffle durumu gosterilir (acik/kapali)

## Teknik Notlar

- Fisher-Yates shuffle algoritmasi kullanilacak
- Shuffle toggle'landiginda mevcut kuyruk aninda karistirilacak
- `fetchingMix` sonrasi gelen sarkilar da shuffle aktifse karistirilacak
