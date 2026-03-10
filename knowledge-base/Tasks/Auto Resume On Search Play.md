---
title: Auto Resume On Search Play
tags:
  - kb
  - task
task_id: TASK-009
status: planned
priority: P2
effort: XS
user_value: 5
area: player
source_path: .plan/sprint-2/09-auto-unpause-on-search-play.md
---

# Auto Resume On Search Play

## Description

Sarki duraklatilmis durumdayken arama ekranindan yeni bir sarki secilirse otomatik olarak calmaya gecmesi.

## Acceptance Criteria

- [ ] Sarki duraklatilmis iken `S` ile arama ekranina gidilir
- [ ] Arama yapilip `Enter` ile yeni sarki secilir
- [ ] Yeni sarki otomatik olarak calmaya baslar

## Technical Notes

- `startPlaying()` sonrasinda pause state reset davranisi dogrulanmali
- `mpv` yeni track yuklendiginde zaten auto-play yapiyor olabilir; manuel test gerekli
