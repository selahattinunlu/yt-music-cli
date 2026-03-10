---
title: Terminal Title
tags:
  - kb
  - task
task_id: TASK-006
status: planned
priority: P2
effort: S
user_value: 5
area: ui
source_path: .plan/sprint-2/06-terminal-title.md
---

# Terminal Title

## Description

Calan sarkinin adini terminal pencere basliginda gostermek.

## Acceptance Criteria

- [ ] Sarki caldiginda terminal basligi guncellenir (`sarkiAdi - yt-music-cli`)
- [ ] Sarki durdugunda veya uygulamadan cikildiginda baslik sifirlanir

## Technical Notes

- ANSI escape: `\x1b]0;title\x07`
- Player state degistiginde baslik guncellenmeli
- Cleanup sirasinda baslik resetlenmeli
