---
title: Development Workflow
tags:
  - kb
  - development
  - operations
---

# Development Workflow

## Gunluk Komutlar

- Gelistirme: `bun run dev`
- Baslatma: `bun src/index.ts`
- Build: `bun run build`

## Gelistirme Notlari

- Proje Bun tabanli; komutlarda `npm`, `pnpm` veya `node` yerine Bun tercih ediliyor
- Calisma icin sistemde `mpv` ve `yt-dlp` olmali
- Test korumasi su anda agirlikla manuel checklist uzerinden yurutuluyor

## Release Akisi

1. Uygulamayi lokalden kontrol et
2. Platform binary'lerini build et
3. Versiyonlari senkron bump et
4. Commit + push yap
5. Git tag push ederek GitHub Actions release'i tetikle

## Packaging Modeli

- Ana paket: `yt-music-cli`
- Platform paketleri: `npm/darwin-*`, `npm/linux-*`, `npm/win32-*`
- `bin/yt-music` dogru platform binary'sini resolve ediyor

## Operasyon Kaynaklari

- Release rehberi: `docs/releasing.md`
- Changelog: `CHANGELOG.md`
- Manuel test listesi: `docs/manual-test-checklist.md`

## Dokumantasyon Disiplini

> [!tip]
> Yeni ozellik eklendiginde sadece kod degil; README, changelog, manuel test checklist ve bu knowledge base tarafinda da yansima dusunulmeli.
