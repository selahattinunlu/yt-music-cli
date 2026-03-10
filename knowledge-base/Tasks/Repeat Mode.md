---
title: Repeat Mode
tags:
  - kb
  - task
task_id: TASK-001
status: planned
priority: P2
effort: S
user_value: 6
area: player
source_path: .plan/sprint-2/01-repeat-mode.md
---

# Repeat Mode

## Description

Tek sarki veya tum kuyruk icin tekrar modu eklenmesi.

## Acceptance Criteria

- [ ] `R` tusu tekrar modunu degistirir: off -> tek sarki -> kuyruk -> off
- [ ] Tek sarki modunda sarki bitince ayni sarki tekrar baslar
- [ ] Kuyruk modunda kuyruk bitince bastan baslar
- [ ] Player ekraninda tekrar modu gosterilir

## Technical Notes

- `repeatMode: 'off' | 'one' | 'all'` state'i eklenecek
- `end-file` event handler'inda repeat moduna gore davranis degisecek
