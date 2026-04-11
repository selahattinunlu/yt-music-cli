---
title: Lyrics View
tags:
  - kb
  - task
task_id: TASK-003
status: in-progress
priority: P2
effort: M
user_value: 7
area: player
source_path: .plan/sprint-2/03-lyrics.md
---

# Lyrics View

## Description

Calan sarkinin sozlerini terminal ekraninda gostermek.

## Acceptance Criteria

- [x] `L` tusu sarki sozleri ekranini acar/kapatir
- [x] Sozler harici bir API'den cekilir
- [x] Sozler bulunamazsa kullaniciya bilgi verilir
- [x] Sozler scroll edilebilir

## Technical Notes

- Lyrics API secenekleri: lyrics.ovh veya `yt-dlp` subtitle destegi
- Yeni AppState: `lyrics` veya player icinde alt gorunum
- API rate limit ve hata durumlari yonetilmeli

## Implementation Notes

Design spec: `knowledge-base/Specs/2026-04-11-lyrics-view-design.md`
Plan: `knowledge-base/Plans/2026-04-11-lyrics-view-plan.md`

Lyrics kaynagi LRCLIB. `L` tusu playing state'te lyrics toggle ediyor; Favoriler `H`'ye tasindi. Scroll sadece plain (synced olmayan) sozler icin calisir; synced sozler auto-follow ile ilerler.
