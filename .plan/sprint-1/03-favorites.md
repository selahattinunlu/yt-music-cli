# Favori Sarkilar

**Oncelik:** P1
**Efor:** M
**Kullanici Degeri:** 8/10

## Tanim

Kullanicinin begendigi sarkilari kaydedip sonra tekrar erisebilmesi.

## Kabul Kriterleri

- [x] `F` tusu calan sarkiyi favorilere ekler/cikarir
- [x] Favoriler `~/.config/yt-music-cli/favorites.json` dosyasina kaydedilir
- [x] Player ekraninda sarkinin favori olup olmadigi gosterilir
- [x] Ana menude veya ozel bir tusla favori listesine erisilebilir
- [x] Favori listesinden sarki secilebilir ve calinabilir

## Teknik Notlar

- `~/.config/yt-music-cli/` dizini olusturulacak
- Favori ekleme/cikarma toggle seklinde calisacak
- Favori listesi ayri bir AppState olabilir: `favorites`
