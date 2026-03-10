---
title: Search History
tags:
  - kb
  - task
task_id: TASK-008
status: planned
priority: P1
effort: S
user_value: 7
area: search
source_path: .plan/sprint-2/08-search-history.md
---

# Search History

## Description

Kullanicinin onceki aramalarini hatirlayip hizlica tekrar erisebilmesi.

## Acceptance Criteria

- [ ] Son 20 arama kaydedilir
- [ ] Arama ekraninda yukari/asagi ok tuslariyla gecmis aramalar arasinda gezilebilir
- [ ] Secilen gecmis arama input'a yazilir ve `Enter` ile tekrar aranabilir
- [ ] Ayni arama tekrar yapildiginda duplicate eklenmez, en basa tasinir
- [ ] Gecmis `~/.config/yt-music-cli/history.json` dosyasina kaydedilir

## Technical Notes

- Search input state'inde ayri bir history index tutulacak
- Input bossa yukari ok gecmisi acacak, doluyken mevcut davranis korunacak
