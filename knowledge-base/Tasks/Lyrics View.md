---
title: Lyrics View
tags:
  - kb
  - task
task_id: TASK-003
status: planned
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

- [ ] `L` tusu sarki sozleri ekranini acar/kapatir
- [ ] Sozler harici bir API'den cekilir
- [ ] Sozler bulunamazsa kullaniciya bilgi verilir
- [ ] Sozler scroll edilebilir

## Technical Notes

- Lyrics API secenekleri: lyrics.ovh veya `yt-dlp` subtitle destegi
- Yeni AppState: `lyrics` veya player icinde alt gorunum
- API rate limit ve hata durumlari yonetilmeli
