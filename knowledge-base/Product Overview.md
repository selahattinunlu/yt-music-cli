---
title: Product Overview
tags:
  - kb
  - product
  - features
---

# Product Overview

`yt-music-cli`, terminal icinde YouTube uzerinden muzik aratip calmaya odaklanan hafif bir CLI uygulamasi.

## Problem

Tarayici acmadan, reklam ve gorsel dikkat dagitici unsurlar olmadan hizli muzik oynatma deneyimi sunmak.

## Cekirdek Deger Onermesi

- Terminalden ayrilmadan muzik arama ve oynatma
- Indirme yapmadan stream etme
- Oynatma sonrasi otomatik mix ile akisi surdurme
- Favori ve playlist gibi hafif kutuphane ozellikleri

## Mevcut Ozellikler

- Arama ve secili sonucu oynatma
- Pause/resume, seek, next, previous
- Otomatik radio mix kuyrugu
- Favorilere ekleme ve favori listesinden calma
- Playlist olusturma, yeniden adlandirma, silme
- Playlist'e sarki ekleme ve playlist detayindan calma
- Shuffle modu
- Ses seviyesi gosterimi ve kontrolu

## Temel Harici Bagimliliklar

- `mpv`: ses oynatma ve runtime kontrolu
- `yt-dlp`: YouTube arama ve mix metadata cekme
- Bun runtime

## Kullanim Modeli

1. Kullanici arama ekraninda sorgu girer.
2. Sonuclar listelenir.
3. Secilen sarki `mpv` ile calmaya baslar.
4. Arka planda ilgili mix sarkilari kuyruga doldurulur.
5. Kullanici player, favori veya playlist ekranlari arasinda gecer.

## Durum

> [!success]
> Proje calisir durumda bir CLI muzik oynatici sunuyor; playlist, favori ve history gibi temel retention ozellikleri mevcut.

## Surum Notlari Ozeti

- `v0.1.1`: ilk release, arama + player + mix
- `v0.2.0`: previous track, favorites, playlists, shuffle, arama kisayollari
- `v0.2.1`: platform package resolution fix
