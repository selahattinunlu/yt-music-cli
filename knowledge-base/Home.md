---
title: Knowledge Base Home
tags:
  - kb
  - project
  - index
aliases:
  - yt-music-cli KB
  - Ana Sayfa
---

# yt-music-cli Knowledge Base

Bu vault, `yt-music-cli` projesinin urun, mimari, akis ve operasyon bilgisini tek yerde toplar.

## Baslangic

- [[Product Overview]]
- [[Architecture]]
- [[Runtime Flow]]
- [[Data Model]]
- [[Development Workflow]]
- [[Roadmap]]
- `Tasks.base`

> [!note]
> Bu knowledge base, repo icindeki mevcut kod ve dokumantasyon baz alinarak hazirlandi.

## Hedef

- Projeye yeni giren birinin sistemi hizli anlamasi
- Kod tarafindaki sorumluluklari dosya bazinda gorebilmek
- Gelistirme ve release akislarini tek yerde toplamak
- Planlanan isleri mevcut urun davranisindan ayirmak

## Hizli Baglam

- Urun: Terminal icinde YouTube Music oynatici
- Runtime: Bun + `mpv` + `yt-dlp`
- Giris noktasi: `src/index.ts`
- UI: ANSI terminal render katmani (`src/ui.ts`)
- Oynatici kontrolu: mpv IPC (`src/player.ts`)
- Arama ve mix: `yt-dlp` wrapper (`src/search.ts`)
- Kalici veri: `~/.config/yt-music-cli`

## Kaynaklar

- README: `README.md`
- Release notlari: `CHANGELOG.md`
- Release akisi: `docs/releasing.md`
- Manuel testler: `docs/manual-test-checklist.md`
- Task tracker: `knowledge-base/Tasks.base`
- Tarihsel kaynak path'ler task notlarindaki `source_path` alaninda tutuluyor
